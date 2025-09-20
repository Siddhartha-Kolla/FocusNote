import os
from typing import List, Dict

from libzim.reader import Archive
from libzim.search import Query, Searcher

import whoosh.index as windex
from whoosh.fields import Schema, TEXT, ID
from whoosh.qparser import QueryParser
from whoosh import highlight

from pypdf import PdfReader
import re

class LocalSearcher:
    def __init__(self, root_dir: str, index_dir: str = "local_search_index"):
        """
        Initializes the searcher by indexing files in the given root directory and subdirectories.
        - ZIM files are handled specially using libzim for built-in full-text search.
        - Other files (txt, pdf) are indexed using Whoosh for keyword-based search.
        """
        self.root_dir = root_dir
        self.index_dir = index_dir
        self.zim_archives = []  # List of ZIM Archive objects
        self._build_index()

    def _extract_text(self, filepath: str) -> str:
        """
        Extracts text from supported file types.
        """
        if filepath.endswith('.txt'):
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        elif filepath.endswith('.tex'):
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    raw = f.read()
                return self._clean_latex(raw)
            except Exception as e:
                print(f"Error extracting TEX {filepath}: {e}")
                return ''
        elif filepath.endswith('.pdf'):
            try:
                reader = PdfReader(filepath)
                text = ''
                for page in reader.pages:
                    text += page.extract_text() or ''
                return text
            except Exception as e:
                print(f"Error extracting PDF {filepath}: {e}")
                return ''
        # Add more file types as needed (e.g., docx with python-docx)
        return ''

    def _clean_latex(self, text: str) -> str:
        """
        Remove LaTeX commands, environments, math, and comments to leave readable plain text.
        This is a heuristic stripper (not a full LaTeX parser) intended for indexing and search.
        """
        # Remove comments (lines starting with %)
        text = re.sub(r"(?m)^%.*$", "", text)
        # Remove inline comments (after %), but keep escaped \% by temporarily protecting them
        text = text.replace(r"\%", "__PERCENT_ESCAPED__")
        text = re.sub(r"%.*", "", text)
        text = text.replace("__PERCENT_ESCAPED__", r"%")

        # Remove content in common environments (equation, align, figure, table, tikzpicture, lstlisting)
        envs = [
            r'equation', r'equation\*', r'align', r'align\*', r'multiline', r'gather', r'math',
            r'figure', r'table', r'tikzpicture', r'lstlisting', r'verbatim', r'Verbatim'
        ]
        for env in envs:
            pattern = re.compile(r"\\begin\{" + env + r"\}.*?\\end\{" + env + r"\}", re.DOTALL)
            text = pattern.sub(' ', text)

        # Remove display math $$...$$ and \[ ... \]
        text = re.sub(r"\$\$.*?\$\$", " ", text, flags=re.DOTALL)
        text = re.sub(r"\\\[.*?\\\]", " ", text, flags=re.DOTALL)

        # Remove inline math $...$
        text = re.sub(r"\$(?:[^$\\]|\\.)*\$", " ", text)

        # Remove LaTeX commands like \command[optional]{required} or \command{...} or \command
        # Keep simple text inside some commands like \textbf{...} by extracting the inner text
        # First, replace common formatting commands by their contents
        formatting_cmds = ['textbf', 'textit', 'emph', 'underline', 'texttt', 'textrm', 'textsf']
        for cmd in formatting_cmds:
            text = re.sub(r"\\" + cmd + r"\s*\{([^}]*)\}", r"\1", text)

        # Remove any remaining \command{...} by stripping command but keeping contents
        text = re.sub(r"\\[a-zA-Z@]+\s*\{([^}]*)\}", r"\1", text)
        # Remove any remaining commands like \command[...]{...}
        text = re.sub(r"\\[a-zA-Z@]+\s*\[[^\]]*\]\s*\{([^}]*)\}", r"\1", text)
        # Remove commands like \command
        text = re.sub(r"\\[a-zA-Z@]+", "", text)

        # Remove leftover braces
        text = text.replace('{', ' ').replace('}', ' ')

        # Collapse multiple whitespace
        text = re.sub(r"\s+", " ", text)

        return text.strip()

    def _build_index(self):
        """
        Traverses the directory, loads ZIM archives, and indexes non-ZIM files with Whoosh.
        """
        # Create Whoosh index if it doesn't exist
        schema = Schema(path=ID(stored=True), content=TEXT(stored=True))
        if not os.path.exists(self.index_dir):
            os.mkdir(self.index_dir)
        ix = windex.create_in(self.index_dir, schema)
        writer = ix.writer()

        # Traverse directory
        for root, dirs, files in os.walk(self.root_dir):
            for file in files:
                filepath = os.path.join(root, file)
                if filepath.endswith('.zim'):
                    try:
                        archive = Archive(filepath)
                        self.zim_archives.append(archive)
                        print(f"Loaded ZIM archive: {filepath}")
                    except Exception as e:
                        print(f"Error loading ZIM {filepath}: {e}")
                else:
                    text = self._extract_text(filepath)
                    if text:
                        writer.add_document(path=filepath, content=text)
                        print(f"Indexed file: {filepath}")

        writer.commit()
        self.ix = windex.open_dir(self.index_dir)

    def search(self, question: str, max_results_per_source: int = 10) -> List[Dict[str, str]]:
        """
        Searches for relevant information based on the question.
        - Uses Whoosh for non-ZIM files (keyword search with snippets).
        - Uses libzim's built-in full-text search for ZIM archives (returns full article content).
        Returns a list of dicts with 'source' and 'content' (full or snippet).
        """
        results = []

        # Search non-ZIM files with Whoosh
        with self.ix.searcher() as searcher:
            query = QueryParser("content", self.ix.schema).parse(question)
            whoosh_results = searcher.search(query, limit=max_results_per_source)
            whoosh_results.fragmenter = highlight.ContextFragmenter()
            for hit in whoosh_results:
                snippet = hit.highlights("content") if hit.highlights("content") else hit['content'][:500]  # Fallback to first 500 chars
                results.append({
                    'source': hit['path'],
                    'content': snippet,
                    'type': 'snippet'  # Indicate it's a snippet for further processing
                })

        # Search each ZIM archive using built-in full-text search
        for zim in self.zim_archives:
            try:
                searcher = Searcher(zim)
                query = Query().set_query(question)
                search = searcher.search(query)
                search_count = min(search.getEstimatedMatches(), max_results_per_source)
                for entry_path in search.getResults(0, search_count):
                    zim_entry = zim.get_entry_by_path(entry_path)
                    item = zim_entry.get_item()
                    content = bytes(item.content).decode('UTF-8', errors='ignore')
                    results.append({
                        'source': f"ZIM: {zim.filename} - {zim_entry.title} (path: {entry_path})",
                        'content': content,
                        'type': 'full_article'
                    })
            except Exception as e:
                print(f"Error searching ZIM {zim.filename}: {e}")

        return results

# Example usage
if __name__ == "__main__":
    searcher = LocalSearcher("./data")
    prompt = "What is the mass of Sirius B?"
    results = searcher.search(prompt)
    for res in results:
        print(f"Source: {res['source']}\nContent: {res['content'][:500]}...\n")