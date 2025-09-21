FocusNote Backend
==================

This document explains how to set up and use the FocusNote backend (Python FastAPI service) and how to interact with its key endpoints, including the exam generator which returns a generated PDF.

Contents
--------
- Overview
- Prerequisites
- Setup (local)
- Running the server
- Key endpoints and examples
  - Health check
  - /scan/process (OCR → LaTeX)
  - /exam/pdf (generate exam PDF)
  - /download/{filename}
  - /chat (document chat)
  - /llm/call (LLM helper)
- LaTeX and PDF compilation details
- Troubleshooting
- Security notes

Overview
--------
The backend is a FastAPI app that provides document OCR, AI-based cleaning / LaTeX generation, an exam-generator (AI-driven) which can produce and compile LaTeX to PDF, and chat/LLM helpers.

Prerequisites
-------------
- Python 3.10+ (tested with 3.11)
- pip
- System LaTeX (pdflatex) for PDF compilation. On Debian/Ubuntu: `sudo apt install texlive-latex-base texlive-fonts-recommended texlive-latex-extra`.
- Recommended: create and use a virtual environment.

Install Python dependencies
---------------------------
From the `backend` folder run:

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Running locally (development)
-----------------------------
Start the FastAPI server (default in repository uses port `8002`):

```powershell
cd backend
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

If you prefer the packaged runner `run_server.py`, follow the instructions in that file.

Key endpoints
-------------

Health check
~~~~~~~~~~~~
GET /

Returns a small JSON to confirm the server is up.

GET /health

Returns service availability (e.g. `pdflatex` availability) and environment validation information.

/scan/process (OCR → LaTeX)
~~~~~~~~~~~~~~~~~~~~~~~~~~~
POST /scan/process

Multipart form request that accepts multiple images. Form fields:
- `images`: file[] – image files (required)
- `title`: string (optional)
- `category`: string (optional)
- `remarks`: string (optional)
- `timestamp`: string (optional, ISO)

Response: `ProcessingResponse` JSON containing `latex_content` and a `download_url` that points to `/download/{filename}`.

Example using `curl` (PowerShell):

```powershell
curl -X POST "http://localhost:8002/scan/process" -F "images=@C:\path\to\page1.png" -F "images=@C:\path\to\page2.png" -F "title=My Doc"
```

/exam/pdf (Generate and return PDF)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
POST /exam/pdf

Request JSON body (application/json):

{
  "total_questions": 10,
  "level_one": 25,
  "level_two": 25,
  "level_three": 25,
  "level_four": 15,
  "level_five": 10,
  "memory_task": 30,
  "interpretation_task": 40,
  "transfer_task": 30,
  "title": "My Generated Exam",
  "author": "Course AI"
}

The response is a PDF file stream (Content-Type: `application/pdf`). Example `curl` to save result:

```powershell
curl -X POST "http://localhost:8002/exam/pdf" -H "Content-Type: application/json" -d '{"total_questions":5,"title":"Mini Exam"}' --output exam.pdf
```

Note: the backend uses `pdflatex` to compile the generated `.tex`. Ensure `pdflatex` is installed and available in PATH.

/download/{filename}
~~~~~~~~~~~~~~~~~~~~
GET /download/<filename>

Downloads files saved under `backend/output/`. The endpoint serves `application/pdf` when downloading a file.

/cleanup/{filename}
~~~~~~~~~~~~~~~~~~~~
DELETE /cleanup/<filename>

Delete generated files from the `output` folder.

/chat
~~~~~
POST /chat

Used for question/answering and conversational interaction with the document context. Sends a `ChatRequest` JSON and receives `ChatResponse`.

/llm/call
~~~~~~~~~
POST /llm/call

Utility endpoint to call the internal LLM wrapper. Request body:
{
  "prompt": "...",
  "info": "optional context"
}

LaTeX and PDF compilation
-------------------------
The exam generator uses `ExamGenerator` to create questions in JSON and then convert to a LaTeX `.tex` document. The `LaTeXGenerator` compiles `.tex` to PDF using `pdflatex` in a temporary working directory. The compiled PDF is copied to `backend/output/output.pdf` or returned directly from a temporary location.

Troubleshooting
---------------
- pdflatex not found: make sure TeX Live or MikTeX is installed and `pdflatex` is in PATH.
- Permission errors when writing `output/`: ensure the process user has write permission in the repo `backend/output/` directory.
- Long LLM responses: timeouts may occur; increase the timeout in `genCon/llm.py` if needed.

Security notes
--------------
- This server exposes endpoints that execute external processes (pdflatex) and call external APIs — restrict access behind authentication in production.
- Validate and sanitize any user-supplied text used in LaTeX to avoid injection of harmful LaTeX commands.

What's next
-----------
- Add authentication for API endpoints.
- Add background PDF compilation queue for heavy workloads.
- Add caching for repeated exam requests.
# FocusNote Backend - FastAPI Document Processing Server

A powerful FastAPI server for processing scanned documents through OCR, AI text cleaning, and LaTeX/PDF generation.

## Features

- **Multi-image OCR processing** using OCR.space API
- **AI-powered text cleaning** using HackClub AI
- **LaTeX document generation** with proper formatting
- **PDF conversion** (when pdflatex is available)
- **Comprehensive error handling** and logging
- **Performance monitoring** for processing steps
- **RESTful API** with automatic documentation

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Server

```bash
python run_server.py
```

The server will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## API Endpoints

### POST /scan/process
Process multiple images through the complete pipeline.

**Parameters:**
- `images` (files): Multiple image files to process
- `title` (string, optional): Document title
- `category` (string, optional): Document category
- `remarks` (string, optional): Additional notes
- `timestamp` (string, optional): Request timestamp

**Response:**
```json
{
  "status": "success",
  "message": "Successfully processed 3 images in 12.34 seconds",
  "processed_text": "Cleaned text content...",
  "latex_content": "\\documentclass{article}...",
  "file_path": "output/document_20240921_143022.pdf"
}
```

### GET /download/{filename}
Download generated PDF or LaTeX files.

### GET /categories
Get available document categories.

### POST /categories
Create a new document category.

## Architecture

### Processing Pipeline

1. **Image Upload & Validation**
   - Validate file types and sizes
   - Optimize images for OCR

2. **OCR Processing** (`ocr_processor.py`)
   - Process multiple images concurrently
   - Extract text using OCR.space API
   - Handle errors and retries

3. **Text Cleaning** (`document_processor.py`)
   - Clean OCR errors and artifacts
   - Enhance text structure
   - Use HackClub AI for intelligent correction

4. **LaTeX Generation** (`latex_generator.py`)
   - Convert cleaned text to LaTeX
   - Apply proper formatting and structure
   - Generate compilable documents

5. **PDF Generation**
   - Compile LaTeX to PDF using pdflatex
   - Fallback to LaTeX file if compilation fails

### Key Components

- **FastAPI Server** (`main.py`): Main API server with endpoints
- **OCR Processor** (`ocr_processor.py`): Handles image OCR processing
- **Document Processor** (`document_processor.py`): AI-powered text cleaning
- **LaTeX Generator** (`latex_generator.py`): LaTeX and PDF generation
- **Utilities** (`utils.py`): Logging, error handling, monitoring

## Configuration

### Environment Variables
```bash
# Optional: Override OCR API key
OCR_API_KEY=your_ocr_space_api_key

