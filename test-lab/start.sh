#!/bin/bash
# Quick start script for VulnCorp Test Lab
# Author: OFJAAAH

clear

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🎯 VulnCorp Test Laboratory                               ║"
echo "║  Dependency Confusion Testing Environment                  ║"
echo "║  Author: OFJAAAH                                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if extension is installed
echo "📋 Pre-flight checks..."
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed!"
    echo "   Please install Python 3 and try again."
    exit 1
fi
echo "✅ Python 3 found"

# Check Chrome/Chromium
if command -v google-chrome &> /dev/null || command -v chromium &> /dev/null || command -v chrome &> /dev/null; then
    echo "✅ Chrome/Chromium found"
else
    echo "⚠️  Chrome/Chromium not found in PATH"
    echo "   Make sure Chrome is installed"
fi

echo ""
echo "🚀 Starting test server..."
echo ""

# Start server
python3 server.py
