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

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is required");

const bot = new Bot(token);

bot.on("message:text", async (ctx) => {
  const text = ctx.msg.text;
  await ctx.reply(`You sent text: ${text}`);
});

bot.on("message:photo", async (ctx) => {
  const photos = ctx.msg.photo;
  const largestPhoto = photos[photos.length - 1];

  await ctx.reply(
    `Received photo with file_id: ${largestPhoto.file_id}\n` +
      `Size: ${largestPhoto.width}x${largestPhoto.height}`,
  );
});

bot.on("message:caption", async (ctx) => {
  const caption = ctx.msg.caption;
  await ctx.reply(`Your caption: ${caption}`);
});

bot.on("message:entities:url", async (ctx) => {
  const urlEntities = ctx.entities("url");
  await ctx.reply(`Found ${urlEntities.length} URL(s) in your message.`);
});

bot.on("message:entities:mention", async (ctx) => {
  const mentionEntities = ctx.entities("mention");
  await ctx.reply(`You mentioned ${mentionEntities.length} user(s).`);
});

bot.on(":forward_origin", async (ctx) => {
  await ctx.reply("You forwarded a message.");
});

bot.on("message").filter(
  (ctx) => ctx.chat.type === "private",
  async (ctx) => {
    await ctx.reply("This is a private chat message.");
  },
);

bot.on("message").filter(
  (ctx) => ctx.chat.type === "group" || ctx.chat.type === "supergroup",
  async (ctx) => {
    await ctx.reply("This is a group message.");
  },
);

const adminIds = new Set([123456789, 987654321]);

bot.on("message").filter(
  (ctx) => ctx.from !== undefined && adminIds.has(ctx.from.id),
  async (ctx) => {
    await ctx.reply("Hello, admin!");
  },
);

bot.on("edited_message:text", async (ctx) => {
  const newText = ctx.editedMessage.text;
  await ctx.reply(`You edited your message to: ${newText}`);
});

bot.command("context", async (ctx) => {
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

bot.command("entities", async (ctx) => {
  const msg = ctx.msg;

  if (!("text" in msg)) {
    await ctx.reply("No text in this message.");
    return;
  }

  const entities = ctx.entities();

  if (entities.length === 0) {
    await ctx.reply("No entities found in this message.");
    return;
  }

  const entityInfo = entities.map((entity) => {
    return `- ${entity.type} at offset ${entity.offset}`;
  }).join("\n");

  await ctx.reply(`Found ${entities.length} entities:\n${entityInfo}`);
});

bot.on("message", async (ctx) => {
  await ctx.reply(
    "I received a message but I'm not sure how to handle it.",
  );
});

bot.start();
