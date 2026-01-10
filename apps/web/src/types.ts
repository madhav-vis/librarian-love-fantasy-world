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

export interface QuizNode {
  id: string;
  type: "dialogue" | "quiz" | "feedback";
  speaker?: string;
  text: string;
  choices?: Choice[];
  next?: string;
  character?: Character;
  background?: string;
}

export interface BookData {
  bookId: string;
  title: string;
  progress: number; // Kept for backward compatibility, represents page number
  totalPages: number;
  currentNode: QuizNode;
}