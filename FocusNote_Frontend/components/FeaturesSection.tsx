"use client";

import { Upload, Brain, BookOpen } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="text-center p-6">
      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-blue-50 rounded-full">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: <Upload className="w-8 h-8 text-blue-600" />,
      title: "Smart OCR",
      description: "Advanced optical character recognition that accurately reads your handwriting"
    },
    {
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      title: "AI Analysis",
      description: "Intelligent analysis that identifies key concepts and creates structured summaries"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-blue-600" />,
      title: "Study Guides",
      description: "Organized study materials tailored to your learning style and exam preparation"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}