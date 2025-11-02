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

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is required");

const bot = new Bot(token);

async function errorBoundary(
  ctx: Context,
  next: () => Promise<void>,
): Promise<void> {
  try {
    await next();
  } catch (error) {
    console.error("Error in middleware chain:", error);
    try {
      await ctx.reply(
        "An error occurred while processing your request. " +
          "Our team has been notified.",
      );
    } catch (replyError) {
      console.error("Failed to send error message to user:", replyError);
    }
  }
}

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

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const error = err.error;

  if (error instanceof GrammyError) {
    console.error("Error in request:", error.description);
    console.error("Error code:", error.error_code);
  } else if (error instanceof HttpError) {
    console.error("Could not contact Telegram:", error);
  } else {
    console.error("Unknown error:", error);
  }
});

bot.use(errorBoundary);

bot.command("divide", handleDivideCommand);
bot.command("sendphoto", handleSendPhotoCommand);
bot.command("unstable", handleUnstableCommand);
bot.command("validate", handleValidatedCommand);

bot.command("error", () => {
  throw new Error("This is a test error");
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "Error Handling Demo Commands:\n\n" +
      "/divide <num> <num> - Division with error handling\n" +
      "/sendphoto - Handle API errors\n" +
      "/unstable - Retry logic demo\n" +
      "/validate <text> - Input validation\n" +
      "/error - Trigger test error",
  );
});

bot.start();
