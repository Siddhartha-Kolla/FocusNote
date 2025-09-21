import asyncio
import logging
import subprocess
import tempfile
from pathlib import Path
from typing import Optional, Dict, Any
import os
import shutil
from datetime import datetime
from hackai_api_access import HackAPI

logger = logging.getLogger(__name__)

class LaTeXGenerator:
    """LaTeX document generator and PDF converter"""
    
    def __init__(self):
        self.hackai = HackAPI()
        self.latex_preamble = r"""
\documentclass{article}
\usepackage[utf8]{inputenc}
\usepackage{amsmath,amssymb}
\usepackage{csquotes}
\usepackage{hyperref}
\usepackage{graphicx}
\usepackage{geometry}
\usepackage{fancyhdr}
\usepackage{titlesec}

% Page setup
\geometry{margin=1in}
\pagestyle{fancy}
\fancyhf{}
\rhead{\thepage}

% Title formatting
\titleformat{\section}
  {\Large\bfseries}{\thesection}{1em}{}
\titleformat{\subsection}
  {\large\bfseries}{\thesubsection}{1em}{}

% Math settings
\allowdisplaybreaks
"""
    
    async def generate_latex_with_context(
        self, 
        text: str, 
        context_analysis: str,
        title: Optional[str] = None,
        category: Optional[str] = None,
        remarks: Optional[str] = None
    ) -> str:
        """
        Generate LaTeX document with enhanced context understanding
        
        Args:
            text: Cleaned text to convert to LaTeX
            context_analysis: Context analysis of the document
            title: Optional document title
            category: Optional document category
            remarks: Optional user remarks
        
        Returns:
            Complete LaTeX document as string
        """
        if not text or not text.strip():
            logger.warning("No text provided for context-enhanced LaTeX generation")
            return self._generate_empty_document(title)
        
        logger.info(f"Generating context-enhanced LaTeX for text of length: {len(text)} characters")
        
        # Add cache-busting identifier to ensure fresh responses
        import uuid
        cache_buster = str(uuid.uuid4())[:8]
        
        # Use the exact same latex_userinput format from your ocr_space.py but with context enhancement
        latex_userinput = f"""[Request ID: {cache_buster}] Please convert the OCR text into a clean, compilable LaTeX document.
        OCR Text: 

        Specific formatting rules:
        - Use this preamble exactly:

        \\documentclass{{article}}
        \\usepackage[utf8]{{inputenc}}
        \\usepackage{{amsmath,amssymb}}
        \\usepackage{{csquotes}}
        \\usepackage{{hyperref}}
        \\usepackage{{graphicx}}
        \\usepackage{{geometry}}

        - Insert \\title{{}}, \\author{{}} (if available), and \\date{{}} if the OCR text contains them. Always add \\maketitle after \\begin{{document}}.
        - Convert headings into \\section{{}} and \\subsection{{}}.
        - Place each exercise or problem statement into its own subsection if possible.
        - Format math cleanly using \\[ ... \\] for displayed equations and $...$ for inline math.
        - Always use proper decimal notation: `1,234.56` (dot for decimals, comma for thousands).
        - If the OCR produces strange fragments (like "дед. : М" or broken characters), replace them with \\texttt{{[UNCLEAR: ...]}} inside the text, not inside math mode.
        - Escape LaTeX special characters (% & _ # $ {{ }}).
        - Ensure equations are readable and consistent (e.g., \\frac for fractions, \\cdot for multiplication).
        - Only return the LaTeX code, no explanations.
        
        Context Analysis: {context_analysis}
        
        Use this context to make better formatting decisions and ensure mathematical notation is appropriate for the subject area.
        
        OCR Text: 
        """
        
        # Append the cleaned text to the prompt exactly like in ocr_space.py
        latex_prompt = latex_userinput + text
        
        # Use the exact same latex_assistant from your ocr_space.py
        latex_assistant = r"""
        You are an expert LaTeX formatter.  
        Your job is to transform messy OCR-parsed text into a clean, compilable LaTeX document.  

        Rules:
        - Always output a complete LaTeX file with preamble, \begin{document}, and \end{document}.
        - If the first line looks like a title, use \title{} and \maketitle.
        - Headings/subheadings → \section{} / \subsection{}.
        - Lists:
        - Lines starting with "-" or "•" → itemize.
        - Numbered lines (1., 2., a)) → enumerate.
        - Mathematical expressions (e.g., x^2, a/b, ∑, ∫, <=, >=) → convert into LaTeX math mode ($...$ or \[...\]).
        - Escape LaTeX special characters (% & _ # $ { }).
        - If text is unreadable or uncertain, wrap it in \texttt{[UNCLEAR: ...]}.
        - Preserve paragraph breaks.
        - Do not explain. Output **only the LaTeX code**.
        - Ensure the final output compiles without errors.
        - Use the provided context analysis to make more accurate formatting decisions.
        """
        
        try:
            # Generate LaTeX using HackAI with context enhancement
            latex_content = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.hackai.get_text_from_hackai_response(latex_prompt, assistant=latex_assistant)
            )
            
            if not latex_content or latex_content.strip() == "":
                logger.warning("Context-enhanced LaTeX generation returned empty content")
                return await self.generate_latex(text, title, category, remarks)  # Fallback to original method
            
            # Clean and validate LaTeX content
            cleaned_latex = self._clean_latex_content(latex_content)
            
            # Apply the same post-processing as in your ocr_space.py
            latex_lines = cleaned_latex.splitlines()
            if len(latex_lines) > 2:
                # Remove first and last lines like in your ocr_space.py
                cleaned_latex = "\n".join(latex_lines[1:-1])
            # If less than 3 lines, keep as is
            
            # Ensure document has proper structure
            if not self._validate_latex_structure(cleaned_latex):
                logger.warning("Generated context-enhanced LaTeX has structural issues, creating fallback")
                return self._generate_fallback_latex(text, title, category)
            
            logger.info("Context-enhanced LaTeX generation completed successfully")
            return cleaned_latex
            
        except Exception as e:
            logger.error(f"Error generating context-enhanced LaTeX: {str(e)}")
            return await self.generate_latex(text, title, category, remarks)  # Fallback to original method

    async def generate_latex(
        self, 
        text: str, 
        title: Optional[str] = None,
        category: Optional[str] = None,
        remarks: Optional[str] = None
    ) -> str:
        """
        Generate LaTeX document from cleaned text using HackAI
        
        Args:
            text: Cleaned text to convert to LaTeX
            title: Optional document title
            category: Optional document category
            remarks: Optional user remarks
        
        Returns:
            Complete LaTeX document as string
        """
        if not text or not text.strip():
            logger.warning("No text provided for LaTeX generation")
            return self._generate_empty_document(title)
        
        logger.info(f"Generating LaTeX for text of length: {len(text)} characters")
        
        # Prepare context information
        context_info = []
        if title:
            context_info.append(f"Document title: {title}")
        if category:
            context_info.append(f"Category: {category}")
        if remarks:
            context_info.append(f"User remarks: {remarks}")
        
        context_string = "\n".join(context_info) if context_info else ""
        
        # Use the exact same latex_userinput format from your ocr_space.py  
        latex_userinput = r"""Please convert the OCR text into a clean, compilable LaTeX document.
        OCR Text: 

        Specific formatting rules:
        - Use this preamble exactly:

        \documentclass{article}
        \usepackage[utf8]{inputenc}
        \usepackage{amsmath,amssymb}
        \usepackage{csquotes}
        \usepackage{hyperref}
        \usepackage{graphicx}
        \usepackage{geometry}

        - Insert \title{}, \author{} (if available), and \date{} if the OCR text contains them. Always add \maketitle after \begin{document}.
        - Convert headings into \section{} and \subsection{}.
        - Place each exercise or problem statement into its own subsection if possible.
        - Format math cleanly using \[ ... \] for displayed equations and $...$ for inline math.
        - Always use proper decimal notation: `1,234.56` (dot for decimals, comma for thousands).
        - If the OCR produces strange fragments (like "дед. : М" or broken characters), replace them with \texttt{[UNCLEAR: ...]} inside the text, not inside math mode.
        - Escape LaTeX special characters (% & _ # $ { }).
        - Ensure equations are readable and consistent (e.g., \frac for fractions, \cdot for multiplication).
        - Only return the LaTeX code, no explanations.
        OCR Text: 
        """
        
        # Append the cleaned text to the prompt exactly like in ocr_space.py
        latex_prompt = latex_userinput + text
        
        # Use the exact same latex_assistant from your ocr_space.py
        latex_assistant = r"""
        You are an expert LaTeX formatter.  
        Your job is to transform messy OCR-parsed text into a clean, compilable LaTeX document.  

        Rules:
        - Always output a complete LaTeX file with preamble, \begin{document}, and \end{document}.
        - If the first line looks like a title, use \title{} and \maketitle.
        - Headings/subheadings → \section{} / \subsection{}.
        - Lists:
        - Lines starting with "-" or "•" → itemize.
        - Numbered lines (1., 2., a)) → enumerate.
        - Mathematical expressions (e.g., x^2, a/b, ∑, ∫, <=, >=) → convert into LaTeX math mode ($...$ or \[...\]).
        - Escape LaTeX special characters (% & _ # $ { }).
        - If text is unreadable or uncertain, wrap it in \texttt{[UNCLEAR: ...]}.
        - Preserve paragraph breaks.
        - Do not explain. Output **only the LaTeX code**.
        - Ensure the final output compiles without errors.
        """
        
        try:
            # Generate LaTeX using HackAI with exact same format as ocr_space.py
            latex_content = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.hackai.get_text_from_hackai_response(latex_prompt, assistant=latex_assistant)
            )
            
            if not latex_content or latex_content.strip() == "":
                logger.warning("HackAI returned empty LaTeX content")
                return self._generate_fallback_latex(text, title, category)
            
            # Clean and validate LaTeX content
            cleaned_latex = self._clean_latex_content(latex_content)
            
            # Apply the same post-processing as in your ocr_space.py
            latex_lines = cleaned_latex.splitlines()
            if len(latex_lines) > 2:
                # Remove first and last lines like in your ocr_space.py
                cleaned_latex = "\n".join(latex_lines[1:-1])
            # If less than 3 lines, keep as is
            
            # Ensure document has proper structure
            if not self._validate_latex_structure(cleaned_latex):
                logger.warning("Generated LaTeX has structural issues, creating fallback")
                return self._generate_fallback_latex(text, title, category)
            
            logger.info("LaTeX generation completed successfully")
            return cleaned_latex
            
        except Exception as e:
            logger.error(f"Error generating LaTeX: {str(e)}")
            return self._generate_fallback_latex(text, title, category)
    
    def _clean_latex_content(self, latex_content: str) -> str:
        """Clean and format LaTeX content"""
        # Remove any markdown code blocks if present
        latex_content = latex_content.replace("```latex", "").replace("```", "")
        
        # Remove leading/trailing whitespace
        latex_content = latex_content.strip()
        
        # Ensure proper encoding
        latex_content = latex_content.encode('utf-8', errors='ignore').decode('utf-8')
        
        return latex_content
    
    def _validate_latex_structure(self, latex_content: str) -> bool:
        """Validate basic LaTeX document structure"""
        required_elements = [
            r'\documentclass',
            r'\begin{document}',
            r'\end{document}'
        ]
        
        return all(element in latex_content for element in required_elements)
    
    def _generate_fallback_latex(self, text: str, title: Optional[str] = None, category: Optional[str] = None) -> str:
        """Generate a simple LaTeX document as fallback"""
        title_section = ""
        if title:
            title_section = f"""\\title{{{title}}}
\\author{{FocusNote Document Processor}}
\\date{{\\today}}
\\maketitle

"""
        
        category_section = ""
        if category:
            category_section = f"\\section*{{Category: {category}}}\n\n"
        
        # Escape special characters in text
        escaped_text = self._escape_latex_chars(text)
        
        latex_document = f"""{self.latex_preamble}

\\begin{{document}}

{title_section}{category_section}
{escaped_text}

\\end{{document}}"""
        
        return latex_document
    
    def _generate_empty_document(self, title: Optional[str] = None) -> str:
        """Generate empty LaTeX document"""
        title_section = ""
        if title:
            title_section = f"""\\title{{{title}}}
\\author{{FocusNote Document Processor}}
\\date{{\\today}}
\\maketitle

"""
        
        latex_document = f"""{self.latex_preamble}

\\begin{{document}}

{title_section}
\\section{{Empty Document}}

No content was provided for processing.

\\end{{document}}"""
        
        return latex_document
    
    def _escape_latex_chars(self, text: str) -> str:
        """
        Escape special LaTeX characters to prevent compilation errors
        
        This method handles the most common LaTeX compilation issues:
        - Math mode characters (^ and _) that cause "Missing $ inserted" errors
        - Special characters that need escaping
        """
        replacements = {
            '\\': r'\textbackslash{}',
            '{': r'\{',
            '}': r'\}',
            '$': r'\$',
            '&': r'\&',
            '%': r'\%',
            '#': r'\#',
            '^': r'\textasciicircum{}',  # Prevents "Missing $ inserted" errors
            '_': r'\_',                 # Prevents "Missing $ inserted" errors
            '~': r'\textasciitilde{}'
        }
        
        # Handle mathematical expressions that might have been missed
        # Look for patterns like "^2", "^3", "_i", etc. in text and wrap in math mode
        import re
        
        # Pattern for standalone superscripts/subscripts (not already in math mode)
        # This catches things like "^2/^3" that should become "$^2/^3$"
        math_patterns = [
            (r'(?<!\$)\^(\d+)(?!\$)', r'$^\1$'),  # ^2 becomes $^2$
            (r'(?<!\$)_(\w+)(?!\$)', r'$_\1$'),   # _text becomes $_text$
            (r'(?<!\$)\^(\d+)/\^(\d+)(?!\$)', r'$^\1/^\2$'),  # ^2/^3 becomes $^2/^3$
        ]
        
        for pattern, replacement in math_patterns:
            text = re.sub(pattern, replacement, text)
        
        # Apply standard character escaping
        for char, replacement in replacements.items():
            text = text.replace(char, replacement)
        
        return text
    
    async def generate_pdf(self, latex_content: str, output_dir: Path) -> Optional[str]:
        """
        Generate PDF from LaTeX content
        
        Args:
            latex_content: LaTeX document content
            output_dir: Directory to save output files
        
        Returns:
            Path to generated PDF file or None if failed
        """
        try:
            logger.info("Generating PDF from LaTeX content")
            
            # Create temporary directory for LaTeX compilation
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)
                
                # Write LaTeX content to file
                tex_file = temp_path / "document.tex"
                with open(tex_file, "w", encoding="utf-8") as f:
                    f.write(latex_content)
                
                # Try to compile with pdflatex
                pdf_path = await self._compile_latex(tex_file, temp_path)
                
                if pdf_path and pdf_path.exists():
                    # Copy PDF to output directory
                    output_pdf = output_dir / "document.pdf"
                    shutil.copy2(pdf_path, output_pdf)
                    logger.info(f"PDF generated successfully: {output_pdf}")
                    return str(output_pdf)
                else:
                    logger.warning("PDF compilation failed")
                    return None
                    
        except Exception as e:
            logger.error(f"Error generating PDF: {str(e)}")
            return None
    
    async def _compile_latex(self, tex_file: Path, work_dir: Path) -> Optional[Path]:
        """
        Compile LaTeX file to PDF
        
        Args:
            tex_file: Path to .tex file
            work_dir: Working directory for compilation
        
        Returns:
            Path to generated PDF or None if failed
        """
        try:
            # Check if pdflatex is available
            if not shutil.which("pdflatex"):
                logger.warning("pdflatex not found, cannot generate PDF")
                return None
            
            # Run pdflatex compilation
            cmd = [
                "pdflatex",
                "-interaction=nonstopmode",
                "-output-directory", str(work_dir),
                str(tex_file)
            ]
            
            # Run compilation twice for proper references
            for i in range(2):
                result = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: subprocess.run(
                        cmd,
                        cwd=work_dir,
                        capture_output=True,
                        text=True,
                        timeout=30
                    )
                )
                
                if result.returncode != 0:
                    logger.error(f"pdflatex compilation failed (run {i+1}): {result.stderr}")
                    if i == 0:  # If first run fails, don't try second run
                        break
            
            # Check if PDF was generated
            pdf_file = work_dir / f"{tex_file.stem}.pdf"
            if pdf_file.exists():
                return pdf_file
            else:
                logger.error("PDF file not generated despite successful compilation")
                return None
                
        except subprocess.TimeoutExpired:
            logger.error("LaTeX compilation timeout")
            return None
        except Exception as e:
            logger.error(f"Error during LaTeX compilation: {str(e)}")
            return None
    
    def save_latex_file(self, latex_content: str, output_path: Path) -> bool:
        """
        Save LaTeX content to file
        
        Args:
            latex_content: LaTeX document content
            output_path: Path to save the .tex file
        
        Returns:
            True if saved successfully
        """
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(latex_content)
            logger.info(f"LaTeX file saved: {output_path}")
            return True
        except Exception as e:
            logger.error(f"Error saving LaTeX file: {str(e)}")
            return False