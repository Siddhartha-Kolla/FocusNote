# LaTeX Compiler Usage Examples

This directory contains a standalone LaTeX to PDF compiler that can be used independently or integrated into other applications.

## Dependencies

### LaTeX Distribution Required
- **Windows**: MiKTeX or TeX Live
- **Mac**: MacTeX  
- **Linux**: `sudo apt-get install texlive-latex-base texlive-latex-extra`

### Python Dependencies
```bash
# No additional Python packages required - uses only standard library
```

## Command Line Usage

### Basic Compilation
```bash
# Compile a .tex file to PDF
python latex_compiler.py document.tex

# Compile with custom output name
python latex_compiler.py document.tex -o my_report.pdf

# Compile to specific directory
python latex_compiler.py document.tex -d ./output/

# Multiple compilation runs (for references/citations)
python latex_compiler.py document.tex -r 3

# Verbose output for debugging
python latex_compiler.py document.tex -v

# Keep auxiliary files (.log, .aux, etc.)
python latex_compiler.py document.tex --no-cleanup
```

## Python Module Usage

### Simple String Compilation
```python
from latex_compiler import compile_latex_string

latex_code = r"""
\documentclass{article}
\begin{document}
\title{My Document}
\author{John Doe}
\maketitle

\section{Introduction}
This is a test document.

\end{document}
"""

# Compile to PDF
success = compile_latex_string(latex_code, "output.pdf")
if success:
    print("PDF generated successfully!")
```

### Advanced Usage
```python
from latex_compiler import compile_latex_to_pdf

# Compile with full control
pdf_path = compile_latex_to_pdf(
    latex_content=latex_code,
    output_dir="./documents/",
    output_name="report.pdf",
    cleanup=True,
    runs=2,
    verbose=True
)

if pdf_path:
    print(f"PDF saved to: {pdf_path}")
```

### Integration Example
```python
import logging
from latex_compiler import compile_latex_to_pdf, setup_logging

# Setup logging
setup_logging(verbose=True)

# Your LaTeX generation logic
def generate_document_latex(data):
    return f"""
\\documentclass{{article}}
\\begin{{document}}
\\title{{{data['title']}}}
\\author{{{data['author']}}}
\\maketitle

\\section{{Content}}
{data['content']}

\\end{{document}}
"""

# Process document
data = {
    "title": "Generated Report",
    "author": "System",
    "content": "This is automatically generated content."
}

latex_content = generate_document_latex(data)
pdf_file = compile_latex_to_pdf(
    latex_content=latex_content,
    output_name="generated_report.pdf"
)

if pdf_file:
    print(f"Document ready: {pdf_file}")
```

## Error Handling

The compiler includes comprehensive error handling:

- **Dependency checks**: Verifies pdflatex is available
- **Timeout protection**: 60-second compilation limit
- **Error extraction**: Parses LaTeX log files for specific errors
- **Verbose logging**: Detailed output for debugging
- **Graceful cleanup**: Temporary files are always cleaned up

## Common LaTeX Packages

For advanced documents, ensure these packages are installed:

```bash
# Ubuntu/Debian
sudo apt-get install texlive-latex-extra texlive-fonts-recommended

# Or install specific packages
sudo apt-get install texlive-latex-base texlive-latex-recommended
```

## Troubleshooting

### "pdflatex not found"
Install a LaTeX distribution for your operating system.

### "Missing $ inserted" Error
This is the most common LaTeX compilation error. It occurs when math mode characters are used outside math mode:

**Problem characters:**
- `^` (caret/superscript): Must be `$^2$` or `\textasciicircum{}`
- `_` (underscore/subscript): Must be `$_i$` or `\_`

**Common examples:**
```latex
% WRONG - causes "Missing $ inserted"
Exponenten mit ^2/^3 und korrekt

% CORRECT
Exponenten mit $^2/^3$ und korrekt
```

**Quick fixes:**
- Wrap math expressions in `$...$`: `$^2/^3$`
- Escape literal characters: `\_`, `\textasciicircum{}`
- Use `-v` flag to see exact error location

### "LaTeX compilation failed"
- Use `-v` flag for detailed error output
- Check the LaTeX syntax in your document
- Ensure all required packages are installed

### Compilation timeout
- Large documents may need optimization
- Check for infinite loops in LaTeX code
- Reduce image sizes or complexity

## Performance Notes

- First compilation run: ~2-5 seconds for simple documents
- Subsequent runs: ~1-2 seconds (for references/citations)
- Memory usage: ~50-100MB during compilation
- Temporary disk usage: ~1-5MB per document