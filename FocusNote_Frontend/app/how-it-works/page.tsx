import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Upload, Brain, FileText, ArrowRight, Play } from "lucide-react";

// Reusable component for process steps since there are 3 of them
interface ProcessStepProps {
  stepNumber: string;
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  isCenter?: boolean;
}

function ProcessStep({ stepNumber, title, description, features, icon, isCenter = false }: ProcessStepProps) {
  return (
    <div className={`${isCenter ? 'lg:col-span-2 lg:mx-auto lg:max-w-md' : ''}`}>
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="text-2xl font-bold text-gray-400 mb-4">{stepNumber}</div>
          <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <div className="text-center mt-2">
            <div className="text-sm font-medium text-gray-600">Step {stepNumber}</div>
            <div className="text-sm text-gray-500">{title}</div>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-700">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  const processSteps = [
    {
      stepNumber: "01",
      title: "Upload Your Notes",
      description: "Take a photo or scan your handwritten notes. Our system supports various formats including photos, PDFs, and scanned documents.",
      features: [
        "Multiple file formats",
        "High-quality image processing", 
        "Batch upload support"
      ],
      icon: <Upload className="w-8 h-8 text-blue-600" />
    },
    {
      stepNumber: "02", 
      title: "AI Analysis",
      description: "Our advanced AI reads your handwriting, identifies key concepts, and understands the structure and content of your notes.",
      features: [
        "OCR technology",
        "Content analysis",
        "Concept identification"
      ],
      icon: <Brain className="w-8 h-8 text-blue-600" />
    },
    {
      stepNumber: "03",
      title: "Get Your Study Guide", 
      description: "Receive a structured, intelligent study rundown with summaries, key points, and personalized recommendations for exam preparation.",
      features: [
        "Structured summaries",
        "Key point extraction", 
        "Exam preparation tips"
      ],
      icon: <FileText className="w-8 h-8 text-blue-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* How It Works Badge */}
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-6">
              How It Works
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              From Notes to{" "}
              <span className="text-blue-600">Smart Study Guides</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              See how our three-step process transforms your handwritten notes into intelligent
              study materials in just seconds.
            </p>
          </div>
        </section>

        {/* Process Steps Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <ProcessStep {...processSteps[0]} />
              <ProcessStep {...processSteps[1]} isCenter />
              <ProcessStep {...processSteps[2]} />
            </div>
          </div>
        </section>

        {/* See It In Action Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                See It In Action
              </h2>
              <p className="text-lg text-gray-600">
                Watch how FocusNote transforms handwritten physics notes into a comprehensive study guide.
              </p>
            </div>

            {/* Video/Demo Placeholder */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <p className="text-gray-600 font-medium">Interactive Demo Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Complete Process Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                The Complete Process
              </h2>
              
              {/* Process Flow */}
              <div className="flex items-center justify-center gap-8 mb-12">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Upload</span>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400" />
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Analyze</span>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400" />
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Study</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Try It Yourself?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Upload your first set of notes and experience the power of AI-enhanced studying.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-md">
              <Upload className="w-5 h-5 mr-2" />
              Start Now - It's Free
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}