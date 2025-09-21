"use client";

import { Clock, Target, Zap } from "lucide-react";

interface WhyChooseCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function WhyChooseCard({ icon, title, description }: WhyChooseCardProps) {
  return (
    <div className="text-center p-6">
      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-blue-50 rounded-full">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

export function WhyChoose() {
  const benefits = [
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: "Time-Saving",
      description: "Process notes 10x faster than manual methods"
    },
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "Exam-Focused",
      description: "Content optimized for test preparation"
    },
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: "Instant Results",
      description: "Get your study guide in seconds"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose FocusNote?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built for students who want to study smarter, not harder
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <WhyChooseCard
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