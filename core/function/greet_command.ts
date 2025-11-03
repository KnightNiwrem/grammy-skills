/**
 * Command handler with argument extraction and validation.
 *
 * Demonstrates:
 * - Extracting arguments from ctx.match
 * - Validating input
 * - Providing helpful error messages
 */

import { type CommandContext, type Context } from "grammy";

export async function handleGreetCommand(
  ctx: CommandContext<Context>,
): Promise<void> {
  // ctx.match contains everything after the command
  const name = ctx.match?.trim();

  if (!name) {
    await ctx.reply(
      "Please provide a name. Usage: /greet <name>",
    );
    return;
  }

  await ctx.reply(`Hello, ${name}! Nice to meet you.`);
}
