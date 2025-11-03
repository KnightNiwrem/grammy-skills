/**
 * Command Handling Patterns
 *
 * This example demonstrates various patterns for handling commands in grammY:
 * - Simple commands
 * - Commands with arguments
 * - Commands with validation
 * - Subcommand patterns
 * - Command context extraction
 *
 * @module
 */

import { Bot } from "https://deno.land/x/grammy@v1.30.0/mod.ts";
import { handleStartCommand } from "./commands/start.ts";
import { handleGreetCommand } from "./commands/greet.ts";
import { handleCalcCommand } from "./commands/calc.ts";
import { handleInfoCommand } from "./commands/info.ts";
import { handleAdminCommand } from "./commands/admin.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is required");

const bot = new Bot(token);

bot.command("start", handleStartCommand);
bot.command("greet", handleGreetCommand);
bot.command("calc", handleCalcCommand);
bot.command("info", handleInfoCommand);
bot.command("admin", handleAdminCommand);

bot.command("help", async (ctx) => {
  await ctx.reply(
    "Available Commands:\n\n" +
      "/start - Start the bot\n" +
      "/help - Show this help message\n" +
      "/greet <name> - Greet someone by name\n" +
      "/calc <num> <op> <num> - Calculate two numbers\n" +
      "/info - Show your user and chat information\n" +
      "/admin <subcommand> - Admin operations",
  );
});

bot.start();
