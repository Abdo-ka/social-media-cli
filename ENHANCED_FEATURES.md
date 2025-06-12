# 🎉 Enhanced Social Media CLI - Complete Usage Guide

## ✅ Recently Added Features

### 1. **Multi-Select Platform Options**
- ✅ **"all" keyword**: Use `--platforms all` to post to all supported platforms
- ✅ **Interactive checkbox**: Multi-select platforms in interactive mode
- ✅ **Comma-separated**: Traditional comma-separated platform list

### 2. **Enhanced Media File Support**
- ✅ **Multiple files**: Pass multiple media files directly from your device
- ✅ **File path validation**: Automatically checks if files exist on your device
- ✅ **Mixed content**: Support for images and videos in the same post

## 🚀 Usage Examples

### Platform Selection Options

#### 1. All Platforms
```bash
# Post to all supported platforms
npm start -- post --platforms all --content "Hello everyone!"
```

#### 2. Specific Platforms
```bash
# Single platform
npm start -- post --platforms facebook --content "Facebook only post"

# Multiple platforms
npm start -- post --platforms facebook,instagram,linkedin --content "Multi-platform post"
```

#### 3. Interactive Multi-Select
```bash
# Use interactive mode with checkbox selection
npm start -- post --interactive
```

### Media File Support

#### 1. Single Media File
```bash
# Post with one image
npm start -- post --content "Check this out!" --platforms all --media /path/to/your/photo.jpg

# Using sample files
npm start -- post --content "Sample image" --platforms facebook --media examples/media/photo.png
```

#### 2. Multiple Media Files
```bash
# Multiple files from your device
npm start -- post --content "Photo gallery" --platforms all --media /Users/username/Photos/img1.jpg /Users/username/Photos/img2.png /Users/username/Videos/video.mp4

# Using sample files
npm start -- post --content "Mixed media" --platforms all --media examples/media/photo.png examples/media/sample1.jpg examples/media/sample2.mp4
```

#### 3. Scheduled Posts with Media
```bash
# Schedule a post with media for Christmas
npm start -- post --content "Holiday photos!" --platforms all --media /path/to/holiday1.jpg /path/to/holiday2.jpg --schedule "2025-12-25 10:00"
```

### Complete Usage Examples

#### Example 1: Simple Text Post to All Platforms
```bash
npm start -- post --platforms all --content "Good morning everyone! 🌅"
```

#### Example 2: Image Post with Scheduling
```bash
npm start -- post --content "Beautiful sunset from my trip!" --platforms instagram,facebook --media ~/Pictures/sunset.jpg --schedule "2025-07-01 18:00"
```

#### Example 3: Multi-Media Post to Specific Platforms
```bash
npm start -- post --content "Event highlights! 🎉" --platforms facebook,linkedin --media ~/Events/photo1.jpg ~/Events/photo2.jpg ~/Events/video.mp4
```

#### Example 4: Interactive Mode for Complex Posts
```bash
npm start -- post --interactive
```

## 📁 Supported File Types

### Images
- **JPEG**: `.jpg`, `.jpeg`
- **PNG**: `.png`
- **GIF**: `.gif`
- **WebP**: `.webp`
- **SVG**: `.svg`
- **BMP**: `.bmp`

### Videos
- **MP4**: `.mp4`
- **AVI**: `.avi`
- **MOV**: `.mov`
- **MKV**: `.mkv`
- **WebM**: `.webm`
- **FLV**: `.flv`

### File Path Examples
```bash
# Absolute paths
/Users/username/Pictures/vacation.jpg
/Users/username/Movies/presentation.mp4

# Relative paths (from project directory)
examples/media/photo.png
~/Documents/my-image.jpg

# Multiple file types
/path/to/image1.jpg /path/to/image2.png /path/to/video.mp4
```

## 🎯 Interactive Mode Features

When you run `npm start -- post --interactive`, you get:

