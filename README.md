# FocusNote

Turn stacks of scanned notes into beautifully formatted LaTeX documents — instantly. FocusNote combines reliable OCR, AI text cleaning, and automated LaTeX generation with an AI-powered exam generator. It's built to save time for educators, students, and content creators who want production-quality documents from messy scans.\
\
What’s in this repository
-------------------------
- `backend/` — Python FastAPI service: OCR, AI cleaning, LaTeX generation, PDF compilation, exam generation, and LLM helpers.
- `FocusNote_Frontend/` — Next.js TypeScript frontend (example UI and integration code).
- `FocusNote-backend/` — Optional Node.js service (auth, chats, docs) used in some deployments.

Why FocusNote
-------------
- Fast OCR pipeline with AI-based cleaning to fix OCR artifacts.
- Produces compilable LaTeX so you can export to PDF or further edit the source.
- Exam generator: AI crafts question sets and returns a polished PDF exam.
- Designed for quick integration: simple REST endpoints and example frontend code.

Quick Start (Windows / PowerShell)
---------------------------------
1. Create a virtual environment and install dependencies:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Start the backend server:
```powershell
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

3. Start the frontend (optional, in a separate terminal):
```powershell
cd FocusNote_Frontend
npm install
npm run dev
```

4. Generate an exam PDF (example):
```powershell
curl -X POST "http://localhost:8002/exam/pdf" `
	-H "Content-Type: application/json" `
	-d '{"total_questions":5,"title":"Mini Exam"}' --output exam.pdf
```

Core backend endpoints
----------------------
All examples assume `http://localhost:8002` as the backend base URL.

- Health
	- `GET /health`
	- Returns service and environment information (e.g. whether `pdflatex` is available).

- OCR / Document Processing
	- `POST /scan/process` (multipart/form-data)
	- Fields: `images` (multiple files), `title` (optional), `category` (optional), `remarks` (optional), `timestamp` (optional)
	- Returns structured JSON with cleaned text, LaTeX content, and a download link for the generated file.

	Example (PowerShell):
	```powershell
	curl -X POST "http://localhost:8002/scan/process" `
		-F "images=@C:\path\to\page1.png" -F "images=@C:\path\to\page2.png" -F "title=Lecture Notes"
	```

- Exam generator
	- `POST /exam/pdf` (application/json)
	- Body: parameters to control number, difficulty distribution and task distribution, plus `title` and `author` (see `backend/README.md` for full schema).
	- Returns a `application/pdf` stream (downloadable file).

	Example (PowerShell):
	```powershell
	curl -X POST "http://localhost:8002/exam/pdf" -H "Content-Type: application/json" `
		-d '{"total_questions":10,"title":"Midterm Practice"}' --output midterm.pdf
	```

- Download and cleanup
	- `GET /download/{filename}` — download a generated file from `backend/output/`.
	- `DELETE /cleanup/{filename}` — remove a generated file.

- Chat / LLM helpers
	- `POST /chat` — conversational queries about documents (returns chat responses).
	- `POST /llm/call` — generic wrapper to the internal LLM endpoint. Use for quick prompts.

LaTeX & PDF compilation
------------------------
- The service compiles `.tex` files to PDF using `pdflatex`. You must have a TeX distribution installed (TeX Live or MiKTeX).
- On Windows: install MiKTeX or TeX Live and ensure `pdflatex` is on `PATH`.
- If compilation fails: inspect `backend/output/` and the `.log` files produced by the compiler.

Docker
------
A `Dockerfile` is available in `backend/` for containerized runs. Example:

```powershell
cd backend
docker build -t focusnote-backend .
docker run -p 8002:8002 --rm focusnote-backend
```

Note: include a TeX engine in the image or PDF compilation will fail.

Troubleshooting
---------------
- `pdflatex not found` — install TeX Live / MiKTeX and add `pdflatex` to PATH.
- LLM failures — verify network connectivity and configuration in `backend/hackai_api_access.py` or `backend/genCon/llm.py`.
- LaTeX errors — inspect the generated `.tex` file and the pdflatex `.log` file in `backend/output/`.

Security & production guidance
-----------------------------
- Do not expose the backend to the public internet without authentication. Add JWT or API-key auth.
- Run PDF compilation inside isolated workers or containers to reduce attack surface.
- Apply rate limiting and input sanitization before passing user text into LaTeX or external LLM services.

Contributing
------------
- Fork the repo, create a feature branch, and open a pull request.
- Run linters and tests locally before submitting.

Contact & License
-----------------
- See repository LICENSE (if present) and open issues for questions.

Further reading
---------------
For detailed backend usage and examples, see `backend/README.md`. For LaTeX compilation details see `backend/LATEX_COMPILER_README.md`.
# FocusNote

Smart scanning, OCR → LaTeX conversion, and AI-powered exam generation.

This repository contains:

