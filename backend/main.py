from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List, Optional
import uvicorn
import tempfile
import os
import shutil
from pathlib import Path
import logging
from datetime import datetime
from pydantic import BaseModel

# Import our processing modules
from ocr_processor import OCRProcessor
from document_processor import DocumentProcessor
from latex_generator import LaTeXGenerator
from utils import setup_logging, ErrorHandler, validate_environment, perf_monitor
from genCon.llm import HackAPI
from exam_gen import ExamGenerator

# Setup logging
setup_logging(log_level="INFO")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FocusNote Document Processing API",
    description="FastAPI server for processing scanned documents with OCR, AI text cleaning, and LaTeX generation",
# ...existing code...

# === Exam PDF Generation Endpoint ===
class ExamRequest(BaseModel):
    total_questions: int = 10
    level_one: int = 25
    level_two: int = 25
    level_three: int = 25
    level_four: int = 15
    level_five: int = 10
    memory_task: int = 30
    interpretation_task: int = 40
    transfer_task: int = 30
    title: Optional[str] = "Beautiful AI-Generated Exam"
    author: Optional[str] = "FocusNote Team"

@app.post("/exam/pdf")
async def generate_exam_pdf(request: ExamRequest):
    """
    Generate an exam and return the PDF file.
    """
    # Generate questions JSON
    questions_json = ExamGenerator.get_exam_questions(
        total_questions=request.total_questions,
        level_one=request.level_one,
        level_two=request.level_two,
        level_three=request.level_three,
        level_four=request.level_four,
        level_five=request.level_five,
        memory_task=request.memory_task,
        interpretation_task=request.interpretation_task,
        transfer_task=request.transfer_task
    )
    # Generate LaTeX
    latex_exam = ExamGenerator.questions_json_to_latex(
        questions_json,
        title=request.title,
        author=request.author
    )
    # Compile to PDF
    pdf_path = ExamGenerator.compile_latex_to_pdf(latex_exam)
    if pdf_path and Path(pdf_path).exists():
        return FileResponse(
            path=pdf_path,
            filename="exam.pdf",
            media_type="application/pdf"
        )
    else:
        raise HTTPException(status_code=500, detail="PDF generation failed.")
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class ProcessingRequest(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    remarks: Optional[str] = None

class ProcessingResponse(BaseModel):
    status: str
    message: str
    processed_text: Optional[str] = None
    latex_content: Optional[str] = None
    filename: Optional[str] = None  # Just the filename for download
    download_url: Optional[str] = None  # Full download URL
    recommended_title: Optional[str] = None  # AI-recommended title if none provided
    context_analysis: Optional[str] = None  # Context understanding of the document

class ChatRequest(BaseModel):
    message: str
    context: Optional[List[dict]] = []
    user_id: Optional[str] = None

class LLMRequest(BaseModel):
    prompt: str
    info: Optional[str] = None

class LLMResponse(BaseModel):
    response: str
    error: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    timestamp: str

# === LLM API Endpoint ===
@app.post("/llm/call", response_model=LLMResponse)
async def call_llm(request: LLMRequest):
    """
    Call the HackAPI LLM with a prompt and optional info.
    """
    try:
        response_text = HackAPI.get_text_from_hackai(
            prompt=request.prompt,
            info=request.info or ""
        )
        # If error detected in response, return in error field
        if response_text.startswith("[error]"):
            return LLMResponse(response="", error=response_text)
        return LLMResponse(response=response_text)
    except Exception as e:
        ErrorHandler.log_error(e, "llm_call")
        return LLMResponse(response="", error=str(e))

# === Exam PDF Generation Endpoint ===
class ExamRequest(BaseModel):
    total_questions: int = 10
    level_one: int = 25
    level_two: int = 25
    level_three: int = 25
    level_four: int = 15
    level_five: int = 10
    memory_task: int = 30
    interpretation_task: int = 40
    transfer_task: int = 30
    title: Optional[str] = "Beautiful AI-Generated Exam"
    author: Optional[str] = "FocusNote Team"

@app.post("/exam/pdf")
async def generate_exam_pdf(request: ExamRequest):
    """
    Generate an exam and return the PDF file.
    """
    # Generate questions JSON
    questions_json = ExamGenerator.get_exam_questions(
        total_questions=request.total_questions,
        level_one=request.level_one,
        level_two=request.level_two,
        level_three=request.level_three,
        level_four=request.level_four,
        level_five=request.level_five,
        memory_task=request.memory_task,
        interpretation_task=request.interpretation_task,
        transfer_task=request.transfer_task
    )
    # Generate LaTeX
    latex_exam = ExamGenerator.questions_json_to_latex(
        questions_json,
        title=request.title,
        author=request.author
    )
    # Compile to PDF
    pdf_path = ExamGenerator.compile_latex_to_pdf(latex_exam)
    if pdf_path and Path(pdf_path).exists():
        return FileResponse(
            path=pdf_path,
            filename="exam.pdf",
            media_type="application/pdf"
        )
    else:
        raise HTTPException(status_code=500, detail="PDF generation failed.")

# Initialize processors
try:
    ocr_processor = OCRProcessor()
    document_processor = DocumentProcessor()
    latex_generator = LaTeXGenerator()
    logger.info("All processors initialized successfully")
except Exception as e:
    logger.error(f"Error initializing processors: {e}")
    raise

@app.on_event("startup")
async def startup_event():
    """Run validation and setup on startup"""
    logger.info("Starting FocusNote Document Processing API...")
    
    # Validate environment
    validation_result = validate_environment()
    if validation_result["status"] == "warning":
        logger.warning(f"Environment validation warnings: {validation_result['issues']}")
    
    logger.info("API startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down FocusNote Document Processing API...")
    
    # Cleanup any temporary files
    try:
        import glob
        temp_files = glob.glob("temp_*")
        for temp_file in temp_files:
            try:
                os.remove(temp_file)
            except:
                pass
    except:
        pass
    
    logger.info("API shutdown complete")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "FocusNote Document Processing API is running"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Test basic functionality
        test_results = {
            "ocr_processor": "available" if ocr_processor else "unavailable",
            "document_processor": "available" if document_processor else "unavailable", 
            "latex_generator": "available" if latex_generator else "unavailable",
            "output_directory": "available" if Path("output").exists() else "missing"
        }
        
        # Check external dependencies
        import shutil
        test_results["pdflatex"] = "available" if shutil.which("pdflatex") else "unavailable"
        
        return {
            "status": "healthy",
            "services": test_results,
            "environment": validate_environment()
        }
    except Exception as e:
        ErrorHandler.log_error(e, "health_check")
        raise HTTPException(status_code=500, detail="Health check failed")

@app.post("/scan/process", response_model=ProcessingResponse)
async def process_documents(
    images: List[UploadFile] = File(...),
    title: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    remarks: Optional[str] = Form(None),
    timestamp: Optional[str] = Form(None)
):
    """
    Process multiple uploaded images through OCR, AI cleaning, and LaTeX generation
    
    Args:
        images: List of uploaded image files
        title: Optional document title
        category: Optional category/section
        remarks: Optional user remarks
        timestamp: Request timestamp
    
    Returns:
        ProcessingResponse with processed data and PDF file
    """
    logger.info(f"=== NEW PROCESSING REQUEST ===")
    logger.info(f"Processing {len(images)} images with title: '{title}', category: '{category}'")
    logger.info(f"Request timestamp: {timestamp}")
    logger.info(f"User remarks: {remarks}")
    
    # Log unique request identifier
    import uuid
    request_id = str(uuid.uuid4())[:8]
    logger.info(f"Request ID: {request_id}")
    
    if not images:
        raise HTTPException(status_code=400, detail="No images provided")
    
    # Validate image files
    for i, image in enumerate(images):
        if not image.content_type or not image.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type for image {i+1}: {image.filename}. Only image files are allowed."
            )
    
    # Start performance monitoring
    perf_monitor.start_timer("total_processing")
    
    try:
        # Create temporary directory for this processing session
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            image_paths = []
            
            # Save uploaded images to temporary files
            for i, image in enumerate(images):
                file_extension = Path(image.filename or f"image_{i}").suffix or '.png'
                temp_file_path = temp_path / f"image_{i}{file_extension}"
                
                with open(temp_file_path, "wb") as buffer:
                    shutil.copyfileobj(image.file, buffer)
                
                image_paths.append(str(temp_file_path))
                logger.info(f"Saved image {i+1}: {temp_file_path}")
            
            # Step 1: Process all images with OCR
            perf_monitor.start_timer("ocr_processing")
            logger.info("Step 1: Processing images with OCR")
            ocr_results = await ocr_processor.process_multiple_images(image_paths)
            perf_monitor.end_timer("ocr_processing")
            
            if not ocr_results:
                raise HTTPException(status_code=500, detail="OCR processing failed - no results returned")
            
            # Combine all OCR text
            combined_text = "\n\n".join([
                result.get("text", "") for result in ocr_results 
                if result.get("success", False) and result.get("text", "").strip()
            ])
            
            if not combined_text.strip():
                raise HTTPException(status_code=422, detail="No text could be extracted from the images")
            
            logger.info(f"Combined OCR text length: {len(combined_text)} characters")
            
            # Follow the enhanced context understanding approach
            perf_monitor.start_timer("enhanced_processing")
            logger.info(f"[{request_id}] Using enhanced context understanding for better LaTeX generation")
            logger.info(f"[{request_id}] Raw OCR text preview: {combined_text[:200]}...")
            
            # Use enhanced processing with context understanding
            processed_result = await document_processor.process_ocr_with_enhanced_context(combined_text, remarks)
            
            # Extract results
            context_analysis = processed_result["context_analysis"] 
            cleaned_text = processed_result["cleaned_text"]
            latex_content = processed_result["latex_result"]
            
            perf_monitor.end_timer("enhanced_processing")
            
            logger.info(f"[{request_id}] Enhanced processing complete. Context: {context_analysis[:100]}...")
            logger.info(f"[{request_id}] Cleaned text preview: {cleaned_text[:200]}...")
            logger.info(f"[{request_id}] LaTeX content preview: {latex_content[:200]}...")
            
            # Generate title recommendation if no title provided (after cleaning for better accuracy)
            recommended_title = None
            if not title or title.strip() == "":
                perf_monitor.start_timer("title_generation")
                logger.info("Generating title recommendation from cleaned text")
                recommended_title = await document_processor.recommend_title(cleaned_text)
                title = recommended_title  # Use recommended title for document generation
                perf_monitor.end_timer("title_generation")
            
            logger.info("Text cleaning and LaTeX generation complete using original flow")
            
            # Save LaTeX file directly (no PDF generation)
            output_dir = Path("output")
            output_dir.mkdir(exist_ok=True)
            
            # Create safe filename - more strict for Windows compatibility
            base_name = title or "document"
            # Remove all special characters except alphanumeric, dots, hyphens, and underscores
            safe_name = "".join(c for c in base_name if c.isalnum() or c in "._-")[:50]
            # Remove any trailing dots or spaces that Windows doesn't like
            safe_name = safe_name.strip(". ")
            # Ensure we have a valid name
            if not safe_name:
                safe_name = "document"
            
            # Handle timestamp - ensure uniqueness with microseconds
            if timestamp:
                try:
                    # Try to parse ISO timestamp and convert to safe format
                    from datetime import datetime as dt
                    parsed_time = dt.fromisoformat(timestamp.replace('Z', '+00:00'))
                    timestamp_str = parsed_time.strftime("%Y%m%d_%H%M%S") + f"_{parsed_time.microsecond:06d}"
                except Exception:
                    # If parsing fails, sanitize the timestamp string
                    timestamp_str = "".join(c for c in timestamp if c.isalnum())[:14]
                    if not timestamp_str:
                        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S") + f"_{datetime.now().microsecond:06d}"
            else:
                # Always use current time with microseconds for uniqueness
                now = datetime.now()
                timestamp_str = now.strftime("%Y%m%d_%H%M%S") + f"_{now.microsecond:06d}"
            
            # Always generate .tex file
            file_extension = ".tex"
            media_type = "text/plain"
            
            final_filename = f"{safe_name}_{timestamp_str}_{request_id}{file_extension}"
            final_path = output_dir / final_filename
            
            # Save LaTeX content directly to file
            logger.info(f"[{request_id}] Saving LaTeX content to: {final_path}")
            logger.info(f"[{request_id}] LaTeX content length: {len(latex_content)} characters")
            try:
                with open(final_path, "w", encoding="utf-8") as f:
                    f.write(latex_content)
                logger.info(f"[{request_id}] LaTeX file saved successfully: {final_path}")
                
                # Verify file was actually written
                if final_path.exists():
                    file_size = final_path.stat().st_size
                    logger.info(f"[{request_id}] File verification: exists={final_path.exists()}, size={file_size} bytes")
                else:
                    logger.error(f"[{request_id}] File was not created: {final_path}")
                    
            except Exception as e:
                logger.error(f"[{request_id}] Failed to save LaTeX file: {e}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to save LaTeX file: {str(e)}"
                )
            
            # End total processing timer
            total_duration = perf_monitor.end_timer("total_processing")
            
            logger.info(f"Processing completed successfully in {total_duration:.2f}s. File: {final_path}")
            
            return ProcessingResponse(
                status="success",
                message=f"Successfully processed {len(images)} images and generated LaTeX in {total_duration:.2f} seconds",
                processed_text=cleaned_text,
                latex_content=latex_content,
                filename=final_filename,
                download_url=f"/download/{final_filename}",
                recommended_title=recommended_title,
                context_analysis=context_analysis
            )
    
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Log and handle unexpected errors
        ErrorHandler.log_error(e, "process_documents")
        raise HTTPException(
            status_code=500, 
            detail=f"Unexpected error during processing: {str(e)}"
        )

