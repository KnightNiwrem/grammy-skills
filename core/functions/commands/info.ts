/**
 * Command handler that extracts user information from context.
 *
 * Demonstrates:
 * - Accessing user data from ctx.from
 * - Accessing chat information from ctx.chat
 * - Formatting responses with multiple data points
 */

import {
  type CommandContext,
  type Context,
} from "https://deno.land/x/grammy@v1.30.0/mod.ts";

export async function handleInfoCommand(
  ctx: CommandContext<Context>,
): Promise<void> {
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

  await ctx.reply(info);
}
