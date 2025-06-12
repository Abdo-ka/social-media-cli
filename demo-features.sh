#!/bin/bash
# Demo Script: Multi-Select Platforms & Media Files Features
# Social Media CLI Tool

echo "🚀 Social Media CLI - Enhanced Features Demo"
echo "=============================================="
echo ""

# Build the project first
echo "📦 Building the project..."
npm run build
echo ""

echo "✨ Feature 1: Multi-Select Platform Options"
echo "==========================================="
echo ""

echo "1.1 Using comma-separated platforms:"
echo "Command: post --content 'Multi-platform test' --platforms facebook,instagram,linkedin"
node dist/bin/social-cli.js post --content "Multi-platform test post" --platforms facebook,instagram,linkedin
echo ""

echo "1.2 Using 'all' platforms keyword:"
echo "Command: post --content 'All platforms test' --platforms all"
node dist/bin/social-cli.js post --content "Testing all platforms at once" --platforms all
echo ""

echo "✨ Feature 2: Media Files from Device Paths"
echo "==========================================="
echo ""

echo "2.1 Single image file:"
echo "Command: post --content 'Single image' --media ./examples/media/photo.png --platforms instagram"
node dist/bin/social-cli.js post --content "Single image post" --media ./examples/media/photo.png --platforms instagram
echo ""

echo "2.2 Multiple image files:"
echo "Command: post --content 'Multiple images' --media ./examples/media/photo.png ./examples/media/sample1.jpg --platforms facebook"
node dist/bin/social-cli.js post --content "Multiple images post" --media ./examples/media/photo.png ./examples/media/sample1.jpg --platforms facebook
echo ""

echo "2.3 Mixed media (image + video):"
echo "Command: post --content 'Mixed media' --media ./examples/media/sample1.jpg ./examples/media/sample2.mp4 --platforms telegram"
node dist/bin/social-cli.js post --content "Mixed media post with image and video" --media ./examples/media/sample1.jpg ./examples/media/sample2.mp4 --platforms telegram
echo ""

echo "✅ Demo Complete!"
echo ""
echo "💡 Interactive Mode Demo:"
echo "To test the interactive checkbox multi-select for platforms, run:"
echo "   node dist/bin/social-cli.js post --interactive"
echo ""
echo "📚 Help & Documentation:"
echo "   node dist/bin/social-cli.js post --help"
echo ""
echo "🎯 Key Features Demonstrated:"
echo "   ✓ Multi-platform selection (comma-separated & 'all')"
echo "   ✓ Multiple media files from device paths"
echo "   ✓ File existence validation"
echo "   ✓ Mixed content types (images + videos)"
echo "   ✓ Interactive checkbox mode"
