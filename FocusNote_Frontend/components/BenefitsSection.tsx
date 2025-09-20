"use client";

import { Clock, Brain, Target, Smartphone } from "lucide-react";

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <div className="text-center p-6">
      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-blue-50 rounded-full">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export function BenefitsSection() {
  const benefits = [
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: "Save Time",
      description: "No more rewriting notes manually"
    },
    {
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      title: "Better Retention",
      description: "AI-structured content for optimal learning"
    },
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "Exam Ready",
      description: "Targeted summaries for exam preparation"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-blue-600" />,
      title: "Always Accessible",
      description: "Digital notes available anywhere, anytime"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Students Love FocusNote
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your study routine with intelligent note processing
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}