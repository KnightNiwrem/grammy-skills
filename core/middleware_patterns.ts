/**
 * Middleware Patterns
 *
 * This example demonstrates various middleware patterns in grammY, including:
 * - Custom middleware functions
 * - Middleware composition
 * - Logging middleware
 * - Authentication middleware
 * - Error boundaries
 *
 * Middleware in grammY processes updates in a stack-like manner.
 * Each middleware can either handle the update or pass it to the next middleware.
 *
 * @module
 */

import { Bot, type Context, type NextFunction } from "grammy";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is required");

const bot = new Bot(token);

async function loggingMiddleware(
  ctx: Context,
  next: NextFunction,
): Promise<void> {
  const updateType = ctx.update.message ? "message" : "other";
  const userId = ctx.from?.id ?? "unknown";
  const username = ctx.from?.username ?? "no username";

  console.log(
    `[${new Date().toISOString()}] ${updateType} from ${userId} (@${username})`,
  );

  await next();
}

async function responseTimeMiddleware(
  _ctx: Context,
  next: NextFunction,
): Promise<void> {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`Request processed in ${duration}ms`);
}

function authenticationMiddleware(
  allowedUserIds: Set<number>,
): (ctx: Context, next: NextFunction) => Promise<void> {
  return async (ctx: Context, next: NextFunction): Promise<void> => {
    const userId = ctx.from?.id;

    if (!userId || !allowedUserIds.has(userId)) {
      await ctx.reply("You are not authorized to use this bot.");
      return;
    }

    await next();
  };
}

async function errorHandlingMiddleware(
  ctx: Context,
  next: NextFunction,
): Promise<void> {
  try {
    await next();
  } catch (error) {
    console.error("Error processing update:", error);
    await ctx.reply(
      "An error occurred while processing your request. Please try again later.",
    );
  }
}

const allowedUsers = new Set([123456789, 987654321]);

bot.use(errorHandlingMiddleware);
bot.use(loggingMiddleware);
bot.use(responseTimeMiddleware);
bot.use(authenticationMiddleware(allowedUsers));

bot.command("start", async (ctx) => {
  await ctx.reply("Welcome, authorized user!");
});

bot.command("status", async (ctx) => {
  await ctx.reply("Bot is running and you are authenticated.");
});

bot.on("message:text", async (ctx) => {
  await ctx.reply(`Echo: ${ctx.message.text}`);
});

bot.start();
