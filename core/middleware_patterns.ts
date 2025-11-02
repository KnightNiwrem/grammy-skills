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

/**
 * Logging middleware that logs all incoming updates.
 *
 * This middleware demonstrates:
 * - Accessing context properties
 * - Calling next() to pass control to subsequent middleware
 * - Side effects without blocking the middleware chain
 *
 * @param ctx - The context object containing update information
 * @param next - Function to call the next middleware in the stack
 */
export async function loggingMiddleware(
  ctx: Context,
  next: NextFunction,
): Promise<void> {
  // Log information about the incoming update
  const updateType = ctx.update.message ? "message" : "other";
  const userId = ctx.from?.id ?? "unknown";
  const username = ctx.from?.username ?? "no username";

  console.log(
    `[${new Date().toISOString()}] ${updateType} from ${userId} (@${username})`,
  );

  // Always call next() to allow the update to be processed by other middleware
  await next();
}

/**
 * Response time middleware that measures how long it takes to process an update.
 *
 * This middleware demonstrates:
 * - Executing code before and after next()
 * - Measuring execution time
 * - Wrapping other middleware
 */
export async function responseTimeMiddleware(
  _ctx: Context,
  next: NextFunction,
): Promise<void> {
  const start = Date.now();

  // Process the update
  await next();

  const duration = Date.now() - start;
  console.log(`Request processed in ${duration}ms`);
}

/**
 * Authentication middleware that checks if a user is authorized.
 *
 * This middleware demonstrates:
 * - Conditional middleware execution
 * - Stopping the middleware chain (not calling next())
 * - User authorization patterns
 *
 * @param allowedUserIds - Set of user IDs that are authorized
 * @returns Middleware function
 */
export function authenticationMiddleware(
  allowedUserIds: Set<number>,
): (ctx: Context, next: NextFunction) => Promise<void> {
  return async (ctx: Context, next: NextFunction): Promise<void> => {
    const userId = ctx.from?.id;

    if (!userId || !allowedUserIds.has(userId)) {
      // User is not authorized, stop middleware chain
      await ctx.reply("You are not authorized to use this bot.");
      return;
    }

    // User is authorized, continue to next middleware
    await next();
  };
}

/**
 * Error handling middleware that catches and logs errors.
 *
 * This middleware demonstrates:
 * - Try-catch patterns in middleware
 * - Error recovery
 * - Graceful error responses to users
 */
export async function errorHandlingMiddleware(
  ctx: Context,
  next: NextFunction,
): Promise<void> {
  try {
    await next();
  } catch (error) {
    console.error("Error processing update:", error);

    // Send a friendly error message to the user
    await ctx.reply(
      "An error occurred while processing your request. Please try again later.",
    );
  }
}

/**
 * Example bot that demonstrates middleware composition.
 *
 * Middleware is executed in the order it's registered:
 * 1. Error handling (wraps everything)
 * 2. Logging
 * 3. Response time
 * 4. Authentication
 * 5. Command/message handlers
 */
export function createBotWithMiddleware(token: string): Bot {
  const bot = new Bot(token);

  // Allowed user IDs (in production, load from configuration)
  const allowedUsers = new Set([123456789, 987654321]);

  // Register middleware in order
  // Error handling should be first to catch all errors
  bot.use(errorHandlingMiddleware);

  // Logging and monitoring middleware
  bot.use(loggingMiddleware);
  bot.use(responseTimeMiddleware);

  // Authentication middleware
  // Note: This blocks all subsequent middleware for unauthorized users
  bot.use(authenticationMiddleware(allowedUsers));

  // Command handlers (only reached if user is authenticated)
  bot.command("start", async (ctx) => {
    await ctx.reply("Welcome, authorized user!");
  });

  bot.command("status", async (ctx) => {
    await ctx.reply("Bot is running and you are authenticated.");
  });

  // Message handler
  bot.on("message:text", async (ctx) => {
    await ctx.reply(`Echo: ${ctx.message.text}`);
  });

  return bot;
}
