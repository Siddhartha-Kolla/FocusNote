import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Upload, FileText, ArrowRight, FilePlus, Loader2 } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';

interface NotesInputProps {
  onNotesSubmit: (notes: string, title?: string, tags?: string[]) => void;
  onBack?: () => void;
  selectedNote?: any;
  accessToken?: string;
}

export function NotesInput({ onNotesSubmit, onBack, selectedNote, accessToken }: NotesInputProps) {
  const [notes, setNotes] = useState(selectedNote?.content || '');
  const [title, setTitle] = useState(selectedNote?.title || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (notes.trim()) {
      const noteTitle = title.trim() || `Notes from ${new Date().toLocaleDateString()}`;
      onNotesSubmit(notes.trim(), noteTitle, []);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const textFile = files.find(file => file.type === 'text/plain' || file.name.endsWith('.txt'));
    const pdfFile = files.find(file => file.type === 'application/pdf' || file.name.endsWith('.pdf'));
    
    if (textFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setNotes(content);
      };
      reader.readAsText(textFile);
    } else if (pdfFile) {
      handlePdfFile(pdfFile);
    }
  };

  const handlePdfFile = async (file: File) => {
    if (!accessToken) {
      console.error('No access token available for PDF processing');
      return;
    }

    setPdfFile(file);
    setIsProcessingPdf(true);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5ceb8382/process-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to process PDF: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.extractedText) {
        setNotes(data.extractedText);
        if (!title) {
          setTitle(file.name.replace('.pdf', '') || `PDF Notes from ${new Date().toLocaleDateString()}`);
        }
      } else {
        throw new Error('No text extracted from PDF');
      }
    } catch (error) {
      console.error('PDF processing error:', error);
      // You could add a toast notification here
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      handlePdfFile(file);
    }
  };

  const sampleNotes = `# Biology - Cell Structure

## Cell Membrane
- Semi-permeable barrier that controls what enters and exits the cell
- Made of phospholipid bilayer with embedded proteins
- Functions: protection, transport regulation, cell communication

## Nucleus
- Control center of the cell containing DNA
- Surrounded by nuclear envelope with nuclear pores
- Contains nucleolus where ribosome assembly occurs

## Mitochondria
- Powerhouse of the cell - produces ATP through cellular respiration
- Has double membrane structure
- Contains its own DNA (maternal inheritance)

## Ribosomes
- Sites of protein synthesis
- Found free in cytoplasm or attached to endoplasmic reticulum
- Made of rRNA and proteins

## Key Processes
- Diffusion: movement from high to low concentration
- Active transport: requires energy to move against gradient
- Osmosis: water movement across membrane`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1 space-y-2">
          <h1>Notes to Mock Exam Generator</h1>
          <p className="text-muted-foreground">Transform your study notes into practice tests</p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back to Dashboard
          </Button>
        )}
      </div>

      <Card className="enhanced-card">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Input Your Notes
          </CardTitle>
          <CardDescription>
            Add your study notes by typing, uploading a text file, or scanning a PDF. 
            The better organized your notes, the better questions we can generate!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="Give your notes a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Text Input</TabsTrigger>
              <TabsTrigger value="pdf">PDF Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
                  isDragging 
                    ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 shadow-medium' 
                    : 'border-muted-foreground/25 hover:border-purple-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-purple-900/20'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Textarea
                  placeholder="Paste your study notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[300px] border-0 resize-none focus-visible:ring-0"
                />
                {!notes && (
                  <div className="text-center text-muted-foreground mt-4">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <p>Drag and drop a text or PDF file here, or type your notes above</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="pdf" className="space-y-4">
              <div className="border-2 border-dashed rounded-xl p-8 text-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800/30">
                {isProcessingPdf ? (
                  <div className="space-y-4">
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                    <div>
                      <h3>Processing PDF...</h3>
                      <p className="text-muted-foreground">Extracting text from your document</p>
                    </div>
                  </div>
                ) : pdfFile ? (
                  <div className="space-y-4">
                    <FilePlus className="h-12 w-12 mx-auto text-green-600" />
                    <div>
                      <h3>PDF Processed Successfully!</h3>
                      <p className="text-muted-foreground">{pdfFile.name}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Text has been extracted and is ready for exam generation.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileInput}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <FilePlus className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <h3>Upload PDF Notes</h3>
                      <p className="text-muted-foreground mb-4">
                        Select a PDF file containing your study notes
                      </p>
                      <Button
                        onClick={() => document.getElementById('pdf-upload')?.click()}
                        className="gradient-secondary border-0 shadow-medium hover:shadow-large transition-all duration-300 flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Choose PDF File
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center">
            {!selectedNote && (
              <Button
                variant="outline"
                onClick={() => setNotes(sampleNotes)}
                className="text-sm glass-effect hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Use Sample Notes
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!notes.trim() || isProcessingPdf}
              className="gradient-primary border-0 shadow-medium hover:shadow-large transition-all duration-300 flex items-center gap-2"
            >
              {isProcessingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Generate Exam
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}