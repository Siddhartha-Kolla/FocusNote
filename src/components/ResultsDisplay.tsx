import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Question } from './QuestionGenerator';
import { Trophy, RotateCcw, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import React from 'react';

interface ResultsDisplayProps {
  questions: Question[];
  answers: { [questionId: string]: string };
  onRestart: () => void;
  onRetakeExam: () => void;
  onSaveResults?: (score: number, percentage: number) => void;
  noteTitle?: string;
}

export function ResultsDisplay({ questions, answers, onRestart, onRetakeExam, onSaveResults, noteTitle }: ResultsDisplayProps) {
  // Calculate score
  const correctAnswers = questions.filter(q => {
    const userAnswer = answers[q.id]?.toLowerCase().trim();
    const correctAnswer = q.correctAnswer.toLowerCase().trim();
    return userAnswer === correctAnswer;
  });

  const score = correctAnswers.length;
  const percentage = Math.round((score / questions.length) * 100);
  const passed = percentage >= 70;

  // Save results when component mounts
  React.useEffect(() => {
    if (onSaveResults) {
      onSaveResults(score, percentage);
    }
  }, [score, percentage, onSaveResults]);

  // Group questions by topic for detailed breakdown
  const topicBreakdown = questions.reduce((acc, question) => {
    if (!acc[question.topic]) {
      acc[question.topic] = { total: 0, correct: 0 };
    }
    acc[question.topic].total += 1;
    
    const userAnswer = answers[question.id]?.toLowerCase().trim();
    const correctAnswer = question.correctAnswer.toLowerCase().trim();
    if (userAnswer === correctAnswer) {
      acc[question.topic].correct += 1;
    }
    
    return acc;
  }, {} as { [topic: string]: { total: number; correct: number } });

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 80) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (percentage >= 70) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getScoreIcon(percentage)}
          </div>
          <CardTitle className="text-2xl">Exam Complete!</CardTitle>
          <CardDescription>
            {noteTitle && <div className="mb-2">Exam: {noteTitle}</div>}
            {passed ? 'Congratulations! You passed the exam.' : 'Keep studying and try again!'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <div className={`text-4xl ${getScoreColor(percentage)}`}>
              {percentage}%
            </div>
            <p className="text-muted-foreground">
              {score} out of {questions.length} questions correct
            </p>
          </div>
          
          <Progress value={percentage} className="h-3" />
          
          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={onRetakeExam} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Retake Exam
            </Button>
            <Button onClick={onRestart} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              New Notes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Topic Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Topic</CardTitle>
          <CardDescription>See how well you performed in each subject area</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(topicBreakdown).map(([topic, stats]) => {
            const topicPercentage = Math.round((stats.correct / stats.total) * 100);
            return (
              <div key={topic} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="truncate">{topic}</span>
                  <Badge variant={topicPercentage >= 70 ? 'default' : 'destructive'}>
                    {stats.correct}/{stats.total} ({topicPercentage}%)
                  </Badge>
                </div>
                <Progress value={topicPercentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Detailed Review */}
      <Card>
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
          <CardDescription>Review your answers and explanations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer?.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
            
            return (
              <div key={question.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span>Question {index + 1}</span>
                      <Badge variant="outline" className="text-xs">
                        {question.topic}
                      </Badge>
                    </div>
                    
                    <p>{question.question}</p>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Your answer:</span>
                        <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {userAnswer || 'No answer provided'}
                        </span>
                      </div>
                      
                      {!isCorrect && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Correct answer:</span>
                          <span className="text-green-600">{question.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 text-blue-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Explanation:</p>
                          <p className="text-sm">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {index < questions.length - 1 && <Separator />}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}