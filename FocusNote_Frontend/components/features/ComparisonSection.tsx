"use client";

import { X, Check } from "lucide-react";

interface ComparisonItemProps {
  text: string;
  isTraditional: boolean;
}

function ComparisonItem({ text, isTraditional }: ComparisonItemProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      {isTraditional ? (
        <X className="w-5 h-5 text-red-500 flex-shrink-0" />
      ) : (
        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
      )}
      <span className={`text-sm ${isTraditional ? 'text-gray-600' : 'text-gray-900'}`}>
        {text}
      </span>
    </div>
  );
}

export function ComparisonSection() {
  const traditionalItems = [
    "Manual note rewriting",
    "Time-consuming organization",
    "Risk of losing physical notes",
    "Limited searchability",
    "Static content"
  ];

  const focusNoteItems = [
    "Instant digital conversion",
    "AI-powered organization",
    "Cloud-based storage",
    "Full-text search",
    "Interactive study guides"
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Traditional vs. Smart Note Processing
          </h2>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Traditional Method */}
          <div className="bg-white rounded-lg p-8 border border-gray-200">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-red-600 mb-2">Traditional Method</h3>
            </div>
            <div className="space-y-1">
              {traditionalItems.map((item, index) => (
                <ComparisonItem key={index} text={item} isTraditional={true} />
              ))}
            </div>
          </div>

          {/* FocusNote Method */}
          <div className="bg-white rounded-lg p-8 border border-blue-200 relative">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-green-600 mb-2">FocusNote Method</h3>
            </div>
            <div className="space-y-1">
              {focusNoteItems.map((item, index) => (
                <ComparisonItem key={index} text={item} isTraditional={false} />
              ))}
            </div>
            {/* Highlight border */}
            <div className="absolute inset-0 border-2 border-blue-200 rounded-lg pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
}