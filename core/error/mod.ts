/**
 * Error boundary examples using grammY.
 */

import {
  Bot,
  BotError,
  type Context,
  type NextFunction,
} from "https://deno.land/x/grammy@v1.30.0/mod.ts";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is required");

const bot = new Bot(token);

const haltingBoundary = bot.errorBoundary(
  (error: BotError<Context>) => {
    console.error("Halting boundary caught:", error.error);
  },
);

haltingBoundary.command("fail_stop", () => {
  throw new Error("Halting boundary demonstration");
});

bot.command("fail_stop", async (ctx) => {
  await ctx.reply(
    "This message never appears because the halting boundary ends the chain.",
  );
});

const resumingBoundary = bot.errorBoundary(
  async (error: BotError<Context>, next: NextFunction) => {
    console.error("Resuming boundary caught:", error.error);
    await next();
  },
);

resumingBoundary.command("fail_resume", () => {
  throw new Error("Resuming boundary demonstration");
});

bot.command("fail_resume", async (ctx) => {
  await ctx.reply(
    "The resuming boundary ran and allowed this fallback handler to execute.",
  );
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "Error Boundary Demo:\n" +
      "/fail_stop - Error stops downstream handlers\n" +
      "/fail_resume - Error resumes downstream handlers",
  );
});

bot.start();
