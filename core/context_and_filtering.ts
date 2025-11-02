/**
 * Context Usage and Message Filtering
 *
 * This example demonstrates:
 * - Using context shortcuts and properties
 * - Filter queries with bot.on()
 * - Handling different message types
 * - Entity extraction from messages
 * - Accessing chat and user information
 *
 * @module
 */

import { Bot } from "grammy";

/**
 * Creates a bot demonstrating context usage and filtering patterns.
 */
export function createFilterBot(token: string): Bot {
  const bot = new Bot(token);

  // Filter for text messages only
  // This is one of the most common filters
  bot.on("message:text", async (ctx) => {
    // ctx.msg is a shortcut for ctx.message
    const text = ctx.msg.text;

    await ctx.reply(`You sent text: ${text}`);
  });

  // Filter for photo messages
  bot.on("message:photo", async (ctx) => {
    // Photos come as an array of different sizes
    // The last element is usually the highest resolution
    const photos = ctx.msg.photo;
    const largestPhoto = photos[photos.length - 1];

    await ctx.reply(
      `Received photo with file_id: ${largestPhoto.file_id}\n` +
        `Size: ${largestPhoto.width}x${largestPhoto.height}`,
    );
  });

  // Filter for messages with captions
  bot.on("message:caption", async (ctx) => {
    // ctx.msg.caption exists only if there's a caption
    const caption = ctx.msg.caption;

    await ctx.reply(`Your caption: ${caption}`);
  });

  // Filter for messages with URLs in text
  // Uses sub-query syntax for entities
  bot.on("message:entities:url", async (ctx) => {
    // Access entities from the message
    const entities = ctx.msg.entities;
    const urlCount = entities?.filter((e) => e.type === "url").length ?? 0;

    await ctx.reply(`Found ${urlCount} URL(s) in your message.`);
  });

  // Filter for messages with mentions
  bot.on("message:entities:mention", async (ctx) => {
    const entities = ctx.msg.entities;
    const mentionCount = entities?.filter((e) => e.type === "mention").length ??
      0;

    await ctx.reply(`You mentioned ${mentionCount} user(s).`);
  });

  // Filter for forwarded messages
  bot.on(":forward_origin", async (ctx) => {
    // This catches all forwarded messages
    await ctx.reply("You forwarded a message.");
  });

  // Filter for messages in private chats only
  bot.on("message").filter(
    (ctx) => ctx.chat.type === "private",
    async (ctx) => {
      await ctx.reply("This is a private chat message.");
    },
  );

  // Filter for messages in groups only
  bot.on("message").filter(
    (ctx) => ctx.chat.type === "group" || ctx.chat.type === "supergroup",
    async (ctx) => {
      await ctx.reply("This is a group message.");
    },
  );

  // Filter for messages from specific users
  // This pattern demonstrates programmatic filtering
  const adminIds = new Set([123456789, 987654321]);

  bot.on("message").filter(
    (ctx) => ctx.from !== undefined && adminIds.has(ctx.from.id),
    async (ctx) => {
      await ctx.reply("Hello, admin!");
    },
  );

  // Handling edited messages
  // Use ":edited" or "edited_message" to catch edits
  bot.on("edited_message:text", async (ctx) => {
    // In real apps, you'd track the previous version
    const newText = ctx.editedMessage.text;

    await ctx.reply(
      `You edited your message to: ${newText}`,
    );
  });

  // Command demonstrating comprehensive context usage
  bot.command("context", async (ctx) => {
    // Access various context properties
    const info = [
      "Context Information:",
      "",
      "User:",
      `- ID: ${ctx.from?.id}`,
      `- Username: ${ctx.from?.username ?? "none"}`,
      `- First Name: ${ctx.from?.first_name}`,
      `- Language: ${ctx.from?.language_code ?? "unknown"}`,
      "",
      "Chat:",
      `- ID: ${ctx.chat?.id}`,
      `- Type: ${ctx.chat?.type}`,
      `- Title: ${ctx.chat && "title" in ctx.chat ? ctx.chat.title : "N/A"}`,
      "",
      "Message:",
      `- ID: ${ctx.msg?.message_id}`,
      `- Date: ${
        ctx.msg?.date ? new Date(ctx.msg.date * 1000).toISOString() : "N/A"
      }`,
      `- Text: ${ctx.msg && "text" in ctx.msg ? ctx.msg.text : "N/A"}`,
    ].join("\n");

    await ctx.reply(info);
  });

  // Command to demonstrate entity extraction
  bot.command("entities", async (ctx) => {
    const msg = ctx.msg;

    // Check if message has text
    if (!("text" in msg)) {
      await ctx.reply("No text in this message.");
      return;
    }

    // Get all entities in the message
    const entities = msg.entities;

    if (!entities || entities.length === 0) {
      await ctx.reply("No entities found in this message.");
      return;
    }

    const entityInfo = entities.map((entity) => {
      return `- ${entity.type} at offset ${entity.offset}`;
    }).join("\n");

    await ctx.reply(`Found ${entities.length} entities:\n${entityInfo}`);
  });

  // Catch-all for any message type not handled above
  bot.on("message", async (ctx) => {
    await ctx.reply(
      "I received a message but I'm not sure how to handle it.",
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

  const bot = createFilterBot(token);
  console.log("Filter bot is starting...");
  bot.start();
}
