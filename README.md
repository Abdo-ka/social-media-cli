# Social Media CLI Tool

A powerful Node.js CLI application for posting content to multiple social media platforms including Facebook, Instagram, Telegram, and LinkedIn.

## Features

- 📱 **Multi-Platform Support**: Post to Facebook, Instagram, Telegram, and LinkedIn
- 📁 **Multiple Content Types**: Support for text, images, videos, and mixed content
- 🔄 **Retry Logic**: Automatic retry on failed API calls
- 📊 **Logging**: Comprehensive logging with Winston
- 🎯 **Interactive CLI**: User-friendly prompts with inquirer.js
- 🛡️ **Type Safety**: Full TypeScript implementation
- 🔧 **Modular Architecture**: Clean, maintainable codebase

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- API credentials for desired social media platforms

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
npm run build
```

### Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Facebook
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
FACEBOOK_PAGE_ID=your_facebook_page_id

# Instagram Business
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
INSTAGRAM_ACCOUNT_ID=your_instagram_account_id

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# LinkedIn
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token
LINKEDIN_PERSON_ID=your_linkedin_person_id
```

## Usage

### Quick Start

Run the CLI tool:

```bash
npm start
```

Or directly:

```bash
node dist/bin/social-cli.js
```

### Available Commands

#### 1. Post Content

**Interactive Mode:**
```bash
node dist/bin/social-cli.js post
```

**Direct Mode:**
```bash
# Text post
node dist/bin/social-cli.js post --content "Hello World!" --platforms facebook,instagram

# Image post
node dist/bin/social-cli.js post --content "Check this out!" --media ./image.jpg --platforms instagram

# Multiple media files
node dist/bin/social-cli.js post --content "Multi-media post" --media ./image1.jpg ./video.mp4 --platforms all
```

#### 2. Check Platform Status
node dist/bin/social-cli.js list --status pending
```

#### 3. Check Platform Status

```bash
```bash
node dist/bin/social-cli.js status
node dist/bin/social-cli.js status --platform instagram
```

### Content Types

#### Text Posts
```bash
node dist/bin/social-cli.js post --content "Your message here" --platforms facebook,linkedin
```

#### Image Posts
```bash
node dist/bin/social-cli.js post --content "Caption" --media ./photo.jpg --platforms instagram,facebook
```

#### Video Posts
```bash
node dist/bin/social-cli.js post --content "Video description" --media ./video.mp4 --platforms facebook,telegram
```

#### Mixed Content
```bash
node dist/bin/social-cli.js post --content "Mixed post" --media ./img1.jpg ./img2.jpg ./video.mp4 --platforms all
```


### Platform-Specific Features

#### Facebook
- Page posts
- Image and video uploads
- Link previews

#### Instagram
- Business account posts
- Image and video content
- Caption with hashtags

#### Telegram
- Bot messaging
- Media sharing
- Markdown formatting
- Channel posting

#### LinkedIn
- Professional posts
- Article sharing
- Company page posts
- Rich media content

## Configuration

### File Structure

```
social_media/
├── src/
│   ├── bin/           # CLI entry point
│   ├── commands/      # Command handlers
│   ├── config/        # Configuration management
│   ├── platforms/     # Platform implementations
│   ├── types/         # TypeScript definitions
│   └── utils/         # Utility functions
├── dist/              # Compiled JavaScript
├── logs/              # Application logs
├── data/              # Post storage
└── uploads/           # Temporary file storage
```

### Platform Setup

#### Facebook Setup

1. Create a Facebook Developer App
2. Generate a Page Access Token
3. Add token to `.env` file

#### Instagram Setup

1. Convert to Instagram Business Account
2. Connect to Facebook Page
3. Use Facebook Graph API credentials

#### Telegram Setup

1. Create a bot via @BotFather
2. Get bot token
3. Get chat ID for target channel/user

#### LinkedIn Setup

1. Create LinkedIn Developer App
2. Request API access
3. Generate OAuth 2.0 token

## Development

### Available Scripts

```bash
npm run build          # Compile TypeScript
npm run dev            # Development mode with watch
npm run clean          # Clean dist folder
npm run lint           # Run ESLint
npm run test           # Run tests
npm start              # Run the compiled CLI
```

### Project Structure

- **TypeScript**: Full type safety throughout
- **ES Modules**: Modern module system
- **Async/Await**: Promise-based architecture
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Winston-based logging system
- **Validation**: Input and file validation
- **Retry Logic**: Automatic retry for failed operations

### Adding New Platforms

1. Create platform interface in `src/types/index.ts`
2. Implement platform class in `src/platforms/`
3. Add platform to `src/platforms/index.ts`
4. Update configuration in `src/config/config.ts`

## Error Handling

The application includes robust error handling:

- **API Failures**: Automatic retry with exponential backoff
- **File Validation**: Pre-upload file checking
- **Network Issues**: Graceful degradation
- **Invalid Inputs**: User-friendly error messages
- **Logging**: Detailed error logs for debugging

## Logging

Logs are stored in the `logs/` directory:

- `app.log`: General application logs
- `error.log`: Error-specific logs

Log levels: `error`, `warn`, `info`, `debug`

## Security

- Environment variables for sensitive data
- Token validation before API calls
- File type and size validation
- Input sanitization
- Secure file handling

## Troubleshooting

### Common Issues

1. **API Token Errors**
   - Verify tokens in `.env` file
   - Check token permissions and expiration

2. **File Upload Failures**
   - Verify file exists and is readable
   - Check file size limits for each platform
   - Ensure correct file format

3. **Platform Connection Errors**
   - Test platform credentials
   - Check network connectivity
   - Verify API endpoint availability

### Debug Mode

Enable debug logging:

```bash
NODE_ENV=development node dist/bin/social-cli.js post --debug
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review the logs in `logs/` directory
3. Create an issue on GitHub
4. Contact support team

## Changelog

### v1.0.0
- Initial release
- Multi-platform support (Facebook, Instagram, Telegram, LinkedIn)
- Interactive and direct posting modes
- Media file support (images, videos, mixed content)
- TypeScript implementation with full type safety
- CLI interface with Commander.js
- Winston logging system
- Comprehensive error handling

---

**Happy Posting! 🚀**
