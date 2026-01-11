export interface Choice {
  id: string;
  text: string;
  isCorrect?: boolean;
  feedback?: string;
}

export interface Character {
  id: string;
  name: string;
  sprite?: string;
  position?: "left" | "center" | "right";
}

export interface Question {
  question: string;
  choices: Choice[];
}

export interface QuizNode {
  id: string;
  type: "dialogue" | "quiz" | "feedback";
  speaker?: string;
  text?: string; // Legacy support
  summary?: string; // Summary text before questions
  questions?: Question[]; // Array of 5 questions
  currentQuestionIndex?: number; // Current question being shown
  choices?: Choice[]; // Legacy support for single question
  next?: string;
  character?: Character;
  background?: string;
}

export interface BookData {
  bookId: string;
  title: string;
  progress: number; // Chapter index + 1
  totalPages: number;
  currentNode: QuizNode;
  gems?: number; // Gem count
}