@app.get("/download/{filename}")
async def download_file(filename: str):
    """Download generated PDF file"""
    file_path = Path("output") / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type='application/pdf'
    )

@app.delete("/cleanup/{filename}")
async def cleanup_file(filename: str):
    """Clean up generated files"""
    file_path = Path("output") / filename
    
    if file_path.exists():
        os.remove(file_path)
        return {"message": f"File {filename} deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="File not found")

@app.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    Handle chat interactions about processed documents
    
    Args:
        request: ChatRequest with message, context, and user_id
    
    Returns:
        ChatResponse with AI response
    """
    logger.info(f"=== CHAT REQUEST ===")
    logger.info(f"User message: {request.message}")
    logger.info(f"Context messages: {len(request.context)}")
    logger.info(f"User ID: {request.user_id}")
    
    try:
        # Extract recent conversation context
        conversation_context = ""
        if request.context:
            # Get last few messages for context
            recent_messages = request.context[-5:]  # Last 5 messages
            conversation_context = "\n".join([
                f"{msg.get('type', 'user')}: {msg.get('content', '')}" 
                for msg in recent_messages
                if msg.get('content')
            ])
        
        # Use the document processor to handle the chat
        perf_monitor.start_timer("chat_processing")
        
        # Call the chat handler method (we'll add this to document_processor)
        ai_response = await document_processor.handle_chat_query(
            user_message=request.message,
            conversation_context=conversation_context
        )
        
        perf_monitor.end_timer("chat_processing")
        
        logger.info(f"AI response generated: {ai_response[:100]}...")
        
        return ChatResponse(
            response=ai_response,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        ErrorHandler.log_error(e, "chat_with_ai")
        logger.error(f"Chat processing failed: {e}")
        
        # Return a fallback response
        return ChatResponse(
            response="I'm sorry, I'm having trouble processing your request right now. Please try asking your question in a different way, or check back in a moment.",
            timestamp=datetime.now().isoformat()
        )

if __name__ == "__main__":
    # Create output directory
    Path("output").mkdir(exist_ok=True)
    
    # Run the server on port 8002 (trying different port due to permission issues)
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        log_level="info"
    )