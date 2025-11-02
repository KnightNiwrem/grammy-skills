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

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is required");

const bot = new Bot(token);

function createUserFeature(): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("profile", async (ctx) => {
    const user = ctx.from;
    if (!user) {
      await ctx.reply("User information not available.");
      return;
    }

    const profile = [
      "Your Profile:",
      `ID: ${user.id}`,
      `Name: ${user.first_name} ${user.last_name ?? ""}`.trim(),
      `Username: ${user.username ? `@${user.username}` : "Not set"}`,
      `Language: ${user.language_code ?? "Unknown"}`,
    ].join("\n");

    await ctx.reply(profile);
  });

  composer.command("settings", async (ctx) => {
    await ctx.reply(
      "Settings:\n" +
        "• Language: English\n" +
        "• Notifications: Enabled\n" +
        "• Theme: Light",
    );
  });

  return composer;
}

function createAdminFeature(adminIds: Set<number>): Composer<Context> {
  const composer = new Composer<Context>();

  // Authorization middleware for this feature
  composer.use(async (ctx, next) => {
    if (!ctx.from || !adminIds.has(ctx.from.id)) {
      await ctx.reply("This command is only available to administrators.");
      return;
    }
    return next();
  });

  composer.command("stats", async (ctx) => {
    await ctx.reply(
      "Bot Statistics:\n" +
        "• Users: 1,234\n" +
        "• Messages: 45,678\n" +
        "• Uptime: 7 days",
    );
  });

  composer.command("broadcast", async (ctx) => {
    const message = ctx.match?.toString().trim();

    if (!message) {
      await ctx.reply("Usage: /broadcast <message>");
      return;
    }

    // In a real bot, this would send to all users
    await ctx.reply(`Broadcasting message: "${message}"`);
  });

  composer.command("maintenance", async (ctx) => {
    await ctx.reply("Maintenance mode toggled.");
  });

  return composer;
}

function createHelpFeature(): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("start", async (ctx) => {
    await ctx.reply(
      "Welcome to the bot! Use /help to see available commands.",
    );
  });

  composer.command("help", async (ctx) => {
    await ctx.reply(
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

  composer.command("about", async (ctx) => {
    await ctx.reply(
      "This bot demonstrates modular composition patterns in grammY.\n" +
        "Version: 1.0.0",
    );
  });

  return composer;
}

function createUtilityFeature(): Composer<Context> {
  const composer = new Composer<Context>();

  composer.command("echo", async (ctx) => {
    const text = ctx.match?.toString().trim();

    if (!text) {
      await ctx.reply("Usage: /echo <text>");
      return;
    }

    await ctx.reply(text);
  });

  composer.command("time", async (ctx) => {
    const now = new Date();
    const timeStr = now.toISOString();

    await ctx.reply(`Current time: ${timeStr}`);
  });

  composer.command("ping", async (ctx) => {
    const sentTime = ctx.msg?.date ?? 0;
    const now = Math.floor(Date.now() / 1000);
    const latency = now - sentTime;

    await ctx.reply(`Pong! Latency: ${latency}s`);
  });

  return composer;
}

function createMessageFeature(): Composer<Context> {
  const composer = new Composer<Context>();

  // Handle text messages
  composer.on("message:text", async (ctx) => {
    const text = ctx.msg.text.toLowerCase();

    // Simple keyword responses
    if (text.includes("hello") || text.includes("hi")) {
      await ctx.reply("Hello! How can I help you today?");
      return;
    }

    if (text.includes("bye") || text.includes("goodbye")) {
      await ctx.reply("Goodbye! Have a great day!");
      return;
    }

    if (text.includes("help")) {
      await ctx.reply("Use /help to see all available commands.");
      return;
    }

    // Default response
    await ctx.reply(
      "I received your message. Use /help to see what I can do.",
    );
  });

  // Handle photos
  composer.on("message:photo", async (ctx) => {
    await ctx.reply("Nice photo! 📸");
  });

  // Handle stickers
  composer.on("message:sticker", async (ctx) => {
    await ctx.reply("Cool sticker!");
  });

  return composer;
}

const adminIds = new Set([123456789]);

bot.use((ctx, next) => {
  console.log(
    `[${new Date().toISOString()}] Update from ${ctx.from?.id}: ${
      ctx.message?.text ?? "non-text"
    }`,
  );
  return next();
});

bot.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error("Error handling update:", error);
    await ctx.reply("An error occurred. Please try again later.");
  }
});

bot.use(createHelpFeature());
bot.use(createUserFeature());
bot.use(createAdminFeature(adminIds));
bot.use(createUtilityFeature());
bot.use(createMessageFeature());

if (import.meta.main) {
  bot.start();
}
