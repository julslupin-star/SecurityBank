"""
Security Bank Foundation - Integrated Education Program Monitoring System
Local Development Server Launcher
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print("=" * 70)
        print(" SECURITY BANK FOUNDATION")
        print(" Integrated Education Program Monitoring, Reporting & Impact Assessment")
        print("=" * 70)
        print(f" Dashboard running locally at: {url}")
        print(" Press Ctrl+C in terminal to stop server.")
        print("=" * 70)
        
        # Automatically open in browser
        try:
            webbrowser.open(url)
        except Exception as e:
            print(f"Could not open browser automatically: {e}")
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server gracefully...")
            httpd.server_close()
            sys.exit(0)

if __name__ == "__main__":
    start_server()
