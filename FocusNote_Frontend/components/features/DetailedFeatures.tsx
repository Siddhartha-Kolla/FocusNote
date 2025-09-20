"use client";

import { ScanText, Brain, BookOpen } from "lucide-react";

interface DetailedFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

function DetailedFeatureCard({ icon, title, description, features }: DetailedFeatureCardProps) {
  return (
    <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Icon */}
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
        {icon}
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      
      {/* Description */}
      <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
      
      {/* Feature List */}
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-700">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3 flex-shrink-0"></div>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DetailedFeatures() {
  const features = [
    {
      icon: <ScanText className="w-6 h-6 text-blue-600" />,
      title: "Advanced OCR Technology",
      description: "Our state-of-the-art optical character recognition accurately reads handwritten text, including cursive writing and mathematical equations.",
      features: [
        "99.5% accuracy rate",
        "Supports multiple languages",
        "Handles various handwriting styles"
      ]
    },
    {
      icon: <Brain className="w-6 h-6 text-blue-600" />,
      title: "AI-Powered Analysis",
      description: "Intelligent algorithms analyze your notes to identify key concepts, main ideas, and relationships between topics for better understanding.",
      features: [
        "Concept mapping",
        "Topic prioritization",
        "Content summarization"
      ]
    },
    {
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      title: "Smart Study Rundowns",
      description: "Automatically generated study guides with structured summaries, key points, and practice questions tailored to your learning needs.",
      features: [
        "Personalized content",
        "Exam-focused summaries",
        "Interactive elements"
      ]
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <DetailedFeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              features={feature.features}
            />
          ))}
        </div>
      </div>
    </section>
  );
}