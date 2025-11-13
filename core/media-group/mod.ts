/**
 * Media Group Plugin Example
 *
 * This example demonstrates how to use the built-in media group plugin
 * to handle multiple media files sent together (albums).
 *
 * Key concepts:
 * - Using the mediaGroup plugin to collect media sent as a group
 * - Handling complete media groups after all media is received
 * - Accessing individual media items within a group
 * - Processing different types of media (photos, videos, documents)
 *
 * @module
 */

import { Bot } from "https://deno.land/x/grammy@v1.30.0/mod.ts";
import { mediaGroup } from "https://deno.land/x/grammy@v1.30.0/plugins/media-group.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is required");

const bot = new Bot(token);

// Apply the media group plugin
// This plugin automatically groups media sent together and provides them
// in a single update once the entire group has been received
bot.use(mediaGroup());

// Handle complete media groups (albums)
bot.on("media_group:photo", async (ctx) => {
  const mediaGroup = ctx.mediaGroup;

  await ctx.reply(
    `Received a media group with ${mediaGroup.length} photo(s)!\n\n` +
      `Group ID: ${ctx.message.media_group_id}\n` +
      `First photo caption: ${mediaGroup[0].caption || "(no caption)"}`,
  );

  // Process each photo in the group
  for (const [index, media] of mediaGroup.entries()) {
    console.log(
      `Photo ${index + 1}: ${media.photo[media.photo.length - 1].file_id}`,
    );
  }
});

// Handle mixed media groups (photos and videos)
bot.on("media_group", async (ctx) => {
  const mediaGroup = ctx.mediaGroup;

  // Determine media types in the group
  const types = new Set<string>();
  for (const media of mediaGroup) {
    if (media.photo) types.add("photo");
    if (media.video) types.add("video");
    if (media.document) types.add("document");
  }

  await ctx.reply(
    `Received a media group with ${mediaGroup.length} item(s)!\n` +
      `Media types: ${Array.from(types).join(", ")}\n` +
      `Group ID: ${ctx.message.media_group_id}`,
  );
});

// Handle single media items (not in a group)
// This demonstrates the difference between grouped and single media
bot.on(":photo", async (ctx) => {
  // This will only trigger for single photos, not media groups
  // The media group plugin ensures grouped photos go to media_group handlers
  if (!ctx.message.media_group_id) {
    await ctx.reply("Received a single photo (not part of a media group)");
  }
});

bot.command("start", async (ctx) => {
  await ctx.reply(
    "Send me multiple photos or videos together (as an album) " +
      "to see the media group plugin in action!\n\n" +
      "You can also send a single photo to see the difference.",
  );
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "Media Group Plugin Demo:\n\n" +
      "• Send multiple photos/videos together to create a media group\n" +
      "• Send a single photo to see how it differs\n" +
      "• The bot will process the entire group once all media is received",
  );
});

bot.start();
