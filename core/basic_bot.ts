/**
 * Basic Bot Setup
 *
 * This example demonstrates the fundamental structure of a grammY bot,
 * including initialization, basic message handling, and command registration.
 *
 * Key concepts:
 * - Bot instantiation with token
 * - Command handlers using bot.command()
 * - Message handlers using bot.on()
 * - Starting the bot with long polling
 *
 * @module
 */

import { Bot } from "grammy";

/**
 * Creates a basic bot instance.
 *
 * The bot token should be obtained from @BotFather on Telegram.
 * In production, use environment variables or secure configuration.
 *
 * @param token - The bot token from @BotFather
 * @returns Configured Bot instance
 */
export function createBot(token: string): Bot {
  const bot = new Bot(token);

  // Command handler for /start
  // This is typically the first command users see when they start a bot
  bot.command("start", async (ctx) => {
    await ctx.reply(
      "Welcome! I'm a basic bot demonstrating grammY patterns.",
    );
  });

  // Command handler for /help
  // Provides information about available commands
  bot.command("help", async (ctx) => {
    await ctx.reply(
      "Available commands:\n" +
        "/start - Start the bot\n" +
        "/help - Show this help message\n" +
        "/echo <text> - Echo your message",
    );
  });

  // Command handler with argument extraction
  // Demonstrates accessing command arguments from context
  bot.command("echo", async (ctx) => {
    // ctx.match contains the text after the command
    const text = ctx.match;

    if (!text) {
      await ctx.reply("Please provide text to echo. Usage: /echo <text>");
      return;
    }

    await ctx.reply(text);
  });

  // Handle all text messages that aren't commands
  // bot.on() with filter query for specific message types
  bot.on("message:text", async (ctx) => {
    // Access the message text through context
    const messageText = ctx.message.text;

    await ctx.reply(`You said: ${messageText}`);
  });

  return bot;
}
