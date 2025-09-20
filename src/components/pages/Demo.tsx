import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Upload, ScanLine, Brain, FileText, ArrowRight, CheckCircle } from "lucide-react";

interface DemoProps {
  onNavigate: (page: string) => void;
}

export function Demo({ onNavigate }: DemoProps) {
  const steps = [
    {
      number: "01",
      title: "Upload Your Notes",
      description: "Take a photo or scan your handwritten notes. Our system supports various formats including photos, PDFs, and scanned documents.",
      icon: Upload,
      details: ["Multiple file formats", "High-quality image processing", "Batch upload support"],
      color: "bg-primary/10 text-primary"
    },
    {
      number: "02", 
      title: "AI Analysis",
      description: "Our advanced AI reads your handwriting, identifies key concepts, and understands the structure and context of your notes.",
      icon: Brain,
      details: ["OCR technology", "Content analysis", "Concept identification"],
      color: "bg-secondary/10 text-secondary"
    },
    {
      number: "03",
      title: "Get Your Study Guide",
      description: "Receive a structured, intelligent study rundown with summaries, key points, and personalized recommendations for exam prep.",
      icon: FileText,
      details: ["Structured summaries", "Key point extraction", "Exam preparation tips"],
      color: "bg-primary/10 text-primary"
    }
  ];

  return (
    <div className="w-full py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-4 px-4 py-2 rounded-full">
            How It Works
          </Badge>
          <h1 className="mb-6 text-4xl md:text-5xl">
            From Notes to <span className="text-primary">Smart Study Guides</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how our three-step process transforms your handwritten notes into 
            intelligent study materials in just seconds.
          </p>
        </div>

        {/* Step-by-Step Process */}
        <div className="space-y-16 mb-20">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <Badge variant="outline" className="text-2xl px-4 py-2 rounded-xl border-2">
                    {step.number}
                  </Badge>
                  <h2 className="text-3xl">{step.title}</h2>
                </div>
                
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {step.description}
                </p>
                
                <ul className="space-y-3 mb-8">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-secondary mr-3" />
                      <span className="text-muted-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex-1">
                <Card className="p-12 rounded-3xl shadow-lg border-0 bg-gradient-to-br from-white to-muted/20">
                  <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 mx-auto ${step.color}`}>
                    <step.icon className="h-12 w-12" />
                  </div>
                  <div className="text-center">
                    <h3 className="mb-3">Step {step.number}</h3>
                    <p className="text-muted-foreground">
                      {step.title}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Video Placeholder */}
        <div className="bg-muted/20 rounded-3xl p-12 text-center mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-6 text-3xl">See It In Action</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Watch how NoteGenius transforms handwritten physics notes into a comprehensive study guide
            </p>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="aspect-video bg-muted/30 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ScanLine className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Interactive Demo Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Process Flow */}
        <div className="text-center mb-20">
          <h2 className="mb-12 text-3xl">The Complete Process</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <span>Upload</span>
            </div>
            
            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-secondary" />
              </div>
              <span>Analyze</span>
            </div>
            
            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <span>Study</span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/5 rounded-3xl p-12 text-center">
          <h2 className="mb-4 text-3xl">Ready to Try It Yourself?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your first set of notes and experience the power of AI-enhanced studying
          </p>
          <Button 
            onClick={() => onNavigate('dashboard')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 py-6 text-lg"
          >
            <Upload className="mr-2 h-5 w-5" />
            Start Now - It's Free
          </Button>
        </div>
      </div>
    </div>
  );
}