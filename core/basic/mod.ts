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

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is required");

const bot = new Bot(token);

// Command handler for /start
bot.command("start", async (ctx) => {
  await ctx.reply(
    "Welcome! I'm a basic bot demonstrating grammY patterns.",
  );
});

// Command handler for /help
bot.command("help", async (ctx) => {
  await ctx.reply(
    "Available commands:\n" +
      "/start - Start the bot\n" +
      "/help - Show this help message\n" +
      "/echo <text> - Echo your message",
  );
});

// Command handler with argument extraction
bot.command("echo", async (ctx) => {
  const text = ctx.match;

  if (!text) {
    await ctx.reply("Please provide text to echo. Usage: /echo <text>");
    return;
  }

  await ctx.reply(text);
});

// Handle all text messages that aren't commands
bot.on("message:text", async (ctx) => {
  const messageText = ctx.message.text;
  await ctx.reply(`You said: ${messageText}`);
});

bot.start();
