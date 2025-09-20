import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { 
  Upload, 
  FileText, 
  Clock, 
  BookOpen, 
  Brain, 
  MoreHorizontal,
  Search,
  Filter,
  Plus
} from "lucide-react";

export function Dashboard() {
  const recentNotes = [
    {
      id: 1,
      title: "Physics - Quantum Mechanics",
      subject: "Physics",
      uploadDate: "2 hours ago",
      status: "completed",
      pages: 8,
      keyTopics: ["Wave Functions", "Uncertainty Principle", "Schrödinger Equation"],
      summary: "Comprehensive notes covering the fundamentals of quantum mechanics including wave-particle duality..."
    },
    {
      id: 2,
      title: "Calculus - Integration Techniques",
      subject: "Mathematics",
      uploadDate: "1 day ago", 
      status: "completed",
      pages: 12,
      keyTopics: ["Substitution", "Integration by Parts", "Partial Fractions"],
      summary: "Detailed methods for solving complex integrals with step-by-step examples..."
    },
    {
      id: 3,
      title: "Chemistry - Organic Reactions",
      subject: "Chemistry",
      uploadDate: "3 days ago",
      status: "processing",
      pages: 6,
      keyTopics: ["Mechanism Analysis", "Stereochemistry"],
      summary: "Processing your organic chemistry reaction mechanisms..."
    },
    {
      id: 4,
      title: "History - World War II",
      subject: "History",
      uploadDate: "1 week ago",
      status: "completed",
      pages: 15,
      keyTopics: ["Timeline", "Key Battles", "Political Impact"],
      summary: "Comprehensive overview of WWII events, causes, and consequences..."
    }
  ];

  const stats = [
    { label: "Notes Processed", value: "24", icon: FileText },
    { label: "Study Hours Saved", value: "48", icon: Clock },
    { label: "Study Guides Created", value: "18", icon: BookOpen },
    { label: "Key Concepts Identified", value: "312", icon: Brain }
  ];

  return (
    <div className="w-full py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-6">
            <Card className="p-6 rounded-2xl border-0 shadow-sm">
              <h3 className="mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Notes
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl">
                  <Search className="mr-2 h-4 w-4" />
                  Search Notes
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter by Subject
                </Button>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl border-0 shadow-sm">
              <h4 className="mb-4">Subjects</h4>
              <div className="space-y-2">
                {["Physics", "Mathematics", "Chemistry", "History", "Biology"].map((subject) => (
                  <div key={subject} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{subject}</span>
                    <Badge variant="secondary" className="rounded-full">
                      {Math.floor(Math.random() * 10) + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Header */}
            <div>
              <h1 className="mb-2 text-3xl">Welcome back, Student!</h1>
              <p className="text-muted-foreground text-lg">
                Here's your learning progress and recent study materials
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="p-6 rounded-2xl border-0 shadow-sm text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>

            {/* Upload Area */}
            <Card className="p-8 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2">Upload New Notes</h3>
                <p className="text-muted-foreground mb-6">
                  Drag and drop your handwritten notes or click to browse files
                </p>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6">
                  Choose Files
                </Button>
              </div>
            </Card>

            {/* Recent Notes */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2>Recent Study Guides</h2>
                <Button variant="outline" className="rounded-xl">
                  View All
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recentNotes.map((note) => (
                  <Card key={note.id} className="p-6 rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="mb-1">{note.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="rounded-full text-xs">
                            {note.subject}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{note.uploadDate}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>{note.pages} pages</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          note.status === 'completed' 
                            ? 'bg-secondary/10 text-secondary' 
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {note.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {note.summary}
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm mb-2">Key Topics:</div>
                      <div className="flex flex-wrap gap-1">
                        {note.keyTopics.map((topic, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs rounded-full">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl"
                        disabled={note.status === 'processing'}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View Rundown
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary rounded-xl"
                        disabled={note.status === 'processing'}
                      >
                        Export PDF
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}