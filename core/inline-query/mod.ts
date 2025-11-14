/**
 * Inline Query Plugin Example
 *
 * This example demonstrates how to use the built-in inline query plugin
 * to handle inline queries and chosen inline results.
 *
 * Key concepts:
 * - Using the inlineQuery plugin for pattern matching
 * - Returning different types of inline query results
 * - Handling chosen inline results
 * - Pagination with offset-based loading
 * - Personal/cached result sets
 *
 * Note: To use inline queries, you need to enable inline mode for your bot
 * by messaging @BotFather and using the /setinline command.
 *
 * @module
 */

import { Bot, InlineKeyboard } from "https://deno.land/x/grammy@v1.30.0/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is required");

const bot = new Bot(token);

// Handle empty inline queries (user types @botname with no search term)
bot.inlineQuery("", async (ctx) => {
  await ctx.answerInlineQuery(
    [
      {
        type: "article",
        id: "welcome",
        title: "Welcome!",
        description: "Learn how to use inline queries",
        input_message_content: {
          message_text: "👋 Welcome! Try typing @" + ctx.me.username +
            " search <term>",
        },
      },
      {
        type: "article",
        id: "help",
        title: "Help",
        description: "Get help with inline queries",
        input_message_content: {
          message_text: "Available inline commands:\n" +
            "• search <term> - Search for articles\n" +
            "• number <n> - Generate a number fact\n" +
            "• random - Get a random result",
        },
      },
    ],
    {
      cache_time: 300, // Cache results for 5 minutes
    },
  );
});

// Handle search queries
bot.inlineQuery(/^search\s+(.+)/, async (ctx) => {
  const searchTerm = ctx.match[1];

  // Simulate search results
  const results = [
    {
      type: "article" as const,
      id: `search-1-${searchTerm}`,
      title: `Result 1 for "${searchTerm}"`,
      description: "This is the first result",
      input_message_content: {
        message_text: `📄 Result 1: You searched for "${searchTerm}"`,
      },
    },
    {
      type: "article" as const,
      id: `search-2-${searchTerm}`,
      title: `Result 2 for "${searchTerm}"`,
      description: "This is the second result",
      input_message_content: {
        message_text: `📄 Result 2: You searched for "${searchTerm}"`,
        parse_mode: "Markdown" as const,
      },
    },
    {
      type: "article" as const,
      id: `search-3-${searchTerm}`,
      title: `Result 3 for "${searchTerm}"`,
      description: "This result includes a keyboard",
      input_message_content: {
        message_text: `📄 Result 3: "${searchTerm}" with interactive button`,
      },
      reply_markup: new InlineKeyboard().url(
        "Learn More",
        "https://grammy.dev",
      ),
    },
  ];

  await ctx.answerInlineQuery(results, {
    cache_time: 60,
  });
});

// Handle number-based queries
bot.inlineQuery(/^number\s+(\d+)/, async (ctx) => {
  const number = parseInt(ctx.match[1]);

  await ctx.answerInlineQuery([
    {
      type: "article",
      id: `number-${number}`,
      title: `Number ${number}`,
      description: `Information about ${number}`,
      input_message_content: {
        message_text: `🔢 The number ${number}\n\n` +
          `• Square: ${number * number}\n` +
          `• Double: ${number * 2}\n` +
          `• Half: ${number / 2}`,
      },
    },
  ]);
});

// Handle random queries
bot.inlineQuery(/^random/, async (ctx) => {
  const randomNum = Math.floor(Math.random() * 100);
  const emojis = ["🎲", "🎰", "🃏", "🎯", "🎪"];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  await ctx.answerInlineQuery([
    {
      type: "article",
      id: `random-${Date.now()}`,
      title: "Random Result",
      description: `Get a random number and emoji`,
      input_message_content: {
        message_text: `${randomEmoji} Your random number is: ${randomNum}`,
      },
    },
  ]);
});

// Handle pagination example
bot.inlineQuery(/^paginate/, async (ctx) => {
  const offset = parseInt(ctx.inlineQuery.offset || "0");
  const pageSize = 5;

  // Generate paginated results
  const results = [];
  for (let i = 0; i < pageSize; i++) {
    const itemNum = offset + i + 1;
    results.push({
      type: "article" as const,
      id: `page-item-${itemNum}`,
      title: `Item ${itemNum}`,
      description: `This is item number ${itemNum}`,
      input_message_content: {
        message_text: `📑 Item ${itemNum} from paginated results`,
      },
    });
  }

  await ctx.answerInlineQuery(results, {
    next_offset: String(offset + pageSize),
    cache_time: 0, // Don't cache for pagination
  });
});

// Handle when user actually sends an inline result
bot.on("chosen_inline_result", (ctx) => {
  const resultId = ctx.chosenInlineResult.result_id;
  const query = ctx.chosenInlineResult.query;

  console.log(`User chose inline result: ${resultId} from query: "${query}"`);

  // You can track analytics or perform other actions here
  // Note: You cannot send a message to the user here directly
  // but you can log, update databases, etc.
});

// Regular commands
bot.command("start", async (ctx) => {
  await ctx.reply(
    "👋 Welcome to the Inline Query Demo!\n\n" +
      "To use inline queries:\n" +
      "1. Go to any chat\n" +
      "2. Type @" + ctx.me.username + " followed by a command\n" +
      "3. Select a result to send\n\n" +
      "Try these:\n" +
      "• @" + ctx.me.username + " search grammY\n" +
      "• @" + ctx.me.username + " number 42\n" +
      "• @" + ctx.me.username + " random\n" +
      "• @" + ctx.me.username + " paginate",
  );
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "Inline Query Plugin Demo:\n\n" +
      "Available inline commands:\n" +
      "• search <term> - Search and get results\n" +
      "• number <n> - Get info about a number\n" +
      "• random - Get a random result\n" +
      "• paginate - See pagination in action\n\n" +
      "Use inline mode in any chat by typing:\n" +
      "@" + ctx.me.username + " <command>",
  );
});

bot.start();
