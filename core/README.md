# Core grammY Patterns

This directory contains idiomatic examples of using the grammY bot library, organized by topic. It includes both core library features and built-in plugins maintained by the grammY team.

## Purpose

The examples here demonstrate best practices for:

- Basic bot structure and organization
- Middleware patterns and composition
- Context handling and type safety
- Command handling
- Error handling
- State management without external plugins
- Using built-in plugins for common functionality

## Examples

### basic/mod.ts

Demonstrates fundamental bot setup including:

- Bot instantiation and configuration
- Basic command handlers (`/start`, `/help`, `/echo`)
- Text message handling
- Command argument extraction
- Starting the bot with long polling

### error/mod.ts

Comprehensive error handling strategies:

- Global error handler with `bot.catch()`
- Error boundary middleware
- Try-catch patterns in handlers
- Handling specific Telegram API errors
- Retry logic for transient failures
- Input validation and sanitization

### functions/mod.ts

Covers different command handling approaches:

- Simple commands with static responses
- Commands with arguments and validation
- Multi-argument parsing and processing
- Extracting user and chat information
- Subcommand patterns (e.g., `/admin start`, `/admin stop`)

### media-group/mod.ts

Demonstrates the built-in media group plugin:

- Detecting and handling media sent as albums
- Processing complete media groups after all items are received
- Differentiating between grouped and single media
- Accessing individual media items within a group
- Handling mixed media types (photos, videos, documents)

### inline-query/mod.ts

Demonstrates the built-in inline query plugin:

- Pattern-based inline query matching
- Returning different types of inline results (articles, photos, etc.)
- Handling chosen inline results for analytics
- Implementing pagination with offset-based loading
- Providing interactive results with inline keyboards
- Caching strategies for inline query results

## Usage

Each example file can be run independently:

```bash
# Set your bot token
export BOT_TOKEN="your_bot_token_here"

# Run an example
deno run --allow-net --allow-env core/basic/mod.ts
```

The examples are self-contained and demonstrate idiomatic grammY patterns. Each file creates and configures a bot instance directly, making them simple to understand and adapt to your needs.

## Guidelines

- Examples use the core grammY library and built-in plugins maintained by the grammY team
- Only built-in plugins (like media-group, inline-query) are included; third-party plugins are in separate directories
- Code follows Deno best practices (see [AGENTS.md](../AGENTS.md))
- Examples are meant to be educational and reusable
- Each example is well-documented with explanatory comments
- Examples instantiate and configure bots directly; copy or adapt full example files into your project if you want to reuse patterns
