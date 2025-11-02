/**
 * Bot Composition and Structure
 *
 * This example demonstrates how to organize a larger bot by composing
 * it from smaller, focused modules. This pattern is essential for
 * maintaining large codebases.
 *
 * Key concepts:
 * - Using Composer to group related handlers
 * - Extracting features into separate modules
 * - Organizing code by feature/domain
 * - Creating reusable middleware
 *
 * @module
 */

import { Bot, Composer, type Context } from "grammy";

/**
 * User management feature module.
 *
 * Groups all user-related commands and handlers together.
 */
export function createUserFeature(): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("profile", (ctx) => {
    const user = ctx.from;
    if (!user) {
      return ctx.reply("User information not available.");
    }

    const profile = [
      "Your Profile:",
      `ID: ${user.id}`,
      `Name: ${user.first_name} ${user.last_name ?? ""}`.trim(),
      `Username: ${user.username ? `@${user.username}` : "Not set"}`,
      `Language: ${user.language_code ?? "Unknown"}`,
    ].join("\n");

    return ctx.reply(profile);
  });

  composer.command("settings", (ctx) => {
    return ctx.reply(
      "Settings:\n" +
        "• Language: English\n" +
        "• Notifications: Enabled\n" +
        "• Theme: Light",
    );
  });

  return composer;
}

/**
 * Admin feature module.
 *
 * Groups all admin commands together with authorization check.
 */
export function createAdminFeature(
  adminIds: Set<number>,
): Composer<Context> {
  const composer = new Composer<Context>();

  // Authorization middleware for this feature
  composer.use((ctx, next) => {
    if (!ctx.from || !adminIds.has(ctx.from.id)) {
      return ctx.reply("This command is only available to administrators.");
    }
    return next();
  });

  composer.command("stats", (ctx) => {
    return ctx.reply(
      "Bot Statistics:\n" +
        "• Users: 1,234\n" +
        "• Messages: 45,678\n" +
        "• Uptime: 7 days",
    );
  });

  composer.command("broadcast", (ctx) => {
    const message = ctx.match?.toString().trim();

    if (!message) {
      return ctx.reply("Usage: /broadcast <message>");
    }

    // In a real bot, this would send to all users
    return ctx.reply(`Broadcasting message: "${message}"`);
  });

  composer.command("maintenance", (ctx) => {
    return ctx.reply("Maintenance mode toggled.");
  });

  return composer;
}

/**
 * Help feature module.
 *
 * Provides help and information commands.
 */
export function createHelpFeature(): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("start", (ctx) => {
    return ctx.reply(
      "Welcome to the bot! Use /help to see available commands.",
    );
  });

  composer.command("help", (ctx) => {
    return ctx.reply(
      "Available Commands:\n\n" +
        "User Commands:\n" +
        "/profile - View your profile\n" +
        "/settings - View settings\n\n" +
        "Utility Commands:\n" +
        "/echo <text> - Echo your message\n" +
        "/time - Get current time\n\n" +
        "Admin Commands:\n" +
        "/stats - View bot statistics\n" +
        "/broadcast <msg> - Broadcast message\n" +
        "/maintenance - Toggle maintenance",
    );
  });

  composer.command("about", (ctx) => {
    return ctx.reply(
      "This bot demonstrates modular composition patterns in grammY.\n" +
        "Version: 1.0.0",
    );
  });

  return composer;
}

/**
 * Utility feature module.
 *
 * Provides utility commands.
 */
export function createUtilityFeature(): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("echo", (ctx) => {
    const text = ctx.match?.toString().trim();

    if (!text) {
      return ctx.reply("Usage: /echo <text>");
    }

    return ctx.reply(text);
  });

  composer.command("time", (ctx) => {
    const now = new Date();
    const timeStr = now.toISOString();

    return ctx.reply(`Current time: ${timeStr}`);
  });

  composer.command("ping", (ctx) => {
    const sentTime = ctx.msg?.date ?? 0;
    const now = Math.floor(Date.now() / 1000);
    const latency = now - sentTime;

    return ctx.reply(`Pong! Latency: ${latency}s`);
  });

  return composer;
}

