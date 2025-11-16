#!/bin/bash
# Simple script to serve the test page
# Usage: ./test-server.sh

echo "Starting HTTP server on port 8000..."
echo "Open http://localhost:8000/test.html in your browser"
echo "Press Ctrl+C to stop the server"
echo ""

# Try different server commands
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
elif command -v npx &> /dev/null; then
    npx serve -p 8000
else
    echo "Error: No suitable HTTP server found."
    echo "Please install Python 3 or Node.js, or use any HTTP server."
    exit 1
fi

