#!/usr/bin/env python3
"""
Standalone LaTeX to PDF Compiler
Compiles LaTeX source code to PDF using pdflatex
"""

import subprocess
import sys
import os
import tempfile
import shutil
from pathlib import Path
import argparse
import logging

def setup_logging(verbose=False):
    """Setup logging configuration"""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%H:%M:%S'
    )

def check_dependencies():
    """Check if required dependencies are available"""
    if not shutil.which("pdflatex"):
        print("❌ Error: pdflatex not found!")
        print("Please install a LaTeX distribution:")
        print("  - Windows: MiKTeX or TeX Live")
        print("  - Mac: MacTeX")
        print("  - Linux: texlive-latex-base texlive-latex-extra")
        return False
    return True

def compile_latex_to_pdf(
    latex_content=None, 
    input_file=None, 
    output_dir=None, 
    output_name=None,
    cleanup=True,
    runs=2,
    verbose=False
):
    """
    Compile LaTeX content or file to PDF
    
    Args:
        latex_content (str): LaTeX source code as string
        input_file (str): Path to .tex file (alternative to latex_content)
        output_dir (str): Directory to save the PDF (default: current directory)
        output_name (str): Name for output PDF (default: auto-generated)
        cleanup (bool): Whether to clean up temporary files
        runs (int): Number of compilation runs (for references)
        verbose (bool): Enable verbose logging
    
    Returns:
        str: Path to generated PDF file or None if failed
    """
    logger = logging.getLogger(__name__)
    
    if not check_dependencies():
        return None
    
    # Validate inputs
    if not latex_content and not input_file:
        raise ValueError("Either latex_content or input_file must be provided")
    
    if input_file and not Path(input_file).exists():
        raise FileNotFoundError(f"Input file not found: {input_file}")
    
    # Setup output directory
    if not output_dir:
        output_dir = Path.cwd()
    else:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        # Create temporary directory for compilation
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Prepare tex file
            if latex_content:
                tex_file = temp_path / "document.tex"
                with open(tex_file, "w", encoding="utf-8") as f:
                    f.write(latex_content)
                logger.info("LaTeX content written to temporary file")
            else:
                # Copy input file to temp directory
                tex_file = temp_path / Path(input_file).name
                shutil.copy2(input_file, tex_file)
                logger.info(f"Input file copied: {input_file}")
            
            # Compile LaTeX
            logger.info(f"Starting LaTeX compilation ({runs} runs)...")
            
            for run in range(runs):
                logger.debug(f"Compilation run {run + 1}/{runs}")
                
                cmd = [
                    "pdflatex",
                    "-interaction=nonstopmode",
                    "-halt-on-error",
                    "-output-directory", str(temp_path),
                    str(tex_file)
                ]
                
                result = subprocess.run(
                    cmd,
                    cwd=temp_path,
                    capture_output=True,
                    text=True,
                    timeout=60
                )
                
                if result.returncode != 0:
                    logger.error(f"LaTeX compilation failed on run {run + 1}")
                    if verbose:
                        logger.error(f"stdout: {result.stdout}")
                        logger.error(f"stderr: {result.stderr}")
                    
                    # Try to extract error information
                    log_file = temp_path / f"{tex_file.stem}.log"
                    if log_file.exists():
                        with open(log_file, "r", encoding="utf-8", errors="ignore") as f:
                            log_content = f.read()
                            # Find error lines
                            lines = log_content.split('\n')
                            error_lines = [line for line in lines if 'error' in line.lower() or line.startswith('!')]
                            if error_lines:
                                logger.error("LaTeX errors found:")
                                for error_line in error_lines[:5]:  # Show first 5 errors
                                    logger.error(f"  {error_line}")
                    
                    return None
                
                logger.debug(f"Run {run + 1} completed successfully")
            
            # Check if PDF was generated
            pdf_file = temp_path / f"{tex_file.stem}.pdf"
            if not pdf_file.exists():
                logger.error("PDF file not found after compilation")
                return None
            
            # Copy PDF to output directory
            if output_name:
                if not output_name.endswith('.pdf'):
                    output_name += '.pdf'
                final_pdf = output_dir / output_name
            else:
                final_pdf = output_dir / f"{tex_file.stem}.pdf"
            
            shutil.copy2(pdf_file, final_pdf)
            logger.info(f"✅ PDF generated successfully: {final_pdf}")
            
            # Optionally copy other files (log, aux, etc.)
            if not cleanup:
                for ext in ['.log', '.aux', '.toc']:
                    src_file = temp_path / f"{tex_file.stem}{ext}"
                    if src_file.exists():
                        dst_file = output_dir / f"{final_pdf.stem}{ext}"
                        shutil.copy2(src_file, dst_file)
                        logger.debug(f"Copied auxiliary file: {dst_file}")
            
            return str(final_pdf)
    
    except subprocess.TimeoutExpired:
        logger.error("LaTeX compilation timed out (60 seconds)")
        return None
    except Exception as e:
        logger.error(f"Unexpected error during compilation: {e}")
        return None

