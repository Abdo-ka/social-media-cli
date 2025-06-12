<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Social Media CLI Application

This is a Node.js CLI application for posting content to multiple social media platforms (Facebook, Instagram, Telegram, and LinkedIn).

## Project Structure
- Use ES modules throughout the project
- Maintain modular architecture with separate platform handlers
- Follow async/await patterns for API calls
- Use proper error handling and logging
- Support multiple content types (text, images, videos, mixed)
- Use commander.js for CLI interface and inquirer for interactive prompts

## Code Guidelines
- Use descriptive variable and function names
- Implement proper error handling with try-catch blocks
- Log important events and errors using winston
- Use environment variables for API keys and sensitive data
- Implement retry logic for failed API calls
- Follow Node.js best practices for file handling and async operations
