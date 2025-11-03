/**
 * Command handler that parses multiple arguments.
 *
 * Demonstrates parsing space-separated arguments.
 */

import { type CommandContext, type Context } from "grammy";

export async function handleCalcCommand(
  ctx: CommandContext<Context>,
): Promise<void> {
  const args = ctx.match?.trim().split(/\s+/);

  if (!args || args.length !== 3) {
    await ctx.reply(
      "Usage: /calc <number> <operator> <number>\n" +
        "Example: /calc 5 + 3",
    );
    return;
  }

  const [num1Str, operator, num2Str] = args;
  const num1 = parseFloat(num1Str);
  const num2 = parseFloat(num2Str);

  // Validate numbers
  if (isNaN(num1) || isNaN(num2)) {
    await ctx.reply("Both operands must be valid numbers.");
    return;
  }

  // Perform calculation
  let result: number;
  switch (operator) {
    case "+":
      result = num1 + num2;
      break;
    case "-":
      result = num1 - num2;
      break;
    case "*":
      result = num1 * num2;
      break;
    case "/":
      if (num2 === 0) {
        await ctx.reply("Cannot divide by zero.");
        return;
      }
      result = num1 / num2;
      break;
    default:
      await ctx.reply(
        `Unknown operator: ${operator}\n` +
          "Supported operators: + - * /",
      );
      return;
  }

  await ctx.reply(`${num1} ${operator} ${num2} = ${result}`);
}
