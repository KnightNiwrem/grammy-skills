/**
 * Media Group Handling Example
 *
 * This example demonstrates how to handle multiple media files sent together (albums).
 * Note: grammY doesn't have a built-in plugin for automatically grouping received media.
 * Instead, we detect media groups using the media_group_id field.
 *
 * Key concepts:
 * - Detecting media groups via media_group_id
 * - Handling photos and videos sent as albums
 * - Distinguishing between grouped and single media
 *
 * @module
 */

import { Bot } from "https://deno.land/x/grammy@v1.30.0/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is required");

const bot = new Bot(token);

// Handle photos (including those in media groups)
bot.on("message:photo", async (ctx) => {
  const photo = ctx.message.photo;
  const mediaGroupId = ctx.message.media_group_id;

  if (mediaGroupId) {
    // This photo is part of a media group (album)
    console.log(`Received photo in media group: ${mediaGroupId}`);
    console.log(`Photo file_id: ${photo[photo.length - 1].file_id}`);

    await ctx.reply(
      `Received a photo that's part of an album!\n` +
        `Media Group ID: ${mediaGroupId}\n` +
        `Caption: ${ctx.message.caption || "(no caption)"}`,
    );
  } else {
    // Single photo, not part of a group
    await ctx.reply("Received a single photo (not part of an album)");
  }
});

// Handle videos (including those in media groups)
bot.on("message:video", async (ctx) => {
  const video = ctx.message.video;
  const mediaGroupId = ctx.message.media_group_id;

  if (mediaGroupId) {
    console.log(`Received video in media group: ${mediaGroupId}`);
    console.log(`Video file_id: ${video.file_id}`);

    await ctx.reply(
      `Received a video that's part of an album!\n` +
        `Media Group ID: ${mediaGroupId}`,
    );
  } else {
    await ctx.reply("Received a single video (not part of an album)");
  }
});

bot.command("start", async (ctx) => {
  await ctx.reply(
    "Send me multiple photos or videos together (as an album) " +
      "to see media group handling in action!\n\n" +
      "You can also send a single photo to see the difference.",
  );
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "Media Group Handling Demo:\n\n" +
      "• Send multiple photos/videos together to create a media group\n" +
      "• Send a single photo to see how it differs\n" +
      "• Each media item in a group has a unique media_group_id",
  );
});

bot.start();
