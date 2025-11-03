/**
 * Simple start command handler.
 *
 * Demonstrates basic command handling with a simple greeting.
 */

import {
  type CommandContext,
  type Context,
} from "https://deno.land/x/grammy@v1.30.0/mod.ts";

export async function handleStartCommand(
  ctx: CommandContext<Context>,
): Promise<void> {
  await ctx.reply("Welcome! Use /help to see available commands.");
}
