const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const prisma = require('../prismaClient');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Configuration
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8002';
const TEMP_DIR = path.join(__dirname, '../../temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Process scanned documents through the Python API
 * POST /process/scan
 */
router.post('/scan', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, category, remarks, section } = req.body;
    const images = req.files;
    const userId = req.user.id;

    console.log(`Processing scan request for user ${userId} with ${images?.length || 0} images`);

    // Validate request
    if (!images || images.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    // Step 1: Send images to Python API for processing
    console.log('Sending images to Python API for processing...');
    const pythonResponse = await sendToPythonAPI(images, { title, category, remarks });

    if (!pythonResponse.success) {
      console.error('Python API processing failed:', pythonResponse.error);
      return res.status(500).json({ 
        error: 'Document processing failed', 
        details: pythonResponse.error 
      });
    }

    const processedData = pythonResponse.data;
    
    // Step 2: Download the generated PDF from Python API
    console.log('Downloading generated file from Python API...');
    const fileData = await downloadFileFromPythonAPI(processedData.download_url);
    
    if (!fileData.success) {
      console.error('File download failed:', fileData.error);
      return res.status(500).json({ 
        error: 'Failed to download processed file', 
        details: fileData.error 
      });
    }

    // Step 3: Create a new chat entry
    const finalTitle = title || processedData.recommended_title || 'Processed Document';
    const finalSection = section || category || 'General';

    console.log('Creating chat entry with title:', finalTitle);
    const chat = await prisma.chat.create({
      data: {
        user_id: userId,
        title: finalTitle,
        section: finalSection,
        messages: {
          type: 'document_processing',
          timestamp: new Date().toISOString(),
          input: {
            image_count: images.length,
            original_title: title,
            category: category,
            remarks: remarks,
            processing_details: {
              ocr_completed: true,
              ai_cleaning: true,
              latex_generated: true,
              pdf_generated: processedData.filename?.endsWith('.pdf') || false
            }
          },
          output: {
            processed_text_length: processedData.processed_text?.length || 0,
            final_title: finalTitle,
            recommended_title: processedData.recommended_title,
            filename: processedData.filename,
            file_type: processedData.filename?.split('.').pop() || 'unknown'
          }
        }
      }
    });

    console.log('Created chat with ID:', chat.id);

    // Step 4: Store input images in database
    console.log('Storing input images...');
    const inputDocsPromises = images.map((image, index) => 
      prisma.doc.create({
        data: {
          user_id: userId,
          chat_id: chat.id,
          author: 'user',
          blob: image.buffer,
        }
      })
    );

    const inputDocs = await Promise.all(inputDocsPromises);
    console.log(`Stored ${inputDocs.length} input images`);

    // Step 5: Store output PDF/file in database
    console.log('Storing output file...');
    const outputDoc = await prisma.doc.create({
      data: {
        user_id: userId,
        chat_id: chat.id,
        author: 'ai',
        blob: fileData.buffer,
      }
    });

    console.log('Stored output file with ID:', outputDoc.id);

    // Step 6: Clean up downloaded file (optional, since we have it in DB)
    if (fileData.tempPath && fs.existsSync(fileData.tempPath)) {
      try {
        fs.unlinkSync(fileData.tempPath);
      } catch (err) {
        console.warn('Failed to clean up temp file:', err.message);
      }
    }

    // Step 7: Clean up file from Python API
    try {
      await cleanupPythonAPIFile(processedData.filename);
    } catch (err) {
      console.warn('Failed to cleanup Python API file:', err.message);
    }

    // Return success response
    res.json({
      success: true,
      message: 'Document processed successfully',
      data: {
        chat_id: chat.id,
        title: finalTitle,
        section: finalSection,
        input_docs: inputDocs.map(doc => ({ id: doc.id })),
        output_doc: { id: outputDoc.id },
        processing_results: {
          recommended_title: processedData.recommended_title,
          processed_text_length: processedData.processed_text?.length || 0,
          file_type: processedData.filename?.split('.').pop() || 'unknown',
          processing_time: processedData.message?.match(/(\d+\.\d+) seconds/)?.[1] || 'unknown'
        }
      }
    });

  } catch (error) {
    console.error('Error in document processing:', error);
    res.status(500).json({ 
      error: 'Internal server error during document processing',
      details: error.message 
    });
  }
});

