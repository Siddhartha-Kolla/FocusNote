import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScanText, Brain, BookOpen, Clock, Target, Zap } from "lucide-react";

export function Features() {
  const mainFeatures = [
    {
      icon: ScanText,
      title: "Advanced OCR Technology",
      description: "Our state-of-the-art optical character recognition accurately reads handwritten text, including cursive writing and mathematical equations.",
      highlights: ["99.5% accuracy rate", "Supports multiple languages", "Handles various handwriting styles"],
      color: "bg-primary/10 text-primary"
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Intelligent algorithms analyze your notes to identify key concepts, main ideas, and relationships between topics for better understanding.",
      highlights: ["Concept mapping", "Topic prioritization", "Content summarization"],
      color: "bg-secondary/10 text-secondary"
    },
    {
      icon: BookOpen,
      title: "Smart Study Rundowns",
      description: "Automatically generated study guides with structured summaries, key points, and practice questions tailored to your learning needs.",
      highlights: ["Personalized content", "Exam-focused summaries", "Interactive elements"],
      color: "bg-primary/10 text-primary"
    }
  ];

  const additionalFeatures = [
    { icon: Clock, title: "Time-Saving", desc: "Process notes 10x faster than manual methods" },
    { icon: Target, title: "Exam-Focused", desc: "Content optimized for test preparation" },
    { icon: Zap, title: "Instant Results", desc: "Get your study guide in seconds" }
  ];

  return (
    <div className="w-full py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-4 px-4 py-2 rounded-full">
            Features
          </Badge>
          <h1 className="mb-6 text-4xl md:text-5xl">
            Powerful Tools for <span className="text-primary">Smart Learning</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how our advanced technology transforms your handwritten notes into 
            intelligent study materials that adapt to your learning style.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <Card key={index} className="p-8 shadow-lg border-0 rounded-2xl bg-white hover:shadow-xl transition-shadow">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                <feature.icon className="h-8 w-8" />
              </div>
              
              <h3 className="mb-4">{feature.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              <ul className="space-y-2">
                {feature.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    {highlight}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="bg-muted/30 rounded-3xl p-12">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl">Why Choose FocusNote?</h2>
            <p className="text-muted-foreground text-lg">
              Built for students who want to study smarter, not harder
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mt-20">
          <h2 className="text-center mb-12 text-3xl">Traditional vs. Smart Note Processing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 rounded-2xl border border-destructive/20">
              <h3 className="mb-4 text-destructive">Traditional Method</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Manual note rewriting</li>
                <li>• Time-consuming organization</li>
                <li>• Risk of losing physical notes</li>
                <li>• Limited searchability</li>
                <li>• Static content</li>
              </ul>
            </Card>
            
            <Card className="p-8 rounded-2xl border border-secondary/20 bg-secondary/5">
              <h3 className="mb-4 text-secondary">FocusNote Method</h3>
              <ul className="space-y-3">
                <li>• Instant digital conversion</li>
                <li>• AI-powered organization</li>
                <li>• Cloud-based storage</li>
                <li>• Full-text search</li>
                <li>• Interactive study guides</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}