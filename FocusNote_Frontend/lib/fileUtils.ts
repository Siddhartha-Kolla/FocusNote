export interface UploadedFile {
  file: File;
  preview: string;
  id: string;
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Please upload ${ACCEPTED_IMAGE_TYPES.join(', ')} files only.`
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
    };
  }

  return { isValid: true };
};

export const processFileList = (files: FileList | File[]): Promise<UploadedFile[]> => {
  return Promise.all(
    Array.from(files)
      .filter(file => {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          console.warn(`Skipping file ${file.name}: ${validation.error}`);
          return false;
        }
        return true;
      })
      .map((file) => {
        return new Promise<UploadedFile>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              file,
              preview: e.target?.result as string,
              id: Math.random().toString(36).substr(2, 9)
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
  );
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const createFormData = (files: UploadedFile[], remarks: string): FormData => {
  const formData = new FormData();
  
  files.forEach((uploadedFile, index) => {
    formData.append('images', uploadedFile.file);
  });
  
  formData.append('remarks', remarks);
  formData.append('timestamp', new Date().toISOString());
  
  return formData;
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};