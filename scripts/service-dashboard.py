#!/usr/bin/env python3
"""
Pivotal Flow Service Dashboard Server
A simple HTTP server to serve the service status dashboard
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

# Configuration
DASHBOARD_PORT = 8080
DASHBOARD_FILE = "service-dashboard.html"

def main():
    # Change to the project root directory
    script_dir = Path(__file__).parent.parent
    os.chdir(script_dir)
    
    # Check if dashboard file exists
    if not os.path.exists(DASHBOARD_FILE):
        print(f"❌ Error: {DASHBOARD_FILE} not found in {script_dir}")
        sys.exit(1)
    
    # Create a custom handler that serves the dashboard
    class DashboardHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            # Add CORS headers
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            super().end_headers()
        
        def do_GET(self):
            if self.path == '/' or self.path == '/dashboard':
                # Serve the dashboard HTML file
                self.path = f'/{DASHBOARD_FILE}'
            return super().do_GET()
    
    try:
        with socketserver.TCPServer(("", DASHBOARD_PORT), DashboardHandler) as httpd:
            print(f"🚀 Service Dashboard Server starting...")
            print(f"📊 Dashboard URL: http://localhost:{DASHBOARD_PORT}")
            print(f"📁 Serving from: {script_dir}")
            print(f"🔄 Monitoring services:")
            print(f"   • Backend API: http://localhost:3000")
            print(f"   • Frontend App: http://localhost:5173")
            print(f"   • Storybook: http://localhost:6006")
            print(f"   • PostgreSQL: localhost:5433")
            print(f"   • Redis: localhost:6379")
            print(f"")
            print(f"Press Ctrl+C to stop the dashboard server")
            print(f"=" * 50)
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print(f"\n🛑 Dashboard server stopped")
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"❌ Error: Port {DASHBOARD_PORT} is already in use")
            print(f"💡 Try using a different port or stop the existing service")
        else:
            print(f"❌ Error starting dashboard server: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
