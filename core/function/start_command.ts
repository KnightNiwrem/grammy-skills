/**
 * Simple start command handler.
 *
 * Demonstrates basic command handling with a simple greeting.
 */

import { type CommandContext, type Context } from "grammy";

export async function handleStartCommand(
  ctx: CommandContext<Context>,
): Promise<void> {
  await ctx.reply("Welcome! Use /help to see available commands.");
}
