# Core grammY Patterns

This directory contains idiomatic examples of using the grammY bot library with no additional plugins.

## Purpose

The examples here demonstrate best practices for:

- Basic bot structure and organization
- Middleware patterns and composition
- Context handling and type safety
- Command handling
- Message filtering and routing
- Error handling
- State management without external plugins

## Examples

### basic_bot.ts

Demonstrates fundamental bot setup including:

- Bot instantiation and configuration
- Basic command handlers (`/start`, `/help`, `/echo`)
- Text message handling
- Command argument extraction
- Starting the bot with long polling

### middleware_patterns.ts

Shows various middleware patterns:

- Logging middleware for tracking updates
- Response time measurement middleware
- Authentication middleware with user filtering
- Error handling middleware
- Middleware composition and execution order

### command_handling.ts

Covers different command handling approaches:

- Simple commands with static responses
- Commands with arguments and validation
- Multi-argument parsing and processing
- Extracting user and chat information
- Subcommand patterns (e.g., `/admin start`, `/admin stop`)

### context_and_filtering.ts

Demonstrates context usage and message filtering:

- Using context shortcuts (`ctx.msg`, `ctx.chat`, `ctx.from`)
- Filter queries for different message types
- Entity extraction (URLs, mentions, etc.)
- Handling forwarded and edited messages
- Filtering by chat type and user ID

### error_handling.ts

Comprehensive error handling strategies:

- Global error handler with `bot.catch()`
- Error boundary middleware
- Try-catch patterns in handlers
- Handling specific Telegram API errors
- Retry logic for transient failures
- Input validation and sanitization

### bot_composition.ts

Shows how to organize larger bots:

- Using `Composer` to group related handlers
- Breaking functionality into feature modules
- Composing features into a main bot
- Managing feature-specific state
- Cross-cutting concerns (logging, error handling)

## Usage

Each example file can be run independently:

```bash
# Set your bot token
export BOT_TOKEN="your_bot_token_here"

# Run an example
deno run --allow-net --allow-env core/basic_bot.ts
```

The examples are self-contained and demonstrate idiomatic grammY patterns. Each file creates and configures a bot instance directly, making them simple to understand and adapt to your needs.

## Guidelines

- All examples use only the core grammY library
- No grammY plugins are used in this directory
- Code follows Deno best practices (see [AGENTS.md](../AGENTS.md))
- Examples are meant to be educational and reusable
- Each example is well-documented with explanatory comments
- Examples instantiate and configure bots directly; copy or adapt full example files into your project if you want to reuse patterns
