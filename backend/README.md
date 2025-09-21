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