1. **✅ Multi-Select Platform Checkboxes**
   ```
   ? Select platforms to post to: (Press <space> to select, <a> to toggle all, <i> to invert selection)
   ❯◉ Facebook
    ◉ Instagram  
    ◯ Telegram
    ◉ LinkedIn
   ```

2. **📝 Rich Text Editor**
   - Opens your default editor for post content
   - Supports multi-line content

3. **📁 Media File Prompts**
   - Ask if you want to add media
   - Comma-separated file path input
   - Automatic file validation

4. **⏰ Scheduling Options**
   - Option to schedule or post immediately
   - Date/time input with validation

## 🔧 Command Reference

### Basic Commands
```bash
# Show help
npm start -- --help
npm start -- post --help

# Check platform status
npm start -- status

# List scheduled posts
npm start -- list

# Cancel a post
npm start -- cancel <post-id>
```

### Post Command Options
```bash
-p, --platforms <platforms>  # "all" or comma-separated list
-c, --content <content>      # Post text content
-m, --media <files...>       # Multiple media file paths
-s, --schedule <datetime>    # YYYY-MM-DD HH:MM format
-i, --interactive           # Interactive mode
```

## 🎨 Real-World Examples

### Example 1: Business Announcement
```bash
npm start -- post \
  --platforms linkedin,facebook \
  --content "🎉 Excited to announce our new product launch! More details coming soon." \
  --media ~/Business/product-banner.jpg \
  --schedule "2025-07-15 09:00"
```

### Example 2: Social Media Manager
```bash
# Morning post
npm start -- post --platforms all --content "Good morning! What's everyone working on today? 💪" 

# Afternoon content with media
npm start -- post \
  --platforms instagram,facebook \
  --content "Behind the scenes at today's photoshoot! 📸✨ #BTS #Photography" \
  --media ~/Shoots/bts1.jpg ~/Shoots/bts2.jpg ~/Shoots/bts3.jpg
```

### Example 3: Event Promotion
```bash
npm start -- post \
  --platforms all \
  --content "🎪 Don't miss our upcoming tech conference! Early bird tickets available now. Link in bio! #TechConf2025" \
  --media ~/Events/conference-poster.jpg ~/Events/speaker-lineup.png \
  --schedule "2025-08-01 14:00"
```

## 🚨 Error Handling

The system now provides better error messages:

### File Not Found
```
❌ File not found on your device: /wrong/path/image.jpg
```

### Platform Validation
```
❌ Unsupported platform: twitter. Supported platforms: facebook, instagram, telegram, linkedin
```

### File Validation
```
📁 Validating 3 media files from your device...
  ✓ Found: /path/to/image1.jpg
  ✓ Found: /path/to/image2.png
  ❌ File not found: /path/to/missing.jpg
```

## 📊 Success Indicators

### Successful Scheduling
```
✅ Post scheduled successfully!
   Will be posted on 12/25/2025, 10:00:00 AM
```

### File Validation Success
```
📁 Validating 2 media files from your device...
  ✓ Found: examples/media/photo.png
  ✓ Found: examples/media/sample1.jpg
✅ All media files validated successfully
```

### Post Summary
```
📋 Post Summary:
  ID: abc123xyz789
  Platforms: facebook, instagram, telegram, linkedin
  Content Type: mixed
  Text: Your post content here
  Media Files: 3 file(s)
  Scheduled: 12/25/2025, 10:00:00 AM
```

## 🎯 Pro Tips

1. **Use "all" for maximum reach**: `--platforms all`
2. **Organize media files**: Keep media in organized folders for easy access
3. **Test with sample files**: Use `examples/media/` files for testing
4. **Check file paths**: Use absolute paths to avoid confusion
5. **Interactive mode for complex posts**: Use `--interactive` for rich content creation
6. **Preview with status**: Run `npm start -- status` to check platform configuration

## 🔮 Coming Soon

- **Drag & drop file support** in interactive mode
- **Image resizing** for platform-specific requirements  
- **Bulk upload** from directories
- **Media preview** before posting
- **Template system** for recurring posts

---

**Your Social Media CLI is now more powerful than ever! 🚀**