def main():
    """Command line interface"""
    parser = argparse.ArgumentParser(
        description="Compile LaTeX to PDF",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Compile from file
  python latex_compiler.py input.tex
  
  # Compile with custom output name
  python latex_compiler.py input.tex -o my_document.pdf
  
  # Compile to specific directory
  python latex_compiler.py input.tex -d ./output/
  
  # Compile with verbose output
  python latex_compiler.py input.tex -v
  
  # Keep auxiliary files
  python latex_compiler.py input.tex --no-cleanup
        """
    )
    
    parser.add_argument(
        "input_file",
        help="Path to LaTeX file (.tex)"
    )
    
    parser.add_argument(
        "-o", "--output",
        help="Output PDF filename"
    )
    
    parser.add_argument(
        "-d", "--output-dir",
        help="Output directory (default: current directory)"
    )
    
    parser.add_argument(
        "-r", "--runs",
        type=int,
        default=2,
        help="Number of compilation runs (default: 2)"
    )
    
    parser.add_argument(
        "--no-cleanup",
        action="store_true",
        help="Keep auxiliary files (.log, .aux, etc.)"
    )
    
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable verbose output"
    )
    
    args = parser.parse_args()
    
    # Setup logging
    setup_logging(args.verbose)
    
    # Validate input file
    if not Path(args.input_file).exists():
        print(f"❌ Error: Input file not found: {args.input_file}")
        sys.exit(1)
    
    if not args.input_file.endswith('.tex'):
        print(f"❌ Error: Input file must be a .tex file: {args.input_file}")
        sys.exit(1)
    
    # Compile
    print(f"🔨 Compiling {args.input_file} to PDF...")
    
    pdf_path = compile_latex_to_pdf(
        input_file=args.input_file,
        output_dir=args.output_dir,
        output_name=args.output,
        cleanup=not args.no_cleanup,
        runs=args.runs,
        verbose=args.verbose
    )
    
    if pdf_path:
        print(f"✅ Success! PDF created: {pdf_path}")
        
        # Show file size
        size_mb = Path(pdf_path).stat().st_size / (1024 * 1024)
        print(f"📄 File size: {size_mb:.2f} MB")
        
        sys.exit(0)
    else:
        print("❌ Compilation failed!")
        sys.exit(1)

# Example usage as a module
def compile_latex_string(latex_code, output_path="output.pdf"):
    """
    Simple function to compile LaTeX string to PDF
    
    Args:
        latex_code (str): LaTeX source code
        output_path (str): Path for output PDF
    
    Returns:
        bool: True if successful, False otherwise
    """
    setup_logging(verbose=False)
    
    result = compile_latex_to_pdf(
        latex_content=latex_code,
        output_name=output_path,
        cleanup=True,
        runs=2
    )
    
    return result is not None

if __name__ == "__main__":
    main()