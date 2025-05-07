export interface Program {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
  status: 'draft' | 'published' | 'template';
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in minutes
  prerequisites?: string[];
  versionHistory: ProgramVersion[];
  currentVersionId: string;
}

export interface ProgramVersion {
  id: string;
  version: number;
  title: string;
  description: string;
  modules: Module[];
  createdAt: Date;
  createdBy: string;
  status: 'draft' | 'published' | 'template';
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  prerequisites?: string[];
  changeNotes?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  content: ModuleContent[];
  order: number;
  duration: number; // in minutes
  prerequisites?: string[];
}

export interface ModuleContent {
  id: string;
  type: 'text' | 'video' | 'exercise' | 'quiz';
  content: any; // Will be typed based on the content type
  order: number;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  type: 'breathing' | 'cbt' | 'meditation' | 'journaling';
  instructions: string[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  materials?: string[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}
