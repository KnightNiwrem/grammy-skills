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

import { Bot } from "grammy";
import { handleStartCommand } from "./start_command.ts";
import { handleGreetCommand } from "./greet_command.ts";
import { handleCalcCommand } from "./calc_command.ts";
import { handleInfoCommand } from "./info_command.ts";
import { handleAdminCommand } from "./admin_command.ts";

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
