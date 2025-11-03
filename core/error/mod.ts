/**
 * Error Handling Patterns
 *
 * This example demonstrates comprehensive error handling strategies in grammY:
 * - Try-catch in handlers
 * - Error boundaries with Composer.errorBoundary()
 * - Error handlers that call next() vs suppress errors
 * - Proper errorBoundary function signature with BotError and NextFunction
 * - Logging errors to stderr without API calls in error handlers
 *
 * @module
 */

import {
  Bot,
  type BotError,
  Composer,
  type Context,
  GrammyError,
  HttpError,
  type NextFunction,
} from "https://deno.land/x/grammy@v1.30.0/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is required");

const bot = new Bot(token);

// Error handler that logs but continues execution by calling next()
// This allows the error boundary to catch the error but still let
// subsequent middleware run
function errorHandlerWithContinue(
  error: BotError<Context>,
  next: NextFunction,
): void {
  console.error("Error caught but continuing:", error.error);
  console.error("Error context - update ID:", error.ctx.update.update_id);
  // Call next() to continue middleware execution
  next();
}

// Error handler that suppresses errors (doesn't call next)
// This prevents the error from bubbling up and stops middleware execution
function errorHandlerSuppress(
  error: BotError<Context>,
  _next: NextFunction,
): void {
  console.error("Error caught and suppressed:", error.error);
  // Do NOT call next() - this suppresses the error and stops the chain
}

// Create two composers to demonstrate different error boundary behaviors
const baseComposer = new Composer();

// Composer with continue-on-error behavior
const continueComposer = baseComposer.errorBoundary(errorHandlerWithContinue);

// Composer with suppress-error behavior
const suppressComposer = continueComposer.errorBoundary(errorHandlerSuppress);

// Command handlers that demonstrate different error scenarios
async function handleDivideCommand(ctx: Context): Promise<void> {
  try {
    const args = ctx.match?.toString().trim().split(/\s+/);

    if (!args || args.length !== 2) {
      await ctx.reply("Usage: /divide <number> <number>");
      return;
    }

    const [num1Str, num2Str] = args;
    const num1 = parseFloat(num1Str);
    const num2 = parseFloat(num2Str);

    if (isNaN(num1) || isNaN(num2)) {
      await ctx.reply("Both arguments must be valid numbers.");
      return;
    }

    if (num2 === 0) {
      await ctx.reply("Error: Cannot divide by zero.");
      return;
    }

    const result = num1 / num2;
    await ctx.reply(`${num1} ÷ ${num2} = ${result}`);
  } catch (error) {
    // This will be caught by the error boundary
    console.error("Error in divide command:", error);
    // No ctx.reply here - we don't make API calls in error handlers
  }
}

async function handleSendPhotoCommand(ctx: Context): Promise<void> {
  try {
    await ctx.replyWithPhoto(
      "https://example.com/photo.jpg",
      { caption: "Here's your photo!" },
    );
  } catch (error) {
    if (error instanceof GrammyError) {
      if (error.error_code === 400) {
        console.error(
          "The photo URL is invalid or the image cannot be loaded.",
        );
      } else if (error.error_code === 403) {
        console.log("Bot was blocked by the user");
      } else {
        console.error(`Failed to send photo: ${error.description}`);
      }
    } else {
      console.error("Unexpected error:", error);
    }
  }
}

async function sendWithRetry(
  fn: () => Promise<void>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await fn();
      return;
    } catch (error) {
      lastError = error;

      if (error instanceof HttpError && attempt < maxRetries) {
        console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

async function handleUnstableCommand(ctx: Context): Promise<void> {
  try {
    await sendWithRetry(
      async () => {
        await ctx.reply("This message is sent with retry logic.");
      },
      3,
      1000,
    );
  } catch (error) {
    console.error("Failed after retries:", error);
  }
}

function validateUserInput(input: string): { valid: boolean; error?: string } {
  if (!input || input.trim().length === 0) {
    return { valid: false, error: "Input cannot be empty." };
  }

  if (input.length > 200) {
    return { valid: false, error: "Input is too long (max 200 characters)." };
  }

  if (/<script|javascript:/i.test(input)) {
    return { valid: false, error: "Invalid input detected." };
  }

  return { valid: true };
}

async function handleValidatedCommand(ctx: Context): Promise<void> {
  const input = ctx.match?.toString().trim() ?? "";
  const validation = validateUserInput(input);

  if (!validation.valid) {
    await ctx.reply(`Validation error: ${validation.error}`);
    return;
  }

  await ctx.reply(`You submitted: ${input}`);
}

// Demonstrate the difference between error boundaries:
// 1. Commands on suppressComposer will have their errors suppressed
suppressComposer.command("divide", handleDivideCommand);
suppressComposer.command("sendphoto", handleSendPhotoCommand);

// 2. Commands on continueComposer will continue after errors
continueComposer.command("unstable", handleUnstableCommand);
continueComposer.command("validate", handleValidatedCommand);

// Test error that will be handled differently based on which composer
suppressComposer.command("suppress_error", () => {
  throw new Error("This error will be suppressed - won't bubble up");
});

continueComposer.command("continue_error", () => {
  throw new Error("This error will be logged but middleware continues");
});

// Help command to explain the different behaviors
suppressComposer.command("help", async (ctx) => {
  await ctx.reply(
    "Error Handling Demo - Different Error Boundary Behaviors:\n\n" +
      "**Suppressed Errors (error boundary stops chain):**\n" +
      "/divide <num> <num> - Division with error handling (suppressed)\n" +
      "/sendphoto - Handle API errors (suppressed)\n" +
      "/suppress_error - Test suppressed error\n\n" +
      "**Continuing Errors (error boundary continues):**\n" +
      "/unstable - Retry logic demo (continues after error)\n" +
      "/validate <text> - Input validation (continues after error)\n" +
      "/continue_error - Test continuing error\n\n" +
      "**Key Difference:**\n" +
      "• Suppressed: errors stop middleware execution after the error boundary\n" +
      "• Continuing: errors are logged but middleware chain continues",
  );
});

// Use the base composer which contains both error boundaries
// The order matters: suppressComposer is nested inside continueComposer
bot.use(suppressComposer);

bot.start();
