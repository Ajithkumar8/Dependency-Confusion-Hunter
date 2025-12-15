#!/bin/bash
# Build script for Dependency Confusion Hunter
# Author: OFJAAAH

set -e

echo "🎯 Building Dependency Confusion Hunter..."
echo "Author: OFJAAAH"
echo ""

# Check if icons exist
if [ ! -d "icons" ] || [ ! -f "icons/icon16.png" ]; then
    echo "📦 Icons not found. Creating icons..."
    python3 create_icons.py
    echo "✅ Icons created successfully!"
else
    echo "✅ Icons found"
fi

# Create build directory
BUILD_DIR="build"
EXTENSION_NAME="dependency-confusion-hunter"
VERSION="1.1.1"
OUTPUT_FILE="${EXTENSION_NAME}-v${VERSION}.zip"

echo ""
echo "🏗️  Creating build directory..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Copy necessary files
echo "📁 Copying files..."
cp manifest.json "$BUILD_DIR/"
cp background.js "$BUILD_DIR/"
cp content.js "$BUILD_DIR/"
cp injected.js "$BUILD_DIR/"
cp popup.html "$BUILD_DIR/"
cp popup.js "$BUILD_DIR/"
cp options.html "$BUILD_DIR/"
cp options.js "$BUILD_DIR/"
cp styles.css "$BUILD_DIR/"
cp -r icons "$BUILD_DIR/"

echo "✅ Files copied"

# Create zip package
echo ""
echo "📦 Creating zip package..."
cd "$BUILD_DIR"
zip -r "../${OUTPUT_FILE}" ./* -q
cd ..

echo "✅ Package created: ${OUTPUT_FILE}"

# Calculate size
SIZE=$(du -h "${OUTPUT_FILE}" | cut -f1)
echo ""
echo "📊 Package size: ${SIZE}"

# Cleanup
echo ""
echo "🧹 Cleaning up..."
rm -rf "$BUILD_DIR"

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Package: ${OUTPUT_FILE}"
echo "🚀 To install:"
echo "   1. Open chrome://extensions/"
echo "   2. Enable Developer mode"
echo "   3. Click 'Load unpacked'"
echo "   4. Select this directory"
echo ""
echo "Or extract the zip and load from there."
echo ""
echo "🎯 Happy hunting! - OFJAAAH"
