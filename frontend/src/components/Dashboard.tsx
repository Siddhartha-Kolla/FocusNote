import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  BookOpen, 
  Plus, 
  History, 
  Trash2, 
  FileText, 
  Clock, 
  TrendingUp,
  LogOut,
  User
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ExamResult {
  id: string;
  noteId: string;
  score: number;
  percentage: number;
  completedAt: string;
}

interface DashboardProps {
  user: any;
  accessToken: string;
  onSelectNote: (note: Note) => void;
  onCreateNew: () => void;
  onLogout: () => void;
}

export function Dashboard({ user, accessToken, onSelectNote, onCreateNew, onLogout }: DashboardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load notes
      const notesResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5ceb8382/notes`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        setNotes(notesData.notes || []);
      }

      // Load exam history
      const historyResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5ceb8382/exam-history`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setExamHistory(historyData.results || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5ceb8382/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId));
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const averageScore = examHistory.length > 0 
    ? Math.round(examHistory.reduce((sum, result) => sum + result.percentage, 0) / examHistory.length)
    : 0;

  const recentResults = examHistory.slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading your study materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Enhanced Header */}
      <div className="glass-effect border-b shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-medium">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Study Dashboard
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Welcome back, {user.user_metadata?.name || user.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button onClick={onCreateNew} className="gradient-primary border-0 shadow-medium hover:shadow-large transition-all duration-300 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Exam
              </Button>
              <Button variant="outline" onClick={onLogout} className="glass-effect hover:bg-red-50 flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="enhanced-card gradient-accent border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-3xl text-blue-900 dark:text-blue-100">{notes.length}</p>
                      <p className="text-blue-700 dark:text-blue-300">Saved Notes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="enhanced-card bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <History className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-3xl text-green-900 dark:text-green-100">{examHistory.length}</p>
                      <p className="text-green-700 dark:text-green-300">Exams Taken</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="enhanced-card bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/30 border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-3xl text-purple-900 dark:text-purple-100">{averageScore}%</p>
                      <p className="text-purple-700 dark:text-purple-300">Avg. Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Notes Section */}
            <Card className="enhanced-card">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Your Notes
                </CardTitle>
                <CardDescription>
                  Select notes to generate a practice exam, or create a new one
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg mb-2">No notes yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first practice exam by adding some study notes
                    </p>
                    <Button onClick={onCreateNew}>Create Your First Exam</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="flex items-center justify-between p-4 border rounded-xl hover:shadow-medium transition-all duration-300 glass-effect hover:bg-white/80 dark:hover:bg-gray-800/80"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="truncate">{note.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                          {note.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {note.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {note.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{note.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectNote(note)}
                          >
                            Create Exam
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteNote(note.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            <Card className="enhanced-card">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-green-600" />
                  Recent Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {recentResults.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No exam results yet</p>
                  ) : (
                    <div className="space-y-3">
                      {recentResults.map((result, index) => (
                        <div key={result.id}>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm">
                                Score: {result.score} questions
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(result.completedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge 
                              variant={result.percentage >= 70 ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {result.percentage}%
                            </Badge>
                          </div>
                          {index < recentResults.length - 1 && <Separator className="mt-3" />}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="enhanced-card">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>• Structure your notes with clear headings</p>
                  <p>• Include key definitions and concepts</p>
                  <p>• Use bullet points for better parsing</p>
                  <p>• Add examples and explanations</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}