import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { 
  CheckCircle, 
  XCircle, 
  Trophy, 
  BookOpen, 
  Clock, 
  Target,
  ArrowRight,
  RotateCcw
} from "lucide-react";

interface MockExamProps {
  onNavigate: (page: string) => void;
}

interface Question {
  id: number;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'multi-select' | 'short-answer' | 'drag-drop' | 'matching';
  subject: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  userAnswer?: string | string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function MockExam({ onNavigate }: MockExamProps) {
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | string[])[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>('');

  const questions: Question[] = [
    {
      id: 1,
      type: 'multiple-choice',
      subject: 'Physics',
      question: 'What is the speed of light in a vacuum?',
      options: ['3.0 × 10⁸ m/s', '2.0 × 10⁸ m/s', '4.0 × 10⁸ m/s', '1.5 × 10⁸ m/s'],
      correctAnswer: '3.0 × 10⁸ m/s',
      explanation: 'The speed of light in a vacuum is exactly 299,792,458 m/s, commonly approximated as 3.0 × 10⁸ m/s.',
      difficulty: 'easy'
    },
    {
      id: 2,
      type: 'true-false',
      subject: 'Chemistry',
      question: 'Water (H₂O) is a polar molecule.',
      correctAnswer: 'true',
      explanation: 'Water is indeed a polar molecule due to the unequal sharing of electrons between oxygen and hydrogen atoms, creating partial charges.',
      difficulty: 'easy'
    },
    {
      id: 3,
      type: 'fill-blank',
      subject: 'Mathematics',
      question: 'The derivative of x² is ____.',
      correctAnswer: '2x',
      explanation: 'Using the power rule for derivatives, d/dx(x²) = 2x¹ = 2x.',
      difficulty: 'medium'
    },
    {
      id: 4,
      type: 'multi-select',
      subject: 'Biology',
      question: 'Which of the following are parts of a plant cell? (Select all that apply)',
      options: ['Cell wall', 'Chloroplasts', 'Centrioles', 'Vacuole', 'Mitochondria'],
      correctAnswer: ['Cell wall', 'Chloroplasts', 'Vacuole', 'Mitochondria'],
      explanation: 'Plant cells have cell walls, chloroplasts, large vacuoles, and mitochondria. Centrioles are typically found in animal cells.',
      difficulty: 'medium'
    },
    {
      id: 5,
      type: 'short-answer',
      subject: 'History',
      question: 'In what year did World War II end?',
      correctAnswer: '1945',
      explanation: 'World War II officially ended in 1945 with Japan\'s surrender on September 2, 1945, following the atomic bombings and Soviet invasion.',
      difficulty: 'easy'
    },
    {
      id: 6,
      type: 'multiple-choice',
      subject: 'Physics',
      question: 'According to Newton\'s second law, F = ma. If force doubles and mass remains constant, acceleration:',
      options: ['Doubles', 'Halves', 'Remains the same', 'Quadruples'],
      correctAnswer: 'Doubles',
      explanation: 'Since F = ma, if force (F) doubles and mass (m) stays constant, acceleration (a) must also double to maintain the equation.',
      difficulty: 'medium'
    },
    {
      id: 7,
      type: 'true-false',
      subject: 'Mathematics',
      question: 'The square root of 144 is 12.',
      correctAnswer: 'true',
      explanation: 'Indeed, √144 = 12 because 12 × 12 = 144.',
      difficulty: 'easy'
    },
    {
      id: 8,
      type: 'fill-blank',
      subject: 'Chemistry',
      question: 'The chemical symbol for gold is ____.',
      correctAnswer: 'Au',
      explanation: 'Gold\'s chemical symbol is Au, derived from the Latin word "aurum" meaning gold.',
      difficulty: 'easy'
    },
    {
      id: 9,
      type: 'multiple-choice',
      subject: 'English',
      question: 'Which literary device is used in "The wind whispered through the trees"?',
      options: ['Metaphor', 'Simile', 'Personification', 'Alliteration'],
      correctAnswer: 'Personification',
      explanation: 'Personification gives human qualities (whispering) to non-human things (wind).',
      difficulty: 'medium'
    },
    {
      id: 10,
      type: 'multi-select',
      subject: 'Geography',
      question: 'Which of these are European countries? (Select all that apply)',
      options: ['France', 'Brazil', 'Germany', 'Japan', 'Italy', 'Australia'],
      correctAnswer: ['France', 'Germany', 'Italy'],
      explanation: 'France, Germany, and Italy are all European countries. Brazil is in South America, Japan is in Asia, and Australia is in Oceania.',
      difficulty: 'easy'
    },
    {
      id: 11,
      type: 'short-answer',
      subject: 'Physics',
      question: 'What is the unit of electric current?',
      correctAnswer: 'Ampere',
      explanation: 'The ampere (A) is the SI base unit of electric current, named after André-Marie Ampère.',
      difficulty: 'medium'
    },
    {
      id: 12,
      type: 'fill-blank',
      subject: 'Biology',
      question: 'Photosynthesis occurs in the ____ of plant cells.',
      correctAnswer: 'chloroplasts',
      explanation: 'Chloroplasts contain chlorophyll and are the organelles where photosynthesis takes place in plant cells.',
      difficulty: 'medium'
    },
    {
      id: 13,
      type: 'true-false',
      subject: 'Chemistry',
      question: 'Acids have a pH greater than 7.',
      correctAnswer: 'false',
      explanation: 'Acids have a pH less than 7. A pH of 7 is neutral, and pH greater than 7 indicates a base (alkaline solution).',
      difficulty: 'easy'
    },
    {
      id: 14,
      type: 'multiple-choice',
      subject: 'Mathematics',
      question: 'What is the area of a circle with radius 5?',
      options: ['25π', '10π', '5π', '15π'],
      correctAnswer: '25π',
      explanation: 'The area of a circle is πr². With radius 5, the area is π × 5² = 25π.',
      difficulty: 'medium'
    },
    {
      id: 15,
      type: 'short-answer',
      subject: 'History',
      question: 'Who was the first President of the United States?',
      correctAnswer: 'George Washington',
      explanation: 'George Washington served as the first President of the United States from 1789 to 1797.',
      difficulty: 'easy'
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSubmit = () => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = currentAnswer;
    setUserAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setCurrentAnswer('');
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setExamCompleted(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      if (question.type === 'multi-select') {
        const correctAnswers = question.correctAnswer as string[];
        const userAnswerArray = userAnswer as string[];
        if (userAnswerArray && correctAnswers.length === userAnswerArray.length &&
            correctAnswers.every(ans => userAnswerArray.includes(ans))) {
          correct++;
        }
      } else {
        const correctAnswer = (question.correctAnswer as string).toLowerCase().trim();
        const userAnswerString = (userAnswer as string)?.toLowerCase().trim();
        if (correctAnswer === userAnswerString) {
          correct++;
        }
      }
    });
    return correct;
  };

  const isAnswerCorrect = () => {
    if (currentQuestion.type === 'multi-select') {
      const correctAnswers = currentQuestion.correctAnswer as string[];
      const userAnswerArray = currentAnswer as string[];
      return userAnswerArray && correctAnswers.length === userAnswerArray.length &&
             correctAnswers.every(ans => userAnswerArray.includes(ans));
    } else {
      const correctAnswer = (currentQuestion.correctAnswer as string).toLowerCase().trim();
      const userAnswerString = (currentAnswer as string)?.toLowerCase().trim();
      return correctAnswer === userAnswerString;
    }
  };

  const getEncouragingMessage = (score: number) => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return "Outstanding! You're mastering this material! 🌟";
    if (percentage >= 80) return "Excellent work! You're doing great! 🎉";
    if (percentage >= 70) return "Good job! Keep up the solid progress! 👏";
    if (percentage >= 60) return "Nice effort! You're on the right track! 💪";
    return "Keep practicing - every attempt makes you stronger! 📚";
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <RadioGroup 
            value={currentAnswer as string} 
            onValueChange={setCurrentAnswer}
            className="space-y-4"
          >
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'true-false':
        return (
          <RadioGroup 
            value={currentAnswer as string} 
            onValueChange={setCurrentAnswer}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true" className="cursor-pointer flex-1">True</Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false" className="cursor-pointer flex-1">False</Label>
            </div>
          </RadioGroup>
        );

      case 'fill-blank':
        return (
          <Input
            value={currentAnswer as string}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Enter your answer here..."
            className="text-lg p-4 rounded-xl"
          />
        );

      case 'short-answer':
        return (
          <Textarea
            value={currentAnswer as string}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Enter your answer here..."
            className="min-h-24 rounded-xl"
          />
        );

      case 'multi-select':
        return (
          <div className="space-y-4">
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50">
                <Checkbox
                  id={`multi-${index}`}
                  checked={(currentAnswer as string[])?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const currentAnswers = (currentAnswer as string[]) || [];
                    if (checked) {
                      setCurrentAnswer([...currentAnswers, option]);
                    } else {
                      setCurrentAnswer(currentAnswers.filter(ans => ans !== option));
                    }
                  }}
                />
                <Label htmlFor={`multi-${index}`} className="cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (!examStarted) {
    return (
      <div className="w-full py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <h1 className="mb-4 text-4xl">Mock Exam</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Test your knowledge with questions generated from your digitalized notes. 
              This exam contains 15 questions covering various subjects and question types.
            </p>
          </div>

          <Card className="p-8 rounded-2xl border-0 shadow-lg max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl mb-1">15</div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                </div>
                <div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="text-2xl mb-1">~20</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl mb-1">Mixed</div>
                  <div className="text-sm text-muted-foreground">Subjects</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3>Exam Instructions:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Read each question carefully</li>
                  <li>• You'll receive immediate feedback after each answer</li>
                  <li>• You can't go back to previous questions</li>
                  <li>• Take your time - there's no time limit</li>
                </ul>
              </div>

              <Button 
                onClick={() => setExamStarted(true)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6 text-lg"
              >
                Start Exam
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (examCompleted) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="w-full py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <h1 className="mb-4 text-4xl">Exam Complete!</h1>
            <p className="text-xl text-muted-foreground">
              Great job finishing the mock exam. Here are your results:
            </p>
          </div>

          <Card className="p-8 rounded-2xl border-0 shadow-lg max-w-2xl mx-auto mb-8">
            <div className="text-center space-y-6">
              <div>
                <div className="text-6xl mb-2">{percentage}%</div>
                <div className="text-muted-foreground">Final Score</div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl text-secondary mb-1">{score}</div>
                  <div className="text-sm text-muted-foreground">Correct Answers</div>
                </div>
                <div>
                  <div className="text-3xl text-destructive mb-1">{questions.length - score}</div>
                  <div className="text-sm text-muted-foreground">Incorrect Answers</div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-xl p-6">
                <p className="text-lg">{getEncouragingMessage(score)}</p>
              </div>
            </div>
          </Card>

          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => {
                setExamStarted(false);
                setCurrentQuestionIndex(0);
                setUserAnswers([]);
                setExamCompleted(false);
                setCurrentAnswer('');
                setShowFeedback(false);
              }}
              variant="outline"
              className="rounded-xl px-6"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake Exam
            </Button>
            <Button 
              onClick={() => onNavigate('dashboard')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="px-4 py-2 rounded-full">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
            <Badge 
              variant="outline" 
              className={`px-4 py-2 rounded-full ${
                currentQuestion.difficulty === 'easy' ? 'text-green-600 border-green-300' :
                currentQuestion.difficulty === 'medium' ? 'text-yellow-600 border-yellow-300' :
                'text-red-600 border-red-300'
              }`}
            >
              {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-8 rounded-2xl border-0 shadow-lg">
          {!showFeedback ? (
            <div className="space-y-8">
              {/* Question Header */}
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary rounded-full">
                  {currentQuestion.subject}
                </Badge>
                <h2 className="text-2xl mb-6">{currentQuestion.question}</h2>
              </div>

              {/* Question Content */}
              <div>
                {renderQuestion()}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleAnswerSubmit}
                  disabled={!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8"
                >
                  Submit Answer
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Feedback Header */}
              <div className="flex items-center gap-4">
                {isAnswerCorrect() ? (
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                )}
                <div>
                  <h3 className={`text-xl ${isAnswerCorrect() ? 'text-green-600' : 'text-red-600'}`}>
                    {isAnswerCorrect() ? 'Correct!' : 'Incorrect'}
                  </h3>
                  <p className="text-muted-foreground">
                    {currentQuestion.subject} • {currentQuestion.difficulty}
                  </p>
                </div>
              </div>

              {/* Answer Comparison */}
              <div className="space-y-4">
                <div>
                  <div className="text-sm mb-2">Your Answer:</div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    {Array.isArray(currentAnswer) ? currentAnswer.join(', ') : currentAnswer}
                  </div>
                </div>
                
                {!isAnswerCorrect() && (
                  <div>
                    <div className="text-sm mb-2">Correct Answer:</div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      {Array.isArray(currentQuestion.correctAnswer) 
                        ? currentQuestion.correctAnswer.join(', ') 
                        : currentQuestion.correctAnswer}
                    </div>
                  </div>
                )}
              </div>

              {/* Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="mb-2 text-blue-900">Explanation</h4>
                <p className="text-blue-800">{currentQuestion.explanation}</p>
              </div>

              {/* Continue Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleContinue}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8"
                >
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    'View Results'
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}