#!/usr/bin/env python3
"""
FocusNote FastAPI Server Startup Script
"""
import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def main():
    """Main startup function"""
    try:
        # Import and run the FastAPI server
        from main import app
        import uvicorn
        
        print("🚀 Starting FocusNote Document Processing API...")
        print(f"📁 Working directory: {backend_dir}")
        print("🌐 Server will be available at: http://localhost:8000")
        print("📖 API documentation at: http://localhost:8000/docs")
        print("❤️ Health check at: http://localhost:8000/health")
        print()
        
        # Run the server
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
            reload_dirs=[str(backend_dir)]
        )
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()