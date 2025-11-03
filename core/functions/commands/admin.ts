/**
 * Subcommand pattern using argument parsing.
 *
 * This pattern allows a single command to have multiple sub-actions.
 * Example: /admin start, /admin stop, /admin status
 */

import {
  type CommandContext,
  type Context,
} from "https://deno.land/x/grammy@v1.30.0/mod.ts";

export async function handleAdminCommand(
  ctx: CommandContext<Context>,
): Promise<void> {
  const args = ctx.match?.trim().split(/\s+/) ?? [];
  const subcommand = args[0]?.toLowerCase();

  switch (subcommand) {
    case "start":
      await ctx.reply("Starting admin services...");
      return;

    case "stop":
      await ctx.reply("Stopping admin services...");
      return;

    case "status":
      await ctx.reply("Admin services are running.");
      return;

    case "help":
    case undefined:
      await ctx.reply(
        "Admin Commands:\n" +
          "/admin start - Start services\n" +
          "/admin stop - Stop services\n" +
          "/admin status - Check status\n" +
          "/admin help - Show this help",
      );
      return;

    default:
      await ctx.reply(
        `Unknown subcommand: ${subcommand}\n` +
          "Use /admin help for available commands.",
      );
  }
}
