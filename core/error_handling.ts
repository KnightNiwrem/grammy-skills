/**
 * Error Handling Patterns
 *
 * This example demonstrates comprehensive error handling strategies in grammY:
 * - Global error handlers using bot.catch()
 * - Try-catch in handlers
 * - Error boundaries with middleware
 * - Graceful degradation
 * - User-friendly error messages
 *
 * @module
 */

import { Bot, type Context, GrammyError, HttpError } from "grammy";

/**
 * Global error handler using bot.catch().
 *
 * This catches all unhandled errors in the bot.
 * It should be used as a last resort after other error handling.
 */
function setupGlobalErrorHandler(bot: Bot): void {
  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);

    const error = err.error;

    // Handle grammY-specific errors
    if (error instanceof GrammyError) {
      console.error("Error in request:", error.description);
      console.error("Error code:", error.error_code);
    } // Handle HTTP errors (network issues, etc.)
    else if (error instanceof HttpError) {
      console.error("Could not contact Telegram:", error);
    } // Handle unknown errors
    else {
      console.error("Unknown error:", error);
    }
  });
}

/**
 * Error boundary middleware that catches errors in specific handlers.
 *
 * This allows for more granular error handling than the global error handler.
 */
export async function errorBoundary(
  ctx: Context,
  next: () => Promise<void>,
): Promise<void> {
  try {
    await next();
  } catch (error) {
    console.error("Error in middleware chain:", error);

    // Send user-friendly error message
    try {
      await ctx.reply(
        "An error occurred while processing your request. " +
          "Our team has been notified.",
      );
    } catch (replyError) {
      // Even replying failed, log it
      console.error("Failed to send error message to user:", replyError);
    }
  }
}

/**
 * Demonstrates proper error handling in a command handler.
 *
 * This pattern uses try-catch to handle expected errors gracefully.
 */
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

    // Validate inputs
    if (isNaN(num1) || isNaN(num2)) {
      await ctx.reply("Both arguments must be valid numbers.");
      return;
    }

    // Check for division by zero
    if (num2 === 0) {
      await ctx.reply("Error: Cannot divide by zero.");
      return;
    }

    const result = num1 / num2;
    await ctx.reply(`${num1} ÷ ${num2} = ${result}`);
  } catch (error) {
    // Log the error for debugging
    console.error("Error in divide command:", error);

    // Send user-friendly message
    await ctx.reply(
      "An unexpected error occurred. Please try again later.",
    );
  }
}

/**
 * Demonstrates handling API errors when calling Telegram methods.
 *
 * Some Telegram API calls may fail (e.g., user blocked the bot,
 * insufficient permissions, etc.)
 */
async function handleSendPhotoCommand(ctx: Context): Promise<void> {
  try {
    // Example: sending a photo by URL
    await ctx.replyWithPhoto(
      "https://example.com/photo.jpg",
      { caption: "Here's your photo!" },
    );
  } catch (error) {
    if (error instanceof GrammyError) {
      // Handle specific Telegram API errors
      if (error.error_code === 400) {
        await ctx.reply(
          "The photo URL is invalid or the image cannot be loaded.",
        );
      } else if (error.error_code === 403) {
        console.log("Bot was blocked by the user");
        // Don't reply since we can't send messages to this user
      } else {
        await ctx.reply(
          `Failed to send photo: ${error.description}`,
        );
      }
    } else {
      console.error("Unexpected error:", error);
      await ctx.reply(
        "An unexpected error occurred while sending the photo.",
      );
    }
  }
}

/**
 * Demonstrates retry logic for transient failures.
 *
 * This is useful for handling temporary network issues or rate limits.
 */
async function sendWithRetry(
  fn: () => Promise<void>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await fn();
      return; // Success
    } catch (error) {
      lastError = error;

      if (error instanceof HttpError && attempt < maxRetries) {
        // Wait before retrying
        console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      throw error; // Not retryable or max retries reached
    }
  }

  throw lastError;
}

/**
 * Command demonstrating retry logic.
 */
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
    // Error already logged, just inform the user if possible
    try {
      await ctx.reply(
        "Service temporarily unavailable. Please try again later.",
      );
    } catch {
      // Can't even send error message
      console.error("Failed to notify user of error");
    }
  }
}

/**
 * Demonstrates input validation and sanitization.
 *
 * Proper validation prevents many errors before they occur.
 */
function validateUserInput(input: string): { valid: boolean; error?: string } {
  if (!input || input.trim().length === 0) {
    return { valid: false, error: "Input cannot be empty." };
  }

  if (input.length > 200) {
    return { valid: false, error: "Input is too long (max 200 characters)." };
  }

  // Check for potentially malicious input
  if (/<script|javascript:/i.test(input)) {
    return { valid: false, error: "Invalid input detected." };
  }

  return { valid: true };
}

/**
 * Command demonstrating input validation.
 */
async function handleValidatedCommand(ctx: Context): Promise<void> {
  const input = ctx.match?.toString().trim() ?? "";

  const validation = validateUserInput(input);

  if (!validation.valid) {
    await ctx.reply(`Validation error: ${validation.error}`);
    return;
  }

  // Process validated input
  await ctx.reply(`You submitted: ${input}`);
}

/**
 * Creates a bot with comprehensive error handling.
 */
export function createErrorHandlingBot(token: string): Bot {
  const bot = new Bot(token);

  // Setup global error handler
  setupGlobalErrorHandler(bot);

  // Add error boundary middleware
  bot.use(errorBoundary);

  // Register commands
  bot.command("divide", handleDivideCommand);
  bot.command("sendphoto", handleSendPhotoCommand);
  bot.command("unstable", handleUnstableCommand);
  bot.command("validate", handleValidatedCommand);

  // Command that intentionally throws an error to demonstrate error handling
  bot.command("error", () => {
    throw new Error("This is a test error");
  });

  bot.command("help", (ctx) => {
    return ctx.reply(
      "Error Handling Demo Commands:\n\n" +
        "/divide <num> <num> - Division with error handling\n" +
        "/sendphoto - Handle API errors\n" +
        "/unstable - Retry logic demo\n" +
        "/validate <text> - Input validation\n" +
        "/error - Trigger test error",
    );
  });

  return bot;
}

// Example usage
if (import.meta.main) {
  const token = Deno.env.get("BOT_TOKEN");

  if (!token) {
    console.error("BOT_TOKEN environment variable is required");
    Deno.exit(1);
  }

  const bot = createErrorHandlingBot(token);
  console.log("Error handling bot is starting...");
  bot.start();
}
