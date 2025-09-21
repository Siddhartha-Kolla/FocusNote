#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing imports...")
    from ocr_processor import OCRProcessor
    print("✓ OCRProcessor imported")
    
    from document_processor import DocumentProcessor
    print("✓ DocumentProcessor imported")
    
    from latex_generator import LaTeXGenerator
    print("✓ LaTeXGenerator imported")
    
    from utils import setup_logging, ErrorHandler, validate_environment, perf_monitor
    print("✓ Utils imported")
    
    print("\nTesting FastAPI app creation...")
    from fastapi import FastAPI
    app = FastAPI()
    print("✓ FastAPI app created")
    
    print("\nTesting simple route...")
    @app.get("/test")
    def test_route():
        return {"status": "working"}
    
    print("✓ Route added")
    
    print("\nStarting server on port 8001...")
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=False)
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()