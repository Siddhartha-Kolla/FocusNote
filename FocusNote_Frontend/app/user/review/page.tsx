'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, FileText, Image, Download, User, Bot, AlertCircle } from 'lucide-react';
import { getLatestReview, sendChatMessage, createNewChat } from '@/lib/actions/review';

// Chat message data structure
interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  metadata?: {
    fileAttachment?: {
      name: string;
      type: string;
      size: number;
    };
  };
}

// Document review data structure
interface DocumentReview {
  id: string;
  inputFiles: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  outputFile: {
    name: string;
    type: string;
    size: number;
    url: string;
    content?: string; // LaTeX content preview
  };
  processingInfo: {
    contextAnalysis: string;
    processedAt: string;
    processingTime: number;
  };
}

export default function ReviewPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documentReview, setDocumentReview] = useState<DocumentReview | null>(null);
  const [chatId, setChatId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load real data from API
  useEffect(() => {
    loadReviewData();
  }, []);

  const loadReviewData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await getLatestReview();
      
      if (!result.success) {
        // Try to create a new chat if no existing chat found
        if (result.error?.includes('No chats found')) {
          const newChatResult = await createNewChat('Document Review Session');
          if (newChatResult.success) {
            setChatId(newChatResult.data.id);
            setMessages([{
              id: 'welcome-1',
              type: 'ai',
              content: 'Welcome! I\'m here to help you with questions about your processed documents. Feel free to ask me anything about the content, request explanations, or discuss improvements.',
              timestamp: new Date().toISOString()
            }]);
          } else {
            throw new Error(newChatResult.error || 'Failed to create new chat');
          }
        } else {
          throw new Error(result.error || 'Failed to load review data');
        }
      } else {
        // Set chat data from existing chat
        setChatId(result.data.chat.id);
        setMessages(result.data.chat.messages || []);
      }
      
      // Create document review data (mock for now since we don't have file storage yet)
      const documentReview: DocumentReview = {
        id: chatId || 'new-doc',
        inputFiles: [
          {
            name: 'uploaded_document.jpg',
            type: 'image/jpeg',
            size: 245760,
            url: '#'
          }
        ],
        outputFile: {
          name: 'processed_document.tex',
          type: 'text/plain',
          size: 4096,
          url: '#',
          content: '\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amsmath,amssymb}...'
        },
        processingInfo: {
          contextAnalysis: 'Academic document with mathematical content successfully processed.',
          processedAt: new Date().toISOString(),
          processingTime: 8.5
        }
      };
      
      setDocumentReview(documentReview);
      
    } catch (error) {
      console.error('Error loading review data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load document review data');
      
      // Fallback to basic setup
      setDocumentReview({
        id: 'fallback',
        inputFiles: [{
          name: 'example_document.jpg',
          type: 'image/jpeg',
          size: 245760,
          url: '#'
        }],
        outputFile: {
          name: 'processed_document.tex',
          type: 'text/plain',
          size: 4096,
          url: '#',
          content: '\\documentclass{article}...'
        },
        processingInfo: {
          contextAnalysis: 'Document processing example',
          processedAt: new Date().toISOString(),
          processingTime: 8.5
        }
      });
      
      setMessages([{
        id: 'fallback-1',
        type: 'ai',
        content: 'Welcome! I\'m here to help you with questions about your processed documents. Feel free to ask me anything!',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading || !chatId) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage('');
    setIsLoading(true);

    try {
      const result = await sendChatMessage(chatId, currentMessage);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get AI response');
      }

      // Update messages with the complete chat history
      setMessages(result.data.messages || []);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add fallback AI response on error
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        type: 'ai',
        content: 'I\'m sorry, I\'m having trouble responding right now. Please try again in a moment or rephrase your question.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!documentReview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document review...</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800">Connection Issue</h3>
              <p className="text-yellow-700 text-sm mt-1">{error}</p>
              <button
                onClick={loadReviewData}
                className="mt-2 text-yellow-800 underline text-sm hover:text-yellow-900"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Review</h1>
        <p className="text-gray-600">Review your processed documents and chat about the content</p>
      </div>

      {/* Document Files Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Processed Files</h2>
        
        {/* Processing Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">Processing Summary</h3>
          <p className="text-blue-700 text-sm mb-2">{documentReview.processingInfo.contextAnalysis}</p>
          <div className="flex items-center gap-4 text-xs text-blue-600">
            <span>Processed: {formatTimestamp(documentReview.processingInfo.processedAt)}</span>
            <span>Duration: {documentReview.processingInfo.processingTime}s</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Files */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Input Files ({documentReview.inputFiles.length})
            </h3>
            <div className="space-y-2">
              {documentReview.inputFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <Image className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button 
                    className="text-blue-600 hover:text-blue-700 p-1"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Output File */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Output File
            </h3>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{documentReview.outputFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(documentReview.outputFile.size)}</p>
                  </div>
                </div>
                <button 
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                  onClick={() => window.open(documentReview.outputFile.url, '_blank')}
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
              
              {/* LaTeX Preview */}
              {documentReview.outputFile.content && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">LaTeX Preview:</p>
                  <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                    {documentReview.outputFile.content.substring(0, 200)}...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Chat About Your Document</h2>
          <p className="text-sm text-gray-600">Ask questions about the processed content, request modifications, or get explanations</p>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask questions about your document..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Try asking: "Explain the gravitational force formula" or "Can you clarify the third problem?"
          </p>
        </div>
      </div>
    </div>
  );
}