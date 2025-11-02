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

import { Bot, type CommandContext, type Context } from "grammy";

/**
 * Simple command handler that responds with static text.
 *
 * This is the most basic command pattern.
 */
function handleStartCommand(ctx: CommandContext<Context>): Promise<unknown> {
  return ctx.reply("Welcome! Use /help to see available commands.");
}

/**
 * Command handler with argument extraction and validation.
 *
 * Demonstrates:
 * - Extracting arguments from ctx.match
 * - Validating input
 * - Providing helpful error messages
 */
function handleGreetCommand(ctx: CommandContext<Context>): Promise<unknown> {
  // ctx.match contains everything after the command
  const name = ctx.match?.trim();

  if (!name) {
    return ctx.reply(
      "Please provide a name. Usage: /greet <name>",
    );
  }

  return ctx.reply(`Hello, ${name}! Nice to meet you.`);
}

/**
 * Command handler that parses multiple arguments.
 *
 * Demonstrates parsing space-separated arguments.
 */
function handleCalcCommand(ctx: CommandContext<Context>): Promise<unknown> {
  const args = ctx.match?.trim().split(/\s+/);

  if (!args || args.length !== 3) {
    return ctx.reply(
      "Usage: /calc <number> <operator> <number>\n" +
        "Example: /calc 5 + 3",
    );
  }

  const [num1Str, operator, num2Str] = args;
  const num1 = parseFloat(num1Str);
  const num2 = parseFloat(num2Str);

  // Validate numbers
  if (isNaN(num1) || isNaN(num2)) {
    return ctx.reply("Both operands must be valid numbers.");
  }

  // Perform calculation
  let result: number;
  switch (operator) {
    case "+":
      result = num1 + num2;
      break;
    case "-":
      result = num1 - num2;
      break;
    case "*":
      result = num1 * num2;
      break;
    case "/":
      if (num2 === 0) {
        return ctx.reply("Cannot divide by zero.");
      }
      result = num1 / num2;
      break;
    default:
      return ctx.reply(
        `Unknown operator: ${operator}\n` +
          "Supported operators: + - * /",
      );
  }

  return ctx.reply(`${num1} ${operator} ${num2} = ${result}`);
}

/**
 * Command handler that extracts user information from context.
 *
 * Demonstrates:
 * - Accessing user data from ctx.from
 * - Accessing chat information from ctx.chat
 * - Formatting responses with multiple data points
 */
function handleInfoCommand(ctx: CommandContext<Context>): Promise<unknown> {
  // Extract user information
  const userId = ctx.from?.id;
  const username = ctx.from?.username;
  const firstName = ctx.from?.first_name;
  const lastName = ctx.from?.last_name;

  // Extract chat information
  const chatId = ctx.chat?.id;
  const chatType = ctx.chat?.type;

  const info = [
    "User Information:",
    `- ID: ${userId}`,
    `- Username: ${username ? `@${username}` : "Not set"}`,
    `- Name: ${firstName} ${lastName ?? ""}`.trim(),
    "",
    "Chat Information:",
    `- Chat ID: ${chatId}`,
    `- Chat Type: ${chatType}`,
  ].join("\n");

  return ctx.reply(info);
}

/**
 * Subcommand pattern using argument parsing.
 *
 * This pattern allows a single command to have multiple sub-actions.
 * Example: /admin start, /admin stop, /admin status
 */
function handleAdminCommand(ctx: CommandContext<Context>): Promise<unknown> {
  const args = ctx.match?.trim().split(/\s+/) ?? [];
  const subcommand = args[0]?.toLowerCase();

  switch (subcommand) {
    case "start":
      return ctx.reply("Starting admin services...");

    case "stop":
      return ctx.reply("Stopping admin services...");

    case "status":
      return ctx.reply("Admin services are running.");

    case "help":
    case undefined:
      return ctx.reply(
        "Admin Commands:\n" +
          "/admin start - Start services\n" +
          "/admin stop - Stop services\n" +
          "/admin status - Check status\n" +
          "/admin help - Show this help",
      );

    default:
      return ctx.reply(
        `Unknown subcommand: ${subcommand}\n` +
          "Use /admin help for available commands.",
      );
  }
}

/**
 * Creates a bot with various command handling patterns.
 */
export function createCommandBot(token: string): Bot {
  const bot = new Bot(token);

  // Register command handlers
  bot.command("start", handleStartCommand);
  bot.command("greet", handleGreetCommand);
  bot.command("calc", handleCalcCommand);
  bot.command("info", handleInfoCommand);
  bot.command("admin", handleAdminCommand);

  // Help command that lists all available commands
  bot.command("help", (ctx) => {
    return ctx.reply(
      "Available Commands:\n\n" +
        "/start - Start the bot\n" +
        "/help - Show this help message\n" +
        "/greet <name> - Greet someone by name\n" +
        "/calc <num> <op> <num> - Calculate two numbers\n" +
        "/info - Show your user and chat information\n" +
        "/admin <subcommand> - Admin operations",
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

  const bot = createCommandBot(token);
  console.log("Command bot is starting...");
  bot.start();
}
