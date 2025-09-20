import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Mail, MessageCircle, HelpCircle, Users, Target, Lightbulb } from "lucide-react";

export function About() {
  const team = [
    { name: "Sarah Chen", role: "AI Research Lead", expertise: "Machine Learning & OCR" },
    { name: "Marcus Rodriguez", role: "Product Designer", expertise: "UX/UI Design" },
    { name: "Dr. Emily Watson", role: "Education Specialist", expertise: "Learning Sciences" },
    { name: "James Park", role: "Software Engineer", expertise: "Full-Stack Development" }
  ];

  const values = [
    {
      icon: Target,
      title: "Student-Focused",
      description: "Every feature is designed with student success in mind, making learning more efficient and effective."
    },
    {
      icon: Lightbulb,
      title: "Innovation-Driven",
      description: "We leverage cutting-edge AI technology to solve real educational challenges and improve study habits."
    },
    {
      icon: Users,
      title: "Accessible Learning",
      description: "Making high-quality study tools available to all students, regardless of their background or resources."
    }
  ];

  return (
    <div className="w-full py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-4 px-4 py-2 rounded-full">
            About Us
          </Badge>
          <h1 className="mb-6 text-4xl md:text-5xl">
            Empowering Students with <span className="text-primary">Smart Technology</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to revolutionize how students learn by transforming traditional 
            note-taking into intelligent, AI-powered study experiences.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-primary/5 rounded-3xl p-12 mb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mb-6 text-3xl">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              At NoteGenius, we believe that every student deserves access to tools that make learning 
              more efficient and effective. Our AI-powered platform transforms the age-old practice 
              of handwritten note-taking into a smart, digital experience that adapts to each student's 
              unique learning style and academic goals.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="mb-2">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="mb-6 text-3xl">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                NoteGenius was born from a simple observation: students spend countless hours 
                rewriting and organizing their handwritten notes, time that could be better 
                spent actually learning and understanding the material.
              </p>
              <p>
                Our founding team, composed of educators, technologists, and former students, 
                came together with a shared vision of using artificial intelligence to bridge 
                the gap between traditional note-taking and modern digital learning tools.
              </p>
              <p>
                Today, we're proud to serve thousands of students worldwide, helping them 
                transform their handwritten notes into intelligent study guides that adapt 
                to their learning needs and accelerate their academic success.
              </p>
            </div>
          </div>
          
          <Card className="p-8 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-white to-muted/20">
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl mb-2">10,000+</div>
                <div className="text-sm text-muted-foreground">Students Helped</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">50,000+</div>
                <div className="text-sm text-muted-foreground">Notes Processed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">99.5%</div>
                <div className="text-sm text-muted-foreground">OCR Accuracy</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Team */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground">
              The passionate individuals behind NoteGenius
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="p-6 rounded-2xl border-0 shadow-sm text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4"></div>
                <h4 className="mb-1">{member.name}</h4>
                <p className="text-sm text-primary mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.expertise}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-muted/30 rounded-3xl p-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl">Get In Touch</h2>
              <p className="text-lg text-muted-foreground">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 rounded-2xl border-0 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h4 className="mb-2">Email Support</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Get help with your account or technical issues
                </p>
                <Button variant="outline" className="rounded-xl">
                  support@notegenius.com
                </Button>
              </Card>
              
              <Card className="p-6 rounded-2xl border-0 text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-secondary" />
                </div>
                <h4 className="mb-2">Live Chat</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with our team for immediate assistance
                </p>
                <Button className="bg-secondary hover:bg-secondary/90 text-white rounded-xl">
                  Start Chat
                </Button>
              </Card>
              
              <Card className="p-6 rounded-2xl border-0 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <h4 className="mb-2">Help Center</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse our knowledge base and tutorials
                </p>
                <Button variant="outline" className="rounded-xl">
                  Visit Help Center
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}