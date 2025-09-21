import logging
import sys
from pathlib import Path
from datetime import datetime

def setup_logging(log_level: str = "INFO", log_file: str = None):
    """
    Setup comprehensive logging for the application
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional log file path
    """
    
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Generate log file name if not provided
    if not log_file:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_file = log_dir / f"focusnote_{timestamp}.log"
    
    # Configure logging format
    log_format = '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
    date_format = '%Y-%m-%d %H:%M:%S'
    
    # Create formatter
    formatter = logging.Formatter(log_format, date_format)
    
    # Setup root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper()))
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level.upper()))
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # File handler
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)  # Always log debug to file
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)
    
    # Set specific loggers
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("PIL").setLevel(logging.WARNING)
    
    logging.info(f"Logging setup complete. Log file: {log_file}")

class ErrorHandler:
    """Centralized error handling utilities"""
    
    @staticmethod
    def log_error(error: Exception, context: str = "", logger_name: str = __name__):
        """
        Log error with context information
        
        Args:
            error: Exception that occurred
            context: Additional context information
            logger_name: Name of the logger to use
        """
        logger = logging.getLogger(logger_name)
        
        error_msg = f"Error in {context}: {type(error).__name__}: {str(error)}"
        logger.error(error_msg, exc_info=True)
    
    @staticmethod
    def create_error_response(error: Exception, context: str = ""):
        """
        Create standardized error response
        
        Args:
            error: Exception that occurred
            context: Additional context
        
        Returns:
            Dictionary with error information
        """
        return {
            "status": "error",
            "error_type": type(error).__name__,
            "message": str(error),
            "context": context,
            "timestamp": datetime.now().isoformat()
        }

def validate_environment():
    """
    Validate that required environment variables and dependencies are available
    
    Returns:
        Dictionary with validation results
    """
    logger = logging.getLogger(__name__)
    issues = []
    
    # Check for required directories
    required_dirs = ["output", "logs"]
    for dir_name in required_dirs:
        dir_path = Path(dir_name)
        if not dir_path.exists():
            try:
                dir_path.mkdir(exist_ok=True)
                logger.info(f"Created directory: {dir_path}")
            except Exception as e:
                issues.append(f"Cannot create directory {dir_path}: {e}")
    
    # Check for pdflatex (optional)
    import shutil
    if not shutil.which("pdflatex"):
        issues.append("pdflatex not found - PDF generation will be disabled")
        logger.warning("pdflatex not found - PDF generation will be disabled")
    
    # Check OCR API key
    ocr_api_key = "K84093397988957"  # Your API key
    if not ocr_api_key:
        issues.append("OCR API key not configured")
    
    # Test internet connectivity (basic check)
    try:
        import requests
        response = requests.get("https://httpbin.org/status/200", timeout=5)
        if response.status_code != 200:
            issues.append("Internet connectivity issues detected")
    except Exception as e:
        issues.append(f"Internet connectivity test failed: {e}")
    
    validation_result = {
        "status": "passed" if not issues else "warning",
        "issues": issues,
        "timestamp": datetime.now().isoformat()
    }
    
    if issues:
        logger.warning(f"Environment validation issues: {issues}")
    else:
        logger.info("Environment validation passed")
    
    return validation_result

class PerformanceMonitor:
    """Simple performance monitoring utilities"""
    
    def __init__(self):
        self.metrics = {}
    
    def start_timer(self, operation: str):
        """Start timing an operation"""
        self.metrics[operation] = {"start_time": datetime.now()}
    
    def end_timer(self, operation: str):
        """End timing an operation and log duration"""
        if operation in self.metrics:
            start_time = self.metrics[operation]["start_time"]
            duration = (datetime.now() - start_time).total_seconds()
            self.metrics[operation]["duration"] = duration
            
            logger = logging.getLogger(__name__)
            logger.info(f"Operation '{operation}' completed in {duration:.2f} seconds")
            
            return duration
        return None
    
    def get_metrics(self):
        """Get all collected metrics"""
        return self.metrics

# Global performance monitor instance
perf_monitor = PerformanceMonitor()