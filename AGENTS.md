# Agent Guide for grammy-skills

This guide defines expectations for automation and maintainers contributing to this repository while respecting Deno-centric workflows and the grammY ecosystem.

## Quick Facts

- Target runtime: Deno (primary)
- Primary entry point: [main.ts](main.ts:1)
- This repository serves as a collection of idiomatic ways to write code using the grammY bot library
- Canonical workflows are encapsulated in [deno.json](deno.json:1); run tasks instead of ad-hoc commands

## Deno Best Practices

### File Naming

- Use underscores instead of dashes in filenames (e.g., `file_server.ts`)
- Avoid using `index.ts` or `index.js` as filenames
- Prefer TypeScript (`.ts`) over JavaScript (`.js`)

### Code Organization

- Group related code by functionality in the same file or directory
- Each module should expose clear, focused functionality
- Avoid circular imports and minimize dependencies
- Keep modules focused on a single responsibility

### Function Design

- Limit exported functions to a maximum of two required arguments
- Use an options object for additional parameters
- Use JSDoc for all exported symbols
- Export all interfaces used as parameters

### Type Safety

- Enable strict mode in TypeScript
- Use explicit return types for exported functions
- Prefer type-safe equality checks (`===` and `!==`)
- Avoid type assertions unless absolutely necessary

### Testing

- Each module should be accompanied by tests for its public functionality
- Tests should be in `*_test.ts` files
- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks

## Agent Workflow

1. Before making changes, review existing code structure and patterns to match the repository's style
2. Use `deno task ok` defined in [deno.json](deno.json:1) to validate code before committing
3. Never commit code that fails linting, formatting, or type checking
4. Follow the existing patterns in the codebase for consistency
5. Update documentation when adding new examples or changing behavior

## Deno Runtime Commands

- **Linting**: `deno lint` - Analyzes code for potential errors and style issues
- **Formatting**: `deno fmt` - Formats code according to Deno standards
- **Type Checking**: `deno check <file>` - Validates TypeScript types without running code
- **Testing**: `deno test` - Runs all test files matching `*_test.ts` pattern
- **Combined validation**: `deno task ok` - Runs all checks (lint, format, check)

## grammY Best Practices

### Bot Structure

- Create a clear source code structure with organized middleware
- Group semantically related components in the same file or directory
- Use a central bot instance that merges all middleware
- Consider pre-filtering updates and using routing features

### Middleware Patterns

- Middleware functions process updates in a stack-like manner
- Always call `next()` if you want to allow further processing
- Order matters: first middleware receives updates first
- Use middleware for modular, reusable functionality

### Code Organization for Large Bots

- Separate concerns into different files by feature
- Each part should expose middleware for handling specific messages
- Use TypeScript for type safety with middleware and context objects
- Consider using the router plugin for complex update management

### Type Safety with grammY

- Define explicit types for middleware when extracting handlers into functions
- Use proper context types for better IDE support and type checking
- Leverage grammY's built-in type system for safer bot development

### Core Examples Style Guide

The `core/` directory contains idiomatic examples focused on demonstrating specific patterns:

- **No wrapper functions**: Examples should NOT use `createBot()` or similar wrapper functions
- **No import.meta.main checks**: Examples should start the bot directly with `bot.start()`
- **Direct instantiation**: Get `BOT_TOKEN` from environment and create bot instance at module level
- **Focus on patterns**: Each example demonstrates one specific pattern or concept
- **Educational comments**: Include clear, helpful comments that explain the pattern being demonstrated and grammY-specific concepts to make examples readable and educational
- **Self-contained**: Each example should be runnable independently with just a BOT_TOKEN environment variable

Example structure:

```typescript
import { Bot } from "grammy";

const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is required");

const bot = new Bot(token);

// Register handlers demonstrating the pattern
bot.command("start", async (ctx) => {
  await ctx.reply("Hello!");
});

bot.start();
```

## Project Structure

```text
grammy-skills/
├── core/           # Idiomatic grammY examples (no plugins)
├── main.ts         # Main entry point
├── deno.json       # Deno configuration and tasks
├── AGENTS.md       # This file - agent guidelines
└── README.md       # Project documentation
```

## Automation Checklist

Before committing:

- [ ] Run `deno task ok` to validate formatting, linting, and type-checking
- [ ] Ensure all tests pass if tests exist
- [ ] Update relevant documentation if adding new examples
- [ ] Follow the existing code style and patterns
- [ ] Use meaningful commit messages that explain the "why" not just the "what"

## Git Workflow

- Create feature branches for new work
- Keep commits focused and atomic
- Write clear commit messages
- Run `deno task ok` before every commit
- Never commit generated artifacts or dependencies