/**
 * Get processing history for user
 * GET /process/history
 */
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const chats = await prisma.chat.findMany({
      where: { 
        user_id: userId,
        messages: {
          path: ['type'],
          equals: 'document_processing'
        }
      },
      orderBy: { created_at: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        Doc: {
          select: {
            id: true,
            author: true,
            created_at: true
          }
        }
      }
    });

    const formattedChats = chats.map(chat => ({
      id: chat.id,
      title: chat.title,
      section: chat.section,
      created_at: chat.created_at,
      input_files: chat.Doc.filter(doc => doc.author === 'user').length,
      output_files: chat.Doc.filter(doc => doc.author === 'ai').length,
      processing_info: chat.messages?.output || {}
    }));

    res.json({
      success: true,
      data: formattedChats,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: formattedChats.length
      }
    });

  } catch (error) {
    console.error('Error fetching processing history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch processing history',
      details: error.message 
    });
  }
});

/**
 * Download processed document
 * GET /process/download/:chat_id
 */
router.get('/download/:chat_id', auth, async (req, res) => {
  try {
    const { chat_id } = req.params;
    const userId = req.user.id;

    // Find the output document for this chat
    const outputDoc = await prisma.doc.findFirst({
      where: {
        chat_id: chat_id,
        user_id: userId,
        author: 'ai'
      },
      include: {
        chat: {
          select: {
            title: true,
            messages: true
          }
        }
      }
    });

    if (!outputDoc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Determine file type and name
    const fileType = outputDoc.chat.messages?.output?.file_type || 'pdf';
    const fileName = `${outputDoc.chat.title || 'document'}.${fileType}`;
    
    // Set appropriate headers
    const mimeType = fileType === 'pdf' ? 'application/pdf' : 'text/plain';
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(outputDoc.blob);

  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ 
      error: 'Failed to download document',
      details: error.message 
    });
  }
});

// Helper Functions

/**
 * Send images to Python API for processing
 */
async function sendToPythonAPI(images, metadata) {
  try {
    const formData = new FormData();
    
    // Add images
    images.forEach((image, index) => {
      formData.append('images', image.buffer, {
        filename: `image_${index}.${image.mimetype.split('/')[1]}`,
        contentType: image.mimetype
      });
    });

    // Add metadata
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.category) formData.append('category', metadata.category);
    if (metadata.remarks) formData.append('remarks', metadata.remarks);
    formData.append('timestamp', new Date().toISOString());

    const response = await fetch(`${PYTHON_API_URL}/scan/process`, {
      method: 'POST',
      body: formData,
      timeout: 120000 // 2 minute timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Python API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error('Error calling Python API:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Download file from Python API
 */
async function downloadFileFromPythonAPI(downloadUrl) {
  try {
    const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : `${PYTHON_API_URL}${downloadUrl}`;
    
    const response = await fetch(fullUrl, {
      timeout: 60000 // 1 minute timeout
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} - ${response.statusText}`);
    }

    const buffer = await response.buffer();
    
    // Create temporary file
    const tempFileName = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempPath = path.join(TEMP_DIR, tempFileName);
    
    fs.writeFileSync(tempPath, buffer);

    return { 
      success: true, 
      buffer, 
      tempPath 
    };

  } catch (error) {
    console.error('Error downloading file from Python API:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clean up file from Python API
 */
async function cleanupPythonAPIFile(filename) {
  try {
    if (!filename) return;
    
    const response = await fetch(`${PYTHON_API_URL}/cleanup/${filename}`, {
      method: 'DELETE',
      timeout: 10000
    });

    if (response.ok) {
      console.log(`Successfully cleaned up Python API file: ${filename}`);
    } else {
      console.warn(`Failed to cleanup Python API file: ${filename}`);
    }
  } catch (error) {
    console.warn('Error cleaning up Python API file:', error.message);
  }
}

module.exports = router;