- `backend/` — FastAPI service (OCR, LaTeX, exam generator, LLM integration)
- `FocusNote_Frontend/` — Next.js TypeScript frontend
- `FocusNote-backend/` — Node.js service (auth, chats, docs)

---

## Quick overview

FocusNote turns scanned pages into LaTeX, lets you ask an LLM to generate exams, and can compile `.tex` to PDF. The backend exposes REST endpoints used by the frontend.

---

## Quick start (Windows / PowerShell)

1. Backend: create venv and install
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Start backend
```powershell
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

3. Frontend (in another terminal)
```powershell
cd FocusNote_Frontend
npm install
npm run dev
```

4. Generate an exam PDF (example)
```powershell
curl -X POST "http://localhost:8002/exam/pdf" `
	-H "Content-Type: application/json" `
	-d '{"total_questions":5,"title":"Mini Exam"}' --output exam.pdf
```

---

## Backend — Endpoints & examples

Assumes backend is at `http://localhost:8002`.

- **Health**
	- `GET /health`
	- Example: `curl http://localhost:8002/health`

- **OCR / document processing**
	- `POST /scan/process`
	- Form fields: `images` (file[]), `title` (string), `category`, `remarks`, `timestamp`
	- Example:
		```powershell
		curl -X POST "http://localhost:8002/scan/process" `
			-F "images=@C:\pages\page1.png" -F "images=@C:\pages\page2.png" -F "title=MyDoc"
		```
	- Output: JSON with extracted text and generated `.tex` (saved under `backend/output/`).

- **LLM (internal helper)**
	- `POST /llm/call`
	- Body: `{ "prompt": "...", "info": {...} }`
	- Example:
		```powershell
		curl -X POST "http://localhost:8002/llm/call" -H "Content-Type: application/json" `
			-d '{"prompt":"Generate 3 math questions on integrals"}'
		```

- **Chat / conversation**
	- `POST /chat` — depends on project LLM glue code; sends `ChatRequest` and receives `ChatResponse`.

- **Exam PDF generation**
	- `POST /exam/pdf`
	- JSON body example:
		```json
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
		```
	- The response is a PDF stream (Content-Type: `application/pdf`). Example to save PDF:
		```powershell
		curl -X POST "http://localhost:8002/exam/pdf" -H "Content-Type: application/json" -d '{"total_questions":5,"title":"Mini Exam"}' --output exam.pdf
		```
	- Note: the backend uses `pdflatex` to compile the generated `.tex`. Ensure `pdflatex` is installed and available in PATH.

- **Download / cleanup**
	- `GET /download/{filename}` — retrieve generated files
	- `DELETE /cleanup/{filename}` — remove generated files

---

## LaTeX & PDF compilation

- The backend uses `pdflatex` (via the `LaTeXGenerator`) to compile `.tex` → `.pdf` in a temporary working directory.
- On Windows install TeX Live or MiKTeX and ensure `pdflatex` is on PATH.
- See `backend/LATEX_COMPILER_README.md` for troubleshooting compilation errors.
- If compilation fails the API returns a 500 and logs; check `backend/output/` and any `.log` files created by pdflatex.

---

## Docker (backend)

A `Dockerfile` exists in `backend/` for containerized runs. Basic use:
```powershell
cd backend
docker build -t focusnote-backend .
docker run -p 8002:8002 --rm focusnote-backend
```

Note: Docker image must include a LaTeX engine or compilation will fail.

---

## File locations

- `backend/output.tex` — last generated LaTeX (if saved)
- `backend/output.pdf` — compiled PDF (if generation succeeded)
- Generated files are stored in `backend/output/` while requests are handled. Clean with `/cleanup/{filename}`.

---

## Security & production notes

- LLM and PDF generation endpoints execute external processes and call external services. Protect them:
	- Add authentication (JWT / API key)
	- Rate-limit requests
	- Sanitize inputs before using them in LaTeX
- Do not expose LLM keys or pdflatex logs publicly.
- For production, run compilation in a sandboxed worker / container and queue long jobs.

---

## Troubleshooting

- **pdflatex not found** → install a TeX distribution and add `pdflatex` to PATH.
- **LLM errors** → ensure API keys and network connectivity are configured in `backend/hackai_api_access.py` or `genCon/llm.py`.
- **LaTeX compilation issues** → inspect `backend/output.tex` and the pdflatex `.log` file.

---

## Development tips

- Use `uvicorn --reload` for rapid iteration.
- Check `backend/test_server.py` for example requests and tests.
- Frontend calls backend endpoints in `FocusNote_Frontend/lib/actions` — update host if backend runs on a different origin.

---

## Contributing

- Fork → branch → PR.
- Run unit tests and linters before submitting.
- Document breaking changes in README updates.

---

## License & contact

- See repository LICENSE (if present).
- For questions: open an issue in the repo.

---

This README covers setup, endpoints, LaTeX requirements, and troubleshooting. For backend-specific details, see `backend/README.md` and `backend/LATEX_COMPILER_README.md`.
