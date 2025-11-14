# Core grammY Patterns

This directory contains idiomatic examples of using the grammY bot library with no additional plugins, organized by topic.

## Purpose

The examples here demonstrate best practices for:

- Basic bot structure and organization
- Middleware patterns and composition
- Context handling and type safety
- Command handling
- Error handling
- State management without external plugins
- Media group handling
- Inline query responses

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

Demonstrates sending and handling media groups:

- Using `InputMediaBuilder` to create media objects
- Sending media groups with `sendMediaGroup`
- Handling incoming media group messages
- Working with different media types (photo, video, audio, document)
- Using public URLs vs. local files with `InputFile`

### inline-query/mod.ts

Shows how to handle inline queries:

- Listening for inline queries with `bot.on("inline_query")`
- Using `InlineQueryResultBuilder` to create results
- Different result types (photo, article, etc.)
- Adding inline keyboards to results
- Handling result selections with `chosen_inline_result`
- Query-based result filtering

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

- All examples use only the core grammY library
- No grammY plugins are used in this directory
- Code follows Deno best practices (see [AGENTS.md](../AGENTS.md))
- Examples are meant to be educational and reusable
- Each example is well-documented with explanatory comments
- Examples instantiate and configure bots directly; copy or adapt full example files into your project if you want to reuse patterns
