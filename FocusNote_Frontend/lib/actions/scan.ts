'use server'

import { cookies } from 'next/headers';

interface ScanResult {
  success: boolean;
  error?: string;
  data?: {
    chat_id: string;
    title: string;
    section: string;
    output_doc: { id: string };
    processing_results: {
      recommended_title?: string;
      processed_text_length: number;
      file_type: string;
      processing_time: string;
    };
  };
}

export async function processScanAction(formData: FormData): Promise<ScanResult> {
  try {
    // Extract data from FormData
    const images = formData.getAll('images') as File[];
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const remarks = formData.get('remarks') as string;
    const section = formData.get('section') as string;

    // Validate that we have images
    if (!images || images.length === 0) {
      return {
        success: false,
        error: 'No images provided'
      };
    }

    // Get authentication token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('token')?.value;
    
    if (!authToken) {
      return {
        success: false,
        error: 'Authentication required. Please log in.'
      };
    }

    // Get backend URL from environment or use default
    const backendUrl = process.env.FOCUSNOTE_BACKEND_URL || 'http://localhost:4000';
    
    // Create FormData for backend request
    const backendFormData = new FormData();
    
    // Add images to the FormData
    for (const image of images) {
      backendFormData.append('images', image);
    }
    
    // Add metadata
    if (title && title.trim()) backendFormData.append('title', title.trim());
    if (category && category.trim()) backendFormData.append('category', category.trim());
    if (remarks && remarks.trim()) backendFormData.append('remarks', remarks.trim());
    if (section && section.trim()) backendFormData.append('section', section.trim());
    
    // Make request to FocusNote-backend process endpoint
    const response = await fetch(`${backendUrl}/process/scan`, {
      method: 'POST',
      body: backendFormData,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        // Don't set Content-Type, let the browser set it with boundary for multipart/form-data
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Backend request failed: ${response.status}`);
    }

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        error: result.error || 'Processing failed'
      };
    }

  } catch (error) {
    console.error('Error in processScanAction:', error);
    
    // Return a more specific error message
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Unable to connect to backend server. Please ensure the FocusNote-backend is running.'
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Download processed document
 */
export async function downloadDocumentAction(chatId: string): Promise<{
  success: boolean;
  error?: string;
  blob?: Blob;
  filename?: string;
}> {
  try {
    // Get authentication token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('token')?.value;
    
    if (!authToken) {
      return {
        success: false,
        error: 'Authentication required. Please log in.'
      };
    }

    // Get backend URL from environment or use default
    const backendUrl = process.env.FOCUSNOTE_BACKEND_URL || 'http://localhost:4000';
    
    // Make request to download endpoint
    const response = await fetch(`${backendUrl}/process/download/${chatId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }
    });

    if (!response.ok) {
      const errorResult = await response.json();
      throw new Error(errorResult.error || `Download failed: ${response.status}`);
    }

    // Get the file blob
    const blob = await response.blob();
    
    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers.get('content-disposition');
    let filename = `document_${chatId}.pdf`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    return {
      success: true,
      blob,
      filename
    };

  } catch (error) {
    console.error('Error downloading document:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed'
    };
  }
}

/**
 * Get processing history
 */
export async function getProcessingHistoryAction(): Promise<{
  success: boolean;
  error?: string;
  data?: Array<{
    id: string;
    title: string;
    section: string;
    created_at: string;
    input_files: number;
    output_files: number;
    processing_info: any;
  }>;
}> {
  try {
    // Get authentication token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('token')?.value;
    
    if (!authToken) {
      return {
        success: false,
        error: 'Authentication required. Please log in.'
      };
    }

    // Get backend URL from environment or use default
    const backendUrl = process.env.FOCUSNOTE_BACKEND_URL || 'http://localhost:4000';
    
    // Make request to history endpoint
    const response = await fetch(`${backendUrl}/process/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `History fetch failed: ${response.status}`);
    }

    return {
      success: true,
      data: result.data
    };

  } catch (error) {
    console.error('Error fetching processing history:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch history'
    };
  }
}