/**
 * Session middleware patterns using grammY's built-in plugin.
 *
 * Highlights:
 * - Automatic per-chat state storage
 * - Custom initial session factories
 * - Session-powered commands for stateful interactions
 */

import {
  Bot,
  type Context,
  session,
  type SessionFlavor,
} from "https://deno.land/x/grammy@v1.30.0/mod.ts";

interface SessionData {
  visits: number;
  notes: string[];
}

type SessionContext = Context & SessionFlavor<SessionData>;

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is required");

const bot = new Bot<SessionContext>(token);

const initialSession = (): SessionData => ({
  visits: 0,
  notes: [],
});

bot.use(session({ initial: initialSession }));

bot.command("start", async (ctx) => {
  ctx.session.visits += 1;

  const visitText = ctx.session.visits === 1
    ? "This is your first session."
    : `You have started the bot ${ctx.session.visits} times.`;

  await ctx.reply(
    "Session middleware example ready.\n" +
      visitText,
  );
});

bot.command("note", async (ctx) => {
  const note = ctx.match?.trim();
  if (!note) {
    await ctx.reply("Usage: /note <text to remember>");
    return;
  }

  ctx.session.notes.push(note);
  await ctx.reply(`Stored note #${ctx.session.notes.length}.`);
});

bot.command("notes", async (ctx) => {
  if (ctx.session.notes.length === 0) {
    await ctx.reply("No notes saved yet.");
    return;
  }

  const list = ctx.session.notes.map((value, index) => `${index + 1}. ${value}`)
    .join("\n");

  await ctx.reply(`Your notes:\n${list}`);
});

bot.command("reset", async (ctx) => {
  ctx.session = initialSession();
  await ctx.reply("Session data cleared.");
});

bot.on("message:text", async (ctx) => {
  if (ctx.msg.text.startsWith("/")) {
    return;
  }

  await ctx.reply(
    "Use /note to store text, /notes to list them, and /reset to clear your session.",
  );
});

bot.start();
