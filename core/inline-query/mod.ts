/**
 * Inline Query Handling
 *
 * This example demonstrates how to handle inline queries in grammY.
 * Inline queries allow users to search for and send content from your bot
 * in any chat by typing @yourbotname in the message field.
 *
 * IMPORTANT: Inline mode must be enabled for your bot via @BotFather.
 * Send /setinline to @BotFather and follow the instructions.
 *
 * Key concepts:
 * - Listening for inline queries with bot.on("inline_query")
 * - Using InlineQueryResultBuilder to create results
 * - Different result types (photo, article, etc.)
 * - Adding inline keyboards to results
 * - Handling result selections with chosen_inline_result
 *
 * @module
 */

import {
  Bot,
  InlineKeyboard,
  InlineQueryResultBuilder,
} from "https://deno.land/x/grammy@v1.30.0/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is required");

const bot = new Bot(token);

// Handle inline queries
bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query.toLowerCase();

  // Build different results based on the query
  const results = [];

  // Photo result - always available
  results.push(
    InlineQueryResultBuilder.photo(
      "photo-grammy",
      "https://grammy.dev/images/grammY.png",
    ).title("grammY Logo"),
  );

  // Article with text - always available
  results.push(
    InlineQueryResultBuilder.article(
      "article-docs",
      "grammY Documentation",
    ).text(
      "Check out the grammY documentation at https://grammy.dev\n\n" +
        "grammY is a powerful framework for building Telegram bots!",
    ),
  );

  // Article with inline keyboard
  const keyboard = new InlineKeyboard()
    .url("Visit grammY", "https://grammy.dev")
    .row()
    .url("GitHub", "https://github.com/grammyjs/grammY");

  results.push(
    InlineQueryResultBuilder.article(
      "article-links",
      "grammY Resources",
      { reply_markup: keyboard },
    ).text("Useful grammY links:"),
  );

  // Article with Markdown formatting
  results.push(
    InlineQueryResultBuilder.article(
      "article-formatted",
      "Formatted Message",
    ).text(
      "*grammY* is _amazing_!\n\n" +
        "• Easy to use\n" +
        "• Type-safe\n" +
        "• Well documented\n\n" +
        "[Learn more](https://grammy.dev)",
      { parse_mode: "Markdown" },
    ),
  );

  // Query-specific results
  if (query.includes("hello") || query.includes("hi")) {
    results.push(
      InlineQueryResultBuilder.article(
        "greeting",
        "Send a Greeting",
      ).text("👋 Hello there! How can I help you today?"),
    );
  }

  if (query.includes("help")) {
    results.push(
      InlineQueryResultBuilder.article(
        "help",
        "Help Information",
      ).text(
        "Try searching for:\n" +
          "• 'hello' - Get a greeting\n" +
          "• 'help' - Show this help\n" +
          "• 'photo' - Get photo results\n" +
          "• Or just browse all results!",
      ),
    );
  }

  if (query.includes("photo")) {
    results.push(
      InlineQueryResultBuilder.photo(
        "photo-y",
        "https://grammy.dev/images/Y.svg",
      ).title("The Y from grammY"),
    );
  }

  // Answer the inline query
  // You can limit results, set cache time, and more
  await ctx.answerInlineQuery(results, {
    cache_time: 30, // Cache results for 30 seconds
  });
});

// Handle when a user selects an inline result
// This is optional but useful for analytics
bot.on("chosen_inline_result", async (ctx) => {
  const result = ctx.chosenInlineResult;
  console.log(
    `User ${result.from.id} chose result: ${result.result_id}`,
  );

  // You could store analytics, trigger actions, etc.
  // Note: You cannot send messages to the user here
});

// Regular bot commands
bot.command("start", async (ctx) => {
  await ctx.reply(
    "Welcome! This bot demonstrates inline query handling.\n\n" +
      "To use inline mode:\n" +
      "1. Go to any chat\n" +
      "2. Type @" + ctx.me.username + " followed by a search query\n" +
      "3. Select from the results\n\n" +
      "Try searching for: hello, help, photo, or just browse!",
  );
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "Inline Query Demo:\n\n" +
      "Use inline mode in any chat:\n" +
      "@" + ctx.me.username + " <search query>\n\n" +
      "Search terms:\n" +
      "• 'hello' or 'hi' - Get a greeting\n" +
      "• 'help' - Show help information\n" +
      "• 'photo' - Get photo results\n" +
      "• Empty or any text - See all results\n\n" +
      "Note: Inline mode must be enabled via @BotFather",
  );
});

bot.command("inline", async (ctx) => {
  await ctx.reply(
    "To enable inline mode for your bot:\n\n" +
      "1. Send /setinline to @BotFather\n" +
      "2. Select your bot\n" +
      "3. Send a placeholder text (e.g., 'Search...')\n" +
      "4. Your bot is now ready for inline queries!\n\n" +
      "Optional: Use /setinlinefeedback to enable chosen_inline_result updates.",
  );
});

bot.start();
