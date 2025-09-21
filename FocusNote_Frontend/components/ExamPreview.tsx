'use client';

import { FileText, Download, Eye, Clock, Users, BookOpen, CheckCircle } from 'lucide-react';

interface ExamPreviewProps {
  config: {
    title: string;
    subject: string;
    difficulty: 'easy' | 'medium' | 'hard';
    duration: number;
    totalQuestions: number;
    questionTypes: {
      multipleChoice: number;
      shortAnswer: number;
      longAnswer: number;
      calculation: number;
    };
    topics: string[];
    instructions: string;
    includeAnswerKey: boolean;
    format: 'pdf' | 'docx';
  };
  filename: string;
  onDownload: () => void;
  onPreview?: () => void;
}

export default function ExamPreview({ config, filename, onDownload, onPreview }: ExamPreviewProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalQuestions = () => {
    return Object.values(config.questionTypes).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-3">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{config.title}</h3>
          <p className="text-gray-600">{config.subject} • {filename}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(config.difficulty)}`}>
              {config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1)}
            </span>
            <span className="text-xs text-gray-500">
              {config.format.toUpperCase()} Format
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-green-600">Generated</span>
        </div>
      </div>

      {/* Exam Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">Questions</span>
          </div>
          <p className="text-lg font-bold text-blue-900">{getTotalQuestions()}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-600">Duration</span>
          </div>
          <p className="text-lg font-bold text-green-900">{config.duration}m</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-600">Topics</span>
          </div>
          <p className="text-lg font-bold text-purple-900">{config.topics.length}</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <FileText className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-600">Answer Key</span>
          </div>
          <p className="text-lg font-bold text-orange-900">{config.includeAnswerKey ? 'Yes' : 'No'}</p>
        </div>
      </div>

      {/* Question Breakdown */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Question Distribution</h4>
        <div className="space-y-2">
          {config.questionTypes.multipleChoice > 0 && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Multiple Choice</span>
              <span className="text-sm font-medium text-gray-900">{config.questionTypes.multipleChoice}</span>
            </div>
          )}
          {config.questionTypes.shortAnswer > 0 && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Short Answer</span>
              <span className="text-sm font-medium text-gray-900">{config.questionTypes.shortAnswer}</span>
            </div>
          )}
          {config.questionTypes.longAnswer > 0 && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Long Answer</span>
              <span className="text-sm font-medium text-gray-900">{config.questionTypes.longAnswer}</span>
            </div>
          )}
          {config.questionTypes.calculation > 0 && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Calculation Problems</span>
              <span className="text-sm font-medium text-gray-900">{config.questionTypes.calculation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Topics Covered */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Topics Covered</h4>
        <div className="flex flex-wrap gap-2">
          {config.topics.map((topic, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Instructions Preview */}
      {config.instructions && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg italic">
            "{config.instructions}"
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        {onPreview && (
          <button
            onClick={onPreview}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        )}
        <button
          onClick={onDownload}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 flex items-center justify-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" />
          Download Exam
        </button>
      </div>
    </div>
  );
}