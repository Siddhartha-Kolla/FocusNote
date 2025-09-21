"use client";

import { Button } from "@/components/ui/button";
import { Upload, X, FileImage, Download, ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { 
  UploadedFile, 
  processFileList, 
  formatFileSize 
} from "@/lib/fileUtils";
import { processScanAction, downloadDocumentAction } from "@/lib/actions/scan";
import { 
  Category, 
  searchCategories, 
  formatCategoryForDisplay, 
  fetchUserCategories 
} from "@/lib/categoryUtils";

export default function ScanPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [remarks, setRemarks] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<{
    chatId: string;
    title: string;
    recommendedTitle?: string;
  } | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await fetchUserCategories();
        setAvailableCategories(categories);
        setFilteredCategories(categories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Handle category search and filtering
  useEffect(() => {
    const filtered = searchCategories(categorySearch, availableCategories);
    setFilteredCategories(filtered);
  }, [categorySearch, availableCategories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      const newFiles = await processFileList(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing some files. Please try again.');
    }

    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (!files) return;

    try {
      const newFiles = await processFileList(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error('Error processing dropped files:', error);
      alert('Error processing some files. Please try again.');
    }
  };

  const handleCategorySelect = (selectedCategory: Category) => {
    if (selectedCategory.id === 'new') {
      // User selected "Create new category"
      setCategory(selectedCategory.name);
      setCategorySearch(selectedCategory.name);
    } else {
      // User selected existing category
      setCategory(selectedCategory.name);
      setCategorySearch(selectedCategory.name);
    }
    setShowCategoryDropdown(false);
  };

  const handleCategoryInputChange = (value: string) => {
    setCategorySearch(value);
    setCategory(value);
    setShowCategoryDropdown(true);
  };

  const handleSend = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one image before sending.");
      return;
    }

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      
      // Add all files to FormData
      uploadedFiles.forEach((uploadedFile) => {
        formData.append('images', uploadedFile.file);
      });
      
      // Add metadata
      if (title.trim()) formData.append('title', title.trim());
      if (category.trim()) formData.append('category', category.trim());
      if (remarks.trim()) formData.append('remarks', remarks.trim());

      const result = await processScanAction(formData);
      
      if (result.success && result.data) {
        // Store processing result
        setProcessingResult({
          chatId: result.data.chat_id,
          title: result.data.title,
          recommendedTitle: result.data.processing_results.recommended_title
        });
        
        // Show success message
        const message = result.data.processing_results.recommended_title 
          ? `Document processed successfully! AI suggested title: "${result.data.processing_results.recommended_title}"`
          : 'Document processed successfully!';
        
        alert(message);
        
      } else {
        throw new Error(result.error || 'Failed to process images');
      }
      
    } catch (error) {
      console.error('Error processing images:', error);
      alert(`Failed to process images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!processingResult) {
      alert('No document available for download');
      return;
    }

    try {
      const result = await downloadDocumentAction(processingResult.chatId);
      
      if (result.success && result.blob) {
        // Create download URL from blob
        const url = window.URL.createObjectURL(result.blob);
        
        // Auto-download the file
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename || `${processingResult.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error(result.error || 'Failed to download document');
      }
      
    } catch (error) {
      console.error('Error downloading document:', error);
      alert(`Failed to download document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Scan Documents</h1>
          
          {/* Title Input */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Document Title (Optional)
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Leave empty for AI-generated title..."
            />
            <p className="text-xs text-gray-500 mt-1">
              If no title is provided, our AI will automatically generate one based on the document content.
            </p>
          </div>
          
          {/* Category Input with Autocomplete */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="relative" ref={categoryDropdownRef}>
              <div className="relative">
                <input
                  id="category"
                  type="text"
                  value={categorySearch}
                  onChange={(e) => handleCategoryInputChange(e.target.value)}
                  onFocus={() => setShowCategoryDropdown(true)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Select or create a category..."
                />
                <ChevronDown 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                />
              </div>
              
              {/* Category Dropdown */}
              {showCategoryDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                        onClick={() => handleCategorySelect(cat)}
                      >
                        <span className={cat.id === 'new' ? 'text-blue-600 font-medium' : 'text-gray-900'}>
                          {formatCategoryForDisplay(cat)}
                        </span>
                        {category === cat.name && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      No categories found
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Start typing to search existing categories or create a new one.
            </p>
          </div>
          
          {/* Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Upload Images
            </label>
            
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, JPEG up to 10MB each
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Uploaded Images ({uploadedFiles.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {uploadedFiles.map((uploadedFile) => (
                  <div key={uploadedFile.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={uploadedFile.preview}
                        alt={uploadedFile.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeFile(uploadedFile.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {uploadedFile.file.name} ({formatFileSize(uploadedFile.file.size)})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remarks Field */}
          <div className="mb-6">
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              id="remarks"
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any additional notes or instructions for processing..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSend}
              disabled={uploadedFiles.length === 0 || isProcessing}
              className="flex-1 sm:flex-none"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FileImage className="h-4 w-4 mr-2" />
                  Send for Processing
                </>
              )}
            </Button>

            {processingResult && (
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Document
              </Button>
            )}

            <Button
              onClick={() => {
                setUploadedFiles([]);
                setTitle("");
                setCategory("");
                setCategorySearch("");
                setRemarks("");
                setDownloadUrl(null);
              }}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Clear All
            </Button>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">How it works:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Upload multiple images of your documents</li>
              <li>Optionally add a title (or let AI generate one)</li>
              <li>Select or create a category for organization</li>
              <li>Add any remarks or special instructions</li>
              <li>Click "Send for Processing" to generate a PDF</li>
              <li>Download the processed PDF automatically</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}