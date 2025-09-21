import asyncio
import logging
from typing import Optional, Dict, Any
from hackai_api_access import HackAPI

logger = logging.getLogger(__name__)

class DocumentProcessor:
    """Document processor using HackAI for text cleaning and enhancement"""
    
    def __init__(self):
        self.hackai = HackAPI()
    
    async def process_ocr_with_enhanced_context(self, raw_text: str, remarks: Optional[str] = None) -> Dict[str, str]:
        """
        Process text using enhanced context understanding:
        1. Analyze and understand the content context
        2. Clean text with context awareness
        3. Generate LaTeX with full context understanding
        
        Args:
            raw_text: Raw OCR text
            remarks: Optional user remarks
        
        Returns:
            Dictionary with analyzed context, cleaned_text and latex_result
        """
        logger.info("Starting enhanced context understanding and processing")
        
        # Step 1: Analyze content for context understanding
        context_analysis = await self._analyze_content_context(raw_text)
        
        # Step 2: Clean text with context awareness
        context_enhanced_prompt = self._build_context_enhanced_cleaning_prompt(raw_text, context_analysis, remarks)
        cleaned_text = await self._clean_text_with_context(context_enhanced_prompt)
        
        # Step 3: Generate LaTeX with full context understanding
        from latex_generator import LaTeXGenerator
        latex_gen = LaTeXGenerator()
        latex_result = await latex_gen.generate_latex_with_context(cleaned_text, context_analysis)
        
        return {
            "raw_text": raw_text,
            "context_analysis": context_analysis,
            "cleaned_text": cleaned_text,
            "latex_result": latex_result
        }
    
    async def _analyze_content_context(self, text: str) -> str:
        """Analyze the content to understand its context and type"""
        
        # Add cache-busting identifier to ensure fresh responses
        import uuid
        cache_buster = str(uuid.uuid4())[:8]
        
        context_analysis_prompt = f"""[Request ID: {cache_buster}] Analyze the following OCR text and provide context understanding:

Text to analyze:
{text}

Please provide a brief analysis covering:
1. Document type (homework, exam, notes, research, etc.)
2. Subject area (math, physics, chemistry, literature, etc.)
3. Key topics or concepts mentioned
4. Mathematical content type (equations, calculations, proofs, etc.)
5. Language and academic level
6. Structural elements (titles, sections, exercises, etc.)

Provide a concise analysis in 2-3 sentences that will help improve text cleaning and LaTeX formatting."""

        context_assistant = """
        You are an expert document analyzer. Your task is to quickly understand the context and type of academic documents.

        Guidelines:
        - Identify the subject area and document type
        - Note key mathematical or scientific concepts
        - Recognize structural patterns (homework problems, lecture notes, etc.)
        - Assess the academic level and complexity
        - Provide actionable insights for text processing
        - Be concise but informative
        - Focus on information that will improve OCR correction and LaTeX formatting
        """
        
        try:
            analysis = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.hackai.get_text_from_hackai_response(context_analysis_prompt, assistant=context_assistant)
            )
            logger.info(f"Context analysis complete: {analysis[:100]}...")
            return analysis.strip()
        except Exception as e:
            logger.error(f"Error in context analysis: {str(e)}")
            return "General academic document with mathematical content."
    
    def _build_context_enhanced_cleaning_prompt(self, raw_text: str, context: str, remarks: Optional[str] = None) -> str:
        """Build an enhanced cleaning prompt with context awareness"""
        
        # Add cache-busting identifier
        import uuid
        cache_buster = str(uuid.uuid4())[:8]
        
        base_prompt = f"[Request ID: {cache_buster}] Please clean up the text {raw_text}. Do not add content by yourself. Do not give any explanations. Just return the cleaned text."
        
        # Add context information
        context_addition = f"\n\nContext analysis: {context}"
        
        # Add user remarks if provided
        if remarks and remarks.strip():
            context_addition += f"\nUser remarks: {remarks.strip()}"
        
        context_addition += "\n\nUse this context to make more accurate corrections, especially for technical terms, mathematical notation, and subject-specific vocabulary."
        
        return base_prompt + context_addition
    
    async def _clean_text_with_context(self, enhanced_prompt: str) -> str:
        """Clean text using the context-enhanced prompt"""
        
        # Use the exact same prompt_assistant from your ocr_space.py, but with enhanced instructions
        cleaning_assistant = r"""
        You are an expert text corrector specialized in cleaning OCR-parsed documents.  
        Your task is to correct inaccuracies, misread characters, and structural errors in raw OCR text.  

        Guidelines:
        - Detect the main language (e.g., German, English, or another) and use it consistently.
        - Use the provided context analysis to make more accurate corrections
        - Correct typical OCR mistakes:
        - Replace misread numbers or letters (e.g., "1,6N" vs "16N", "O" vs "0").
        - Fix broken mathematical notation (e.g., "10°" → "10^", "x , 2" → "x^2").
        - Normalize spacing and punctuation.    
        - If a word, number, or symbol cannot be confidently inferred, keep it but mark it as `[UNCLEAR: ...]`.
        - Do not translate the content into another language unless the OCR clearly switched incorrectly mid-text.
        - Preserve the logical meaning of the original text as much as possible.
        - Output only the corrected plain text. Do not add LaTeX, formatting, or explanations.
        - Ensure the final text is coherent and readable.
        - And also structure the text into paragraphs where appropriate.
        - And also add some of your own corrections based on context and common sense.
        - Pay special attention to technical terms and mathematical expressions based on the context.
        """
        
        try:
            cleaned_text = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.hackai.get_text_from_hackai_response(enhanced_prompt, assistant=cleaning_assistant)
            )
            
            if not cleaned_text or cleaned_text.strip() == "":
                logger.warning("Context-enhanced cleaning returned empty text")
                return enhanced_prompt.split("Please clean up the text ")[1].split(". Do not add content")[0]  # Fallback to original
            
            logger.info(f"Context-enhanced text cleaning complete. Output length: {len(cleaned_text)} characters")
            return cleaned_text.strip()
            
        except Exception as e:
            logger.error(f"Error in context-enhanced text cleaning: {str(e)}")
            # Fallback to basic cleaning
            return await self.clean_text(enhanced_prompt.split("Please clean up the text ")[1].split(". Do not add content")[0])

    async def process_ocr_like_original(self, raw_text: str, remarks: Optional[str] = None) -> Dict[str, str]:
        """
        Process text using the exact same 3-step flow as your ocr_space.py:
        1. OCR extraction (already done - we have raw_text)
        2. Text cleaning using prompt_assistant
        3. LaTeX generation using latex_assistant
        
        Args:
            raw_text: Raw OCR text
            remarks: Optional user remarks
        
        Returns:
            Dictionary with cleaned_text and latex_result
        """
        logger.info("Starting OCR-like processing with 3-step flow")
        
        # Step 1: OCR is already done - we have raw_text
        
        # Step 2: Clean text using the exact same approach
        cleaned_text = await self.clean_text(raw_text, remarks)
        
        # Step 3: Generate LaTeX (we'll need to call the LaTeX generator)
        from latex_generator import LaTeXGenerator
        latex_gen = LaTeXGenerator()
        latex_result = await latex_gen.generate_latex(cleaned_text)
        
        return {
            "raw_text": raw_text,
            "cleaned_text": cleaned_text,
            "latex_result": latex_result
        }

    async def clean_text(self, raw_text: str, remarks: Optional[str] = None) -> str:
        """
        Clean and enhance OCR text using HackAI
        
        Args:
            raw_text: Raw OCR text to be cleaned
            remarks: Optional user remarks for context
        
        Returns:
            Cleaned and enhanced text
        """
        if not raw_text or not raw_text.strip():
            logger.warning("No text provided for cleaning")
            return ""
        
        logger.info(f"Cleaning text of length: {len(raw_text)} characters")
        
        # Prepare the cleaning prompt with context
        context_addition = ""
        if remarks and remarks.strip():
            context_addition = f"\n\nAdditional context from user: {remarks.strip()}"
        
        # Use the exact same prompt format from your ocr_space.py
        prompt = f"Please clean up the text {raw_text}. Do not add content by yourself. Do not give any explanations. Just return the cleaned text."
        
        # Add user context if provided
        if remarks and remarks.strip():
            prompt += f" Additional context from user: {remarks.strip()}"
        
        # Use the exact same prompt_assistant from your ocr_space.py
        cleaning_assistant = r"""
        You are an expert text corrector specialized in cleaning OCR-parsed documents.  
        Your task is to correct inaccuracies, misread characters, and structural errors in raw OCR text.  

        Guidelines:
        - Detect the main language (e.g., German, English, or another) and use it consistently.
        - Correct typical OCR mistakes:
        - Replace misread numbers or letters (e.g., "1,6N" vs "16N", "O" vs "0").
        - Fix broken mathematical notation (e.g., "10°" → "10^", "x , 2" → "x^2").
        - Normalize spacing and punctuation.    
        - If a word, number, or symbol cannot be confidently inferred, keep it but mark it as `[UNCLEAR: ...]`.
        - Do not translate the content into another language unless the OCR clearly switched incorrectly mid-text.
        - Preserve the logical meaning of the original text as much as possible.
        - Output only the corrected plain text. Do not add LaTeX, formatting, or explanations.
        - Ensure the final text is coherent and readable.
        - And also structure the text into paragraphs where appropriate.
        - And also add some of your own corrections based on context and common sense.
        """
        
        try:
            # Run the text cleaning in an async manner
            cleaned_text = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.hackai.get_text_from_hackai_response(prompt, assistant=cleaning_assistant)
            )
            
            if not cleaned_text or cleaned_text.strip() == "":
                logger.warning("HackAI returned empty cleaned text")
                return raw_text  # Fallback to original text
            
            logger.info(f"Text cleaning complete. Output length: {len(cleaned_text)} characters")
            return cleaned_text.strip()
            
        except Exception as e:
            logger.error(f"Error cleaning text with HackAI: {str(e)}")
            # Fallback: return original text if cleaning fails
            return raw_text
    
    async def recommend_title(self, text: str) -> str:
        """
        Generate a title recommendation based on document content
        
        Args:
            text: Document text to analyze for title generation
        
        Returns:
            Recommended title for the document
        """
        if not text or not text.strip():
            logger.warning("No text provided for title recommendation")
            return "Untitled Document"
        
        logger.info(f"Generating title recommendation for text of length: {len(text)} characters")
        
        # Use first portion of text for title generation to avoid token limits
        text_sample = text[:2000] if len(text) > 2000 else text
        
        prompt = f"""Based on the following document content, suggest a concise and descriptive title (maximum 8 words).

Document content:
{text_sample}

Please provide a title that:
- Captures the main topic or subject
- Is concise and professional
- Reflects the document's content and purpose
- Is suitable for academic or professional contexts
- Uses the same language as the document content

Respond with only the title, no explanations or additional text.
"""
        
        title_assistant = """
        You are an expert at creating document titles. Generate concise, professional titles that accurately reflect document content.

        Guidelines:
        - Maximum 8 words
        - Clear and descriptive
        - Professional tone
        - Captures main topic/subject
        - Uses appropriate language (match document language)
        - No unnecessary words or filler
        - Suitable for academic/business contexts
        - Output only the title, nothing else
        """
        
        try:
            recommended_title = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.hackai.get_text_from_hackai_response(prompt, assistant=title_assistant)
            )
            
            if recommended_title and recommended_title.strip():
                # Clean up the title
                title = recommended_title.strip()
                
                # Remove quotes if present
                if title.startswith('"') and title.endswith('"'):
                    title = title[1:-1]
                if title.startswith("'") and title.endswith("'"):
                    title = title[1:-1]
                
                # Limit length and clean
                title = title[:100].strip()  # Maximum 100 characters
                
                logger.info(f"Generated title recommendation: '{title}'")
                return title
            else:
                logger.warning("Title recommendation returned empty result")
                return "Document Analysis"
                
        except Exception as e:
            logger.error(f"Error generating title recommendation: {str(e)}")
            return "Processed Document"
    
    async def enhance_document_structure(self, text: str, title: Optional[str] = None, category: Optional[str] = None) -> str:
        """
        Enhance document structure and organization
        
        Args:
            text: Cleaned text to enhance
            title: Optional document title for context
            category: Optional category for context
        
        Returns:
            Enhanced and structured text
        """
        if not text or not text.strip():
            return ""
        
        context_info = []
        if title:
            context_info.append(f"Document title: {title}")
        if category:
            context_info.append(f"Document category: {category}")
        
        context_string = "\n".join(context_info) if context_info else "No additional context provided."
        
        prompt = f"""Please enhance the structure and organization of the following document text.

{context_string}

Text to enhance:
{text}

Please improve the text by:
- Adding appropriate headings and subheadings where logical
- Organizing content into coherent sections
- Improving paragraph structure
- Maintaining all original content and meaning
- Making the document more readable and well-structured
"""
        
        structure_assistant = """
        You are a document structure expert. Your task is to improve the organization and readability of text while preserving all original content.

        Guidelines:
        - Add clear headings and subheadings where appropriate
        - Organize content into logical sections
        - Improve paragraph breaks and flow
        - Maintain all original information
        - Use consistent formatting throughout
        - Make the document more professional and readable
        - Do not add new content, only reorganize existing content
        - Output clean, well-structured text without LaTeX formatting
        """
        
        try:
            enhanced_text = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.hackai.get_text_from_hackai_response(prompt, assistant=structure_assistant)
            )
            
            if enhanced_text and enhanced_text.strip():
                logger.info("Document structure enhancement complete")
                return enhanced_text.strip()
            else:
                logger.warning("Structure enhancement returned empty result")
                return text
                
        except Exception as e:
            logger.error(f"Error enhancing document structure: {str(e)}")
            return text
    
    async def extract_key_information(self, text: str) -> Dict[str, Any]:
        """
        Extract key information from the document
        
        Args:
            text: Document text to analyze
        
        Returns:
            Dictionary containing extracted information
        """
        if not text or not text.strip():
            return {}
        
        prompt = f"""Analyze the following document text and extract key information.

Text to analyze:
{text}

Please provide the following information in a structured format:
- Main topic/subject
- Key concepts or terms
- Document type (academic, business, legal, etc.)
- Language
- Any important dates, numbers, or facts
- Summary (2-3 sentences)
"""
        
        analysis_assistant = """
        You are a document analysis expert. Extract key information from documents and provide structured summaries.

        Guidelines:
        - Identify the main topic and subject matter
        - Extract key concepts, terms, and facts
        - Determine document type and purpose
        - Provide a concise but informative summary
        - List important dates, numbers, or references
        - Be factual and objective
        - Output in a clear, structured format
        """
        
        try:
            analysis_result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.hackai.get_text_from_hackai_response(prompt, assistant=analysis_assistant)
            )
            
            # Parse the result into a structured format
            # This is a simplified parsing - in production you might want more sophisticated parsing
            info = {
                "analysis": analysis_result,
                "word_count": len(text.split()),
                "character_count": len(text),
                "estimated_reading_time": len(text.split()) // 200  # ~200 words per minute
            }
            
            logger.info("Key information extraction complete")
            return info
            
        except Exception as e:
            logger.error(f"Error extracting key information: {str(e)}")
            return {"error": str(e)}
    
    async def process_document_complete(
        self, 
        raw_text: str, 
        title: Optional[str] = None,
        category: Optional[str] = None,
        remarks: Optional[str] = None,
        enhance_structure: bool = True
    ) -> Dict[str, Any]:
        """
        Complete document processing pipeline
        
        Args:
            raw_text: Raw OCR text
            title: Optional document title
            category: Optional category
            remarks: Optional user remarks
            enhance_structure: Whether to enhance document structure
        
        Returns:
            Dictionary containing all processing results
        """
        logger.info("Starting complete document processing pipeline")
        
        results = {
            "original_text": raw_text,
            "title": title,
            "category": category,
            "remarks": remarks
        }
        
        try:
            # Step 1: Clean the text
            cleaned_text = await self.clean_text(raw_text, remarks)
            results["cleaned_text"] = cleaned_text
            
            # Step 2: Enhance structure (optional)
            if enhance_structure:
                enhanced_text = await self.enhance_document_structure(cleaned_text, title, category)
                results["enhanced_text"] = enhanced_text
                final_text = enhanced_text
            else:
                final_text = cleaned_text
                results["enhanced_text"] = cleaned_text
            
            # Step 3: Extract key information
            key_info = await self.extract_key_information(final_text)
            results["key_information"] = key_info
            
            results["final_text"] = final_text
            results["status"] = "success"
            
            logger.info("Document processing pipeline completed successfully")
            return results
            
        except Exception as e:
            logger.error(f"Error in document processing pipeline: {str(e)}")
            results["status"] = "error"
            results["error"] = str(e)
            results["final_text"] = raw_text  # Fallback to original
            return results