/**
 * Media Group Handling
 *
 * This example demonstrates how to send and handle media groups in grammY.
 * Media groups allow sending multiple photos or videos as a single message.
 *
 * Key concepts:
 * - Using InputMediaBuilder to create media objects
 * - Sending media groups with sendMediaGroup
 * - Handling incoming media group messages
 * - Working with different media types (photo, video, audio, document)
 *
 * @module
 */

import {
  Bot,
  InputFile,
  InputMediaBuilder,
} from "https://deno.land/x/grammy@v1.30.0/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is required");

const bot = new Bot(token);

// Command to send a media group with public URLs
bot.command("photos", async (ctx) => {
  // Create media group using public URLs
  const mediaGroup = [
    InputMediaBuilder.photo(
      "https://grammy.dev/images/grammY.png",
      {
        caption: "This is the grammY logo",
      },
    ),
    InputMediaBuilder.photo(
      "https://grammy.dev/images/Y.svg",
      {
        caption: "This is the Y from grammY",
      },
    ),
  ];

  await ctx.replyWithMediaGroup(mediaGroup);
});

// Command to send mixed media types
bot.command("mixed", async (ctx) => {
  // Media groups can contain photos and videos together
  const mediaGroup = [
    InputMediaBuilder.photo("https://grammy.dev/images/grammY.png", {
      caption: "Photo example",
    }),
    // Note: You would need actual video URLs for this to work
    // InputMediaBuilder.video("https://example.com/video.mp4", {
    //   caption: "Video example",
    // }),
  ];

  await ctx.replyWithMediaGroup(mediaGroup);
  await ctx.reply(
    "Note: This example only sends photos. Add video URLs to send mixed media.",
  );
});

// Command to demonstrate using InputFile for local files
bot.command("local", async (ctx) => {
  await ctx.reply(
    "To send local files, use:\n\n" +
      "const mediaGroup = [\n" +
      '  InputMediaBuilder.photo(new InputFile("/path/to/photo.jpg")),\n' +
      '  InputMediaBuilder.video(new InputFile("/path/to/video.mp4")),\n' +
      "];\n\n" +
      "await ctx.replyWithMediaGroup(mediaGroup);",
  );
});

// Handle incoming media groups
bot.on("message:media_group_id", async (ctx) => {
  const mediaGroupId = ctx.message.media_group_id;

  // Note: When users send media groups, Telegram sends each item as a separate update
  // with the same media_group_id. In production, you'd typically collect all items
  // before processing.
  await ctx.reply(
    `Received media from group: ${mediaGroupId}\n` +
      `This is item in the group. Media groups arrive as separate updates.`,
  );
});

// Handle photos that aren't part of a media group
bot.on("message:photo", async (ctx) => {
  // Skip if it's part of a media group (already handled above)
  if (ctx.message.media_group_id) return;

  const photo = ctx.message.photo;
  const largestPhoto = photo[photo.length - 1]; // Telegram sends multiple sizes

  await ctx.reply(
    `Received a single photo!\n` +
      `File ID: ${largestPhoto.file_id}\n` +
      `Size: ${largestPhoto.width}x${largestPhoto.height}`,
  );
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "Media Group Demo:\n\n" +
      "/photos - Send a media group with 2 photos\n" +
      "/mixed - Send mixed media types\n" +
      "/local - Show how to send local files\n" +
      "/help - Show this help message\n\n" +
      "You can also send me photos or media groups!",
  );
});

bot.command("start", async (ctx) => {
  await ctx.reply(
    "Welcome! This bot demonstrates media group handling in grammY.\n" +
      "Use /help to see available commands.",
  );
});

bot.start();
