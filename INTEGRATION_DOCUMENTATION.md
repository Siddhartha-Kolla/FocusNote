# FocusNote Document Processing Integration

## Overview

This document describes the complete integration between the FocusNote frontend, Node.js backend, and Python API for document processing. The system processes scanned images through OCR, AI text cleaning, LaTeX generation, and PDF creation.

## Architecture

```
Frontend (Next.js) → Node.js Backend (Express) → Python API (FastAPI) → Processing Pipeline
                                                                        ↓
Database (Prisma/PostgreSQL) ← File Storage ← Generated Documents ← PDF/LaTeX Output
```

## Component Integration

### 1. Frontend (Next.js)
**File**: `FocusNote_Frontend/app/user/scan/page.tsx`

**Functionality**:
- File upload interface with drag-and-drop
- Title, category, and remarks input
- Real-time category autocomplete
- Document processing status
- Download processed documents

**API Integration**:
- `processScanAction()`: Sends images and metadata to Node.js backend
- `downloadDocumentAction()`: Downloads processed documents
- `getProcessingHistoryAction()`: Retrieves user's processing history

### 2. Node.js Backend (Express)
**File**: `FocusNote-backend/src/routes/process.js`

**Endpoints**:
- `POST /process/scan`: Main document processing endpoint
- `GET /process/history`: User's processing history
- `GET /process/download/:chat_id`: Download processed documents

**Workflow**:
1. Receives images and metadata from frontend
2. Forwards to Python API for processing
3. Downloads generated PDF/document
4. Stores input/output files in database
5. Creates chat entry with processing details
6. Returns processing results to frontend

### 3. Python API (FastAPI)
**File**: `backend/main.py`

**Endpoints**:
- `POST /scan/process`: Core processing pipeline
- `GET /download/{filename}`: File download
- `DELETE /cleanup/{filename}`: File cleanup

**Processing Pipeline**:
1. OCR processing (multiple images)
2. AI text cleaning and enhancement
3. Title recommendation (if not provided)
4. LaTeX document generation
5. PDF compilation
6. File storage and response

## Database Schema

### Chat Table
```sql
model Chat {
  id         String   @id @default(uuid())
  user_id    String
  title      String?
  section    String?
  messages   Json     -- Processing metadata
  created_at DateTime @default(now())
  
  user User @relation(fields: [user_id], references: [id])
  Doc  Doc[]
}
```

### Doc Table
```sql
model Doc {
  id         String   @id @default(uuid())
  user_id    String
  author     String   -- "user" | "ai"
  chat_id    String
  blob       Bytes    -- File binary data
  created_at DateTime @default(now())
  
  user User @relation(fields: [user_id], references: [id])
  chat Chat @relation(fields: [chat_id], references: [id])
}
```

## Request/Response Flow

### 1. Scan Processing Request

**Frontend → Node.js Backend**
```javascript
POST /process/scan
Content-Type: multipart/form-data
Authorization: Bearer <token>

FormData:
- images: File[] (multiple image files)
- title?: string
- category?: string
- remarks?: string
- section?: string
```

**Node.js Backend → Python API**
```javascript
POST /scan/process
Content-Type: multipart/form-data

FormData:
- images: File[] (forwarded from frontend)
- title?: string
- category?: string
- remarks?: string
- timestamp: string (ISO date)
```

**Python API Response**
```json
{
  "status": "success",
  "message": "Successfully processed 2 images in 15.32 seconds",
  "processed_text": "Cleaned OCR text...",
  "latex_content": "\\documentclass{article}...",
  "filename": "document_20250921_144532.pdf",
  "download_url": "/download/document_20250921_144532.pdf",
  "recommended_title": "Physics Homework - Gravitational Forces"
}
```

**Node.js Backend Response**
```json
{
  "success": true,
  "message": "Document processed successfully",
  "data": {
    "chat_id": "uuid-chat-id",
    "title": "Physics Homework - Gravitational Forces",
    "section": "Physics",
    "input_docs": [
      { "id": "input-doc-1-id" },
      { "id": "input-doc-2-id" }
    ],
    "output_doc": { "id": "output-doc-id" },
    "processing_results": {
      "recommended_title": "Physics Homework - Gravitational Forces",
      "processed_text_length": 1542,
      "file_type": "pdf",
      "processing_time": "15.32"
    }
  }
}
```

