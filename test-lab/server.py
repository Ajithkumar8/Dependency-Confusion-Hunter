#!/usr/bin/env python3
"""
VulnCorp Test Laboratory Server
Author: OFJAAAH

Simple HTTP server to serve the test application
"""

import http.server
import socketserver
import os
import sys
from datetime import datetime

PORT = 8081
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler with logging and CORS"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # Add CSP header to allow extension
        self.send_header('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval';")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        # Custom logging format
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        message = format % args
        print(f"[{timestamp}] {self.address_string()} - {message}")

    def do_GET(self):
        # Log GET requests
        print(f"\n🌐 GET {self.path}")

        # Serve index.html for root
        if self.path == '/':
            self.path = '/index.html'

        return super().do_GET()

def main():
    """Start the server"""

    print("=" * 60)
    print("🎯 VulnCorp Test Laboratory Server")
    print("   Author: OFJAAAH")
    print("=" * 60)
    print()
    print(f"📁 Serving directory: {DIRECTORY}")
    print(f"🌐 Server starting on port {PORT}...")
    print()
    print("📝 Instructions:")
    print("   1. Make sure Dependency Confusion Hunter extension is installed")
    print("   2. Open your browser and navigate to:")
    print(f"      http://localhost:{PORT}")
    print("   3. Wait 5-10 seconds for the extension to analyze")
    print("   4. Click the extension icon to see detected packages")
    print()
    print("🎯 Expected detections:")
    print("   - vulncorp-auth-service (npm)")
    print("   - vulncorp-analytics-engine (npm)")
    print("   - internal-data-processor-v2 (npm)")
    print("   - company-private-api-sdk (npm)")
    print("   - secret-crypto-lib (npm)")
    print("   - vulncorp-logger (npm)")
    print("   - enterprise-cache-manager (npm)")
    print("   - internal_ml_framework (pip)")
    print("   - company_data_utils (pip)")
    print("   - vulncorp_ml_models (pip)")
    print()
    print("=" * 60)
    print(f"✅ Server ready at http://localhost:{PORT}")
    print("   Press Ctrl+C to stop")
    print("=" * 60)
    print()

    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