/**
 * Message handling feature module.
 *
 * Handles non-command messages.
 */
export function createMessageFeature(): Composer<Context> {
  const composer = new Composer<Context>();

  // Handle text messages
  composer.on("message:text", (ctx) => {
    const text = ctx.msg.text.toLowerCase();

    // Simple keyword responses
    if (text.includes("hello") || text.includes("hi")) {
      return ctx.reply("Hello! How can I help you today?");
    }

    if (text.includes("bye") || text.includes("goodbye")) {
      return ctx.reply("Goodbye! Have a great day!");
    }

    if (text.includes("help")) {
      return ctx.reply("Use /help to see all available commands.");
    }

    // Default response
    return ctx.reply(
      "I received your message. Use /help to see what I can do.",
    );
  });

  // Handle photos
  composer.on("message:photo", (ctx) => {
    return ctx.reply("Nice photo! 📸");
  });

  // Handle stickers
  composer.on("message:sticker", (ctx) => {
    return ctx.reply("Cool sticker!");
  });

  return composer;
}

/**
 * Creates a fully composed bot from feature modules.
 *
 * This demonstrates the recommended way to structure a large bot:
 * 1. Break functionality into feature modules
 * 2. Each module is a Composer with related handlers
 * 3. Compose all modules into the main bot
 * 4. Add cross-cutting concerns (logging, error handling) as middleware
 */
export function createComposedBot(
  token: string,
  options: { adminIds?: Set<number> } = {},
): Bot {
  const bot = new Bot(token);

  // Admin IDs (should come from configuration in production)
  const adminIds = options.adminIds ?? new Set([123456789]);

  // Logging middleware (cross-cutting concern)
  bot.use((ctx, next) => {
    console.log(
      `[${new Date().toISOString()}] Update from ${ctx.from?.id}: ${
        ctx.message?.text ?? "non-text"
      }`,
    );
    return next();
  });

  // Error handling middleware (cross-cutting concern)
  bot.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      console.error("Error handling update:", error);
      await ctx.reply(
        "An error occurred. Please try again later.",
      );
    }
  });

  // Compose feature modules
  // Order matters: more specific handlers should come before general ones
  bot.use(createHelpFeature());
  bot.use(createUserFeature());
  bot.use(createAdminFeature(adminIds));
  bot.use(createUtilityFeature());
  bot.use(createMessageFeature());

  return bot;
}

/**
 * Alternative composition pattern: Feature with state.
 *
 * This shows how to create a feature with internal state.
 */
export function createStatefulFeature(): Composer<Context> {
  const composer = new Composer<Context>();

  // Internal state (in production, use a proper database)
  const messageCount = new Map<number, number>();

  composer.use((ctx, next) => {
    // Track messages per user
    const userId = ctx.from?.id;
    if (userId) {
      const count = messageCount.get(userId) ?? 0;
      messageCount.set(userId, count + 1);
    }
    return next();
  });

  composer.command("mycount", (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) {
      return ctx.reply("User ID not available.");
    }

    const count = messageCount.get(userId) ?? 0;
    return ctx.reply(`You've sent ${count} messages.`);
  });

  return composer;
}

// Example usage
if (import.meta.main) {
  const token = Deno.env.get("BOT_TOKEN");

  if (!token) {
    console.error("BOT_TOKEN environment variable is required");
    Deno.exit(1);
  }

  // Parse admin IDs from environment
  const adminIdsStr = Deno.env.get("ADMIN_IDS") ?? "";
  const adminIds = new Set(
    adminIdsStr.split(",").map((id) => parseInt(id.trim())).filter((id) =>
      !isNaN(id)
    ),
  );

  const bot = createComposedBot(token, { adminIds });

  // Optionally add stateful feature
  bot.use(createStatefulFeature());

  console.log("Composed bot is starting...");
  bot.start();
}