### 2. Document Download

**Frontend → Node.js Backend**
```javascript
GET /process/download/{chat_id}
Authorization: Bearer <token>
```

**Response**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="document.pdf"

<PDF binary data>
```

## Configuration

### Environment Variables

**Node.js Backend** (`.env`)
```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/focusnote"
JWT_SECRET="your-secure-jwt-secret"
PORT=4000
PYTHON_API_URL="http://localhost:8000"
```

**Frontend** (`.env.local`)
```bash
FOCUSNOTE_BACKEND_URL="http://localhost:4000"
NODE_ENV=development
```

**Python API** (environment or config)
```bash
# OCR.space API configuration
OCR_API_KEY="your-ocr-space-api-key"

# HackAI API configuration  
HACKAI_API_KEY="your-hackai-api-key"
```

## Setup Instructions

### 1. Install Dependencies

**Node.js Backend**
```bash
cd FocusNote-backend
npm install
npm install form-data@^4.0.0 node-fetch@^2.7.0
```

**Python API**
```bash
cd backend
pip install -r requirements.txt
```

### 2. Database Setup
```bash
cd FocusNote-backend
npx prisma generate
npx prisma migrate dev
```

### 3. Start Services

**Python API**
```bash
cd backend
python main.py
# Runs on http://localhost:8000
```

**Node.js Backend**
```bash
cd FocusNote-backend
npm run dev
# Runs on http://localhost:4000
```

**Frontend**
```bash
cd FocusNote_Frontend
npm run dev
# Runs on http://localhost:3000
```

## Features

### 1. Document Processing
- ✅ Multi-image OCR processing
- ✅ AI-powered text cleaning and enhancement
- ✅ Automatic title recommendation
- ✅ LaTeX document generation
- ✅ PDF compilation with fallback to LaTeX
- ✅ Error handling and recovery

### 2. File Management
- ✅ Input image storage in database
- ✅ Output document storage in database
- ✅ Secure file download
- ✅ Automatic cleanup of temporary files

### 3. User Experience
- ✅ Real-time processing status
- ✅ Category autocomplete
- ✅ Processing history
- ✅ One-click document download
- ✅ Error messaging and feedback

### 4. Security & Performance
- ✅ JWT authentication
- ✅ File type validation
- ✅ Size limits and timeouts
- ✅ Concurrent processing
- ✅ Database optimization

## Error Handling

### Common Issues and Solutions

1. **"Authentication required"**
   - Ensure user is logged in
   - Check JWT token in cookies
   - Verify auth middleware

2. **"Python API connection failed"**
   - Check if Python API is running
   - Verify PYTHON_API_URL configuration
   - Check firewall/network connectivity

3. **"LaTeX compilation failed"**
   - Ensure pdflatex is installed
   - Check for math mode character issues
   - Review LaTeX generation rules

4. **"File not found"**
   - Check file permissions
   - Verify database file storage
   - Check cleanup timing

## Monitoring and Logging

### Node.js Backend Logs
- Request/response logging
- Database operation logs
- Python API interaction logs
- Error tracking and stack traces

### Python API Logs
- Processing pipeline steps
- Performance monitoring
- OCR/AI API call logs
- LaTeX compilation logs

## Performance Considerations

### Optimization Features
- Concurrent image processing
- Streaming file uploads
- Database connection pooling
- Memory-efficient file handling
- Background cleanup processes

### Scaling Recommendations
- Load balancing for multiple backend instances
- Redis for session management
- S3/object storage for file storage
- Separate processing queues for heavy operations
- CDN for static file delivery

## API Testing

### Example curl Commands

**Process Documents**
```bash
curl -X POST "http://localhost:4000/process/scan" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg" \
  -F "title=Test Document" \
  -F "remarks=This is a test"
```

**Download Document**
```bash
curl -X GET "http://localhost:4000/process/download/CHAT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output document.pdf
```

**Get History**
```bash
curl -X GET "http://localhost:4000/process/history" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

This integration provides a complete, production-ready document processing system with robust error handling, security, and user experience features.