# Optional: Override HackAI endpoint
HACKAI_URL=https://ai.hackclub.com/chat/completions
```

### Dependencies
- **Required**: FastAPI, uvicorn, requests, PIL, pydantic
- **Optional**: pdflatex (for PDF generation)

## File Structure

```
backend/
├── main.py                 # FastAPI server
├── run_server.py          # Startup script
├── ocr_processor.py       # OCR processing
├── document_processor.py  # AI text cleaning
├── latex_generator.py     # LaTeX/PDF generation
├── utils.py              # Utilities and error handling
├── requirements.txt      # Python dependencies
├── hackai_api_access.py  # HackAI API integration
├── output/              # Generated files
└── logs/               # Application logs
```

## Error Handling

The server includes comprehensive error handling:
- **Input validation** for file types and parameters
- **OCR failure recovery** with detailed error messages
- **AI processing fallbacks** when services are unavailable
- **PDF generation alternatives** when LaTeX compilation fails
- **Comprehensive logging** for debugging and monitoring

## Performance

- **Concurrent OCR processing** for multiple images
- **Performance monitoring** for each processing step
- **Optimized image preprocessing** for better OCR accuracy
- **Efficient memory management** with temporary file cleanup

## Development

### Testing the API

Use the automatic documentation at `/docs` or test with curl:

```bash
# Test with multiple images
curl -X POST "http://localhost:8000/scan/process" \
  -F "images=@image1.jpg" \
  -F "images=@image2.png" \
  -F "title=My Document" \
  -F "category=Academic" \
  -F "remarks=Please focus on mathematical formulas"
```

### Logs and Monitoring

- Logs are stored in `logs/` directory
- Performance metrics available via performance monitor
- Health check endpoint provides system status

## Integration

This server is designed to integrate with the FocusNote frontend but can be used standalone. The API follows RESTful principles and provides comprehensive documentation via FastAPI's automatic OpenAPI documentation.

## Troubleshooting

### Common Issues

1. **OCR API Errors**: Check internet connection and API key
2. **PDF Generation Fails**: Install pdflatex or use LaTeX files
3. **Memory Issues**: Reduce image sizes or process fewer images concurrently
4. **Slow Processing**: Check HackAI API response times

### Getting Help

Check the logs in `logs/` directory for detailed error information and stack traces.