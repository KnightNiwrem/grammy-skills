/**
 * Error Handling Patterns
 *
 * This example demonstrates comprehensive error handling strategies in grammY:
 * - Try-catch in handlers
 * - Error boundaries with Composer.errorBoundary()
 * - Graceful degradation
 * - Logging errors to stderr
 * - Using Composer pattern for error boundaries
 *
 * @module
 */

import {
  Bot,
  Composer,
  type Context,
  GrammyError,
  HttpError,
} from "https://deno.land/x/grammy@v1.30.0/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is required");

const bot = new Bot(token);

function errorHandler(error: Error): void {
  console.error("Error in middleware chain:", error);
}

// Create composer with error boundary protection
const composer = new Composer();
const protectedComposer = composer.errorBoundary(errorHandler);

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
    console.error("Error in divide command:", error);
    await ctx.reply(
      "An unexpected error occurred. Please try again later.",
    );
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
        await ctx.reply(
          "The photo URL is invalid or the image cannot be loaded.",
        );
      } else if (error.error_code === 403) {
        console.log("Bot was blocked by the user");
      } else {
        await ctx.reply(`Failed to send photo: ${error.description}`);
      }
    } else {
      console.error("Unexpected error:", error);
      await ctx.reply(
        "An unexpected error occurred while sending the photo.",
      );
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
    try {
      await ctx.reply(
        "Service temporarily unavailable. Please try again later.",
      );
    } catch {
      console.error("Failed to notify user of error");
    }
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

// Add middleware to protected composer
protectedComposer.command("divide", handleDivideCommand);
protectedComposer.command("sendphoto", handleSendPhotoCommand);
protectedComposer.command("unstable", handleUnstableCommand);
protectedComposer.command("validate", handleValidatedCommand);

protectedComposer.command("error", () => {
  throw new Error("This is a test error");
});

protectedComposer.command("help", async (ctx) => {
  await ctx.reply(
    "Error Handling Demo Commands:\n\n" +
      "/divide <num> <num> - Division with error handling\n" +
      "/sendphoto - Handle API errors\n" +
      "/unstable - Retry logic demo\n" +
      "/validate <text> - Input validation\n" +
      "/error - Trigger test error",
  );
});

// Use the base composer (not the protected one) as per the pattern
bot.use(composer);

bot.start();
