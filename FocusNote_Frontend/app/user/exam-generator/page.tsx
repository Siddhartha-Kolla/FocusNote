'use client';

import { useState } from 'react';
import { Download, FileText, Settings, Clock, Users, BookOpen, Zap, ChevronDown, AlertCircle } from 'lucide-react';
import ExamPreview from '@/components/ExamPreview';

// Types for exam configuration
interface ExamConfig {
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in minutes
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
}

interface Topic {
  id: string;
  name: string;
  selected: boolean;
}

export default function ExamGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedFile, setGeneratedFile] = useState<string | null>(null);
  
  const [config, setConfig] = useState<ExamConfig>({
    title: '',
    subject: '',
    difficulty: 'medium',
    duration: 120,
    totalQuestions: 20,
    questionTypes: {
      multipleChoice: 10,
      shortAnswer: 6,
      longAnswer: 3,
      calculation: 1
    },
    topics: [],
    instructions: 'Read all questions carefully. Show your work for calculation problems.',
    includeAnswerKey: true,
    format: 'pdf'
  });

  // Predefined subjects and their topics
  const subjectTopics: Record<string, Topic[]> = {
    'Mathematics': [
      { id: 'algebra', name: 'Algebra', selected: false },
      { id: 'calculus', name: 'Calculus', selected: false },
      { id: 'geometry', name: 'Geometry', selected: false },
      { id: 'statistics', name: 'Statistics', selected: false },
      { id: 'trigonometry', name: 'Trigonometry', selected: false }
    ],
    'Physics': [
      { id: 'mechanics', name: 'Mechanics', selected: false },
      { id: 'thermodynamics', name: 'Thermodynamics', selected: false },
      { id: 'electromagnetism', name: 'Electromagnetism', selected: false },
      { id: 'optics', name: 'Optics', selected: false },
      { id: 'quantum', name: 'Quantum Physics', selected: false }
    ],
    'Chemistry': [
      { id: 'organic', name: 'Organic Chemistry', selected: false },
      { id: 'inorganic', name: 'Inorganic Chemistry', selected: false },
      { id: 'physical', name: 'Physical Chemistry', selected: false },
      { id: 'analytical', name: 'Analytical Chemistry', selected: false },
      { id: 'biochemistry', name: 'Biochemistry', selected: false }
    ],
    'Biology': [
      { id: 'cell-biology', name: 'Cell Biology', selected: false },
      { id: 'genetics', name: 'Genetics', selected: false },
      { id: 'ecology', name: 'Ecology', selected: false },
      { id: 'evolution', name: 'Evolution', selected: false },
      { id: 'physiology', name: 'Physiology', selected: false }
    ]
  };

  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);

  const handleSubjectChange = (subject: string) => {
    setConfig(prev => ({ ...prev, subject, topics: [] }));
    setAvailableTopics(subjectTopics[subject] || []);
  };

  const handleTopicToggle = (topicId: string) => {
    setAvailableTopics(prev => 
      prev.map(topic => 
        topic.id === topicId 
          ? { ...topic, selected: !topic.selected }
          : topic
      )
    );
    
    const selectedTopics = availableTopics
      .filter(topic => topic.id === topicId ? !topic.selected : topic.selected)
      .map(topic => topic.name);
    
    setConfig(prev => ({ ...prev, topics: selectedTopics }));
  };

  const handleQuestionTypeChange = (type: keyof ExamConfig['questionTypes'], value: number) => {
    setConfig(prev => ({
      ...prev,
      questionTypes: {
        ...prev.questionTypes,
        [type]: Math.max(0, value)
      }
    }));
  };

  const getTotalQuestions = () => {
    return Object.values(config.questionTypes).reduce((sum, count) => sum + count, 0);
  };

  const handleGenerateExam = async () => {
    setIsGenerating(true);
    
    // Simulate exam generation
    setTimeout(() => {
      const filename = `${config.title || 'Custom_Exam'}_${new Date().getTime()}.${config.format}`;
      setGeneratedFile(filename);
      setIsGenerating(false);
    }, 3000);
  };

  const handleDownload = () => {
    // In a real implementation, this would trigger the actual file download
    console.log('Downloading exam:', generatedFile);
    alert(`Downloading ${generatedFile}...`);
  };

  const handlePreview = () => {
    // In a real implementation, this would open a preview modal or new tab
    console.log('Previewing exam:', generatedFile);
    alert(`Opening preview for ${generatedFile}...`);
  };

  const canGenerate = config.title && config.subject && config.topics.length > 0 && getTotalQuestions() > 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-3">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exam Generator</h1>
            <p className="text-gray-600">Create personalized test papers based on your study materials</p>
          </div>
        </div>
      </div>

      {/* Show ExamPreview if exam is generated, otherwise show configuration */}
      {generatedFile ? (
        <div className="space-y-6">
          <ExamPreview
            config={config}
            filename={generatedFile}
            onDownload={handleDownload}
            onPreview={handlePreview}
          />
          
          {/* Generate Another Button */}
          <div className="text-center">
            <button
              onClick={() => {
                setGeneratedFile(null);
                setConfig(prev => ({ ...prev, title: '', topics: [] }));
                setAvailableTopics([]);
              }}
              className="bg-gray-100 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Generate Another Exam
            </button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
          {/* Basic Configuration */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Exam Configuration
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Title
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Physics Midterm Exam"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={config.subject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={config.difficulty}
                  onChange={(e) => setConfig(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={config.duration}
                  onChange={(e) => setConfig(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  min="15"
                  max="300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Topics Selection */}
          {config.subject && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Topics to Include
              </h3>
              
              <div className="grid md:grid-cols-2 gap-3">
                {availableTopics.map(topic => (
                  <label key={topic.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={topic.selected}
                      onChange={() => handleTopicToggle(topic.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{topic.name}</span>
                  </label>
                ))}
              </div>
              
              {config.topics.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">Select at least one topic to continue</p>
              )}
            </div>
          )}

          {/* Question Types */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Question Distribution
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Multiple Choice</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuestionTypeChange('multipleChoice', config.questionTypes.multipleChoice - 1)}
                    className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{config.questionTypes.multipleChoice}</span>
                  <button
                    onClick={() => handleQuestionTypeChange('multipleChoice', config.questionTypes.multipleChoice + 1)}
                    className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Short Answer</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuestionTypeChange('shortAnswer', config.questionTypes.shortAnswer - 1)}
                    className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{config.questionTypes.shortAnswer}</span>
                  <button
                    onClick={() => handleQuestionTypeChange('shortAnswer', config.questionTypes.shortAnswer + 1)}
                    className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Long Answer</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuestionTypeChange('longAnswer', config.questionTypes.longAnswer - 1)}
                    className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{config.questionTypes.longAnswer}</span>
                  <button
                    onClick={() => handleQuestionTypeChange('longAnswer', config.questionTypes.longAnswer + 1)}
                    className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Calculation Problems</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuestionTypeChange('calculation', config.questionTypes.calculation - 1)}
                    className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{config.questionTypes.calculation}</span>
                  <button
                    onClick={() => handleQuestionTypeChange('calculation', config.questionTypes.calculation + 1)}
                    className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total Questions:</span>
                  <span className="font-semibold text-lg text-blue-600">{getTotalQuestions()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <ChevronDown className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              Advanced Options
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Instructions
                  </label>
                  <textarea
                    value={config.instructions}
                    onChange={(e) => setConfig(prev => ({ ...prev, instructions: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter instructions for students..."
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.includeAnswerKey}
                      onChange={(e) => setConfig(prev => ({ ...prev, includeAnswerKey: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Include Answer Key</span>
                  </label>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Format:</span>
                    <select
                      value={config.format}
                      onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as any }))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pdf">PDF</option>
                      <option value="docx">Word Document</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          {/* Generation Button */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Exam</h3>
            
            {/* Summary */}
            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Questions:</span>
                <span className="font-medium">{getTotalQuestions()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{config.duration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Difficulty:</span>
                <span className="font-medium capitalize">{config.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Topics:</span>
                <span className="font-medium">{config.topics.length}</span>
              </div>
            </div>
            
            <button
              onClick={handleGenerateExam}
              disabled={isGenerating || !canGenerate}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate Exam
                </>
              )}
            </button>
            
            {!canGenerate && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Complete the following to generate:</p>
                    <ul className="mt-1 space-y-1">
                      {!config.title && <li>• Enter exam title</li>}
                      {!config.subject && <li>• Select a subject</li>}
                      {config.topics.length === 0 && <li>• Choose at least one topic</li>}
                      {getTotalQuestions() === 0 && <li>• Add at least one question</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Include multiple topics for better coverage</li>
              <li>• Balance question types for variety</li>
              <li>• Consider exam duration when setting question count</li>
              <li>• Use answer key for self-assessment</li>
            </ul>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}