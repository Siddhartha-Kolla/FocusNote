import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Upload, Brain, FileText, CheckCircle } from "lucide-react";

interface LandingProps {
  onNavigate: (page: string) => void;
}

export function Landing({ onNavigate }: LandingProps) {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-6 text-4xl md:text-6xl tracking-tight">
            Turn Handwritten Notes Into{' '}
            <span className="text-primary">Smart Study Guides</span>
          </h1>
          <p className="mb-12 text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your handwritten notes and let our AI analyze them to create structured, 
            intelligent study rundowns that help you learn faster and prepare better for exams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => onNavigate('dashboard')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 py-6 text-lg"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Notes
            </Button>
            <Button 
              variant="outline"
              onClick={() => onNavigate('demo')}
              className="border-2 rounded-xl px-8 py-6 text-lg"
            >
              See How It Works
            </Button>
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="relative mt-20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="w-64 h-64 bg-secondary/10 rounded-full blur-2xl -ml-32 mt-16"></div>
          </div>
          
          {/* Feature Preview Cards */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2">Smart OCR</h3>
              <p className="text-muted-foreground">
                Advanced optical character recognition that accurately reads your handwriting
              </p>
            </Card>
            
            <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2">AI Analysis</h3>
              <p className="text-muted-foreground">
                Intelligent analysis that identifies key concepts and creates structured summaries
              </p>
            </Card>
            
            <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2">Study Guides</h3>
              <p className="text-muted-foreground">
                Organized study materials tailored to your learning style and exam preparation
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/30 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-3xl md:text-4xl">Why Students Love NoteGenius</h2>
            <p className="text-xl text-muted-foreground">
              Transform your study routine with intelligent note processing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Save Time", desc: "No more rewriting notes manually" },
              { title: "Better Retention", desc: "AI-structured content for optimal learning" },
              { title: "Exam Ready", desc: "Targeted summaries for exam preparation" },
              { title: "Always Accessible", desc: "Digital notes available anywhere, anytime" }
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h4 className="mb-2">{benefit.title}</h4>
                <p className="text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}