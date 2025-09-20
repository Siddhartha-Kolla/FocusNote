export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
}

export function generateQuestions(notes: string): Question[] {
  const questions: Question[] = [];
  
  // Split notes into sections and extract key information
  const lines = notes.split('\n').filter(line => line.trim());
  const sections: { [key: string]: string[] } = {};
  let currentSection = 'General';
  
  // Parse notes structure
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
      currentSection = trimmed.replace(/^#+\s*/, '');
      sections[currentSection] = [];
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!sections[currentSection]) sections[currentSection] = [];
      sections[currentSection].push(trimmed.substring(2));
    } else if (trimmed && !trimmed.startsWith('#')) {
      if (!sections[currentSection]) sections[currentSection] = [];
      sections[currentSection].push(trimmed);
    }
  }

  // Generate different types of questions
  let questionId = 1;

  for (const [topic, content] of Object.entries(sections)) {
    if (content.length === 0) continue;

    // Generate multiple choice questions
    for (let i = 0; i < Math.min(2, content.length); i++) {
      const item = content[i];
      if (item.includes(':') || item.includes('-')) {
        const parts = item.split(/[:-]/);
        if (parts.length >= 2) {
          const concept = parts[0].trim();
          const definition = parts.slice(1).join(' ').trim();
          
          questions.push({
            id: `q${questionId++}`,
            type: 'multiple-choice',
            question: `What is ${concept.toLowerCase()}?`,
            options: [
              definition,
              generateWrongAnswer(definition, 'process'),
              generateWrongAnswer(definition, 'structure'),
              generateWrongAnswer(definition, 'function')
            ].sort(() => Math.random() - 0.5),
            correctAnswer: definition,
            explanation: `${concept} is defined as: ${definition}`,
            topic
          });
        }
      }
    }

    // Generate true/false questions
    for (const item of content.slice(0, 2)) {
      if (item.length > 20) {
        const isTrue = Math.random() > 0.5;
        let statement = item;
        
        if (!isTrue) {
          // Create false statement by changing key words
          statement = item.replace(/increases?/gi, 'decreases')
                         .replace(/high/gi, 'low')
                         .replace(/positive/gi, 'negative')
                         .replace(/required?/gi, 'not required')
                         .replace(/contains?/gi, 'lacks');
        }
        
        questions.push({
          id: `q${questionId++}`,
          type: 'true-false',
          question: statement,
          correctAnswer: isTrue ? 'true' : 'false',
          explanation: isTrue ? `This is true: ${item}` : `This is false. The correct statement is: ${item}`,
          topic
        });
      }
    }

    // Generate fill-in-the-blank questions
    for (const item of content.slice(0, 1)) {
      if (item.includes(' is ') || item.includes(' are ') || item.includes(' contains ')) {
        const words = item.split(' ');
        if (words.length > 5) {
          const keyWordIndex = words.findIndex(word => 
            word.length > 4 && 
            !['that', 'with', 'from', 'into', 'through'].includes(word.toLowerCase())
          );
          
          if (keyWordIndex !== -1) {
            const keyWord = words[keyWordIndex];
            const questionText = item.replace(keyWord, '_____');
            
            questions.push({
              id: `q${questionId++}`,
              type: 'fill-blank',
              question: `Fill in the blank: ${questionText}`,
              correctAnswer: keyWord.toLowerCase().replace(/[.,!?;]$/, ''),
              explanation: `The answer is "${keyWord}". ${item}`,
              topic
            });
          }
        }
      }
    }
  }

  return questions.slice(0, 15); // Limit to 15 questions
}

function generateWrongAnswer(correct: string, type: 'process' | 'structure' | 'function'): string {
  const wrongAnswers = {
    process: [
      'A method of energy storage in cells',
      'The breakdown of cellular components',
      'A type of chemical reaction that occurs in water',
      'The process of waste removal from organisms'
    ],
    structure: [
      'A temporary formation found in some cells',
      'An external covering that provides protection',
      'A fluid-filled space within the cell',
      'A network of interconnected tubes'
    ],
    function: [
      'Provides structural support to the cell',
      'Stores genetic information for the cell',
      'Facilitates communication between cells',
      'Regulates the temperature of the organism'
    ]
  };
  
  const options = wrongAnswers[type];
  return options[Math.floor(Math.random() * options.length)];
}