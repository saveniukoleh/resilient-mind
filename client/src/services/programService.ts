import { Program, Module, Exercise, Quiz, ProgramVersion } from '../types/program';
import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

const PROGRAMS_COLLECTION = 'programs';
const MODULES_COLLECTION = 'modules';
const EXERCISES_COLLECTION = 'exercises';
const QUIZZES_COLLECTION = 'quizzes';

interface ProgramFilters {
  status?: 'draft' | 'published' | 'template';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
}

class ProgramService {
  private collection = collection(db, PROGRAMS_COLLECTION);

  async createProgram(program: Omit<Program, 'id'>): Promise<{ id: string; program: Program }> {
    const docRef = await addDoc(this.collection, {
      ...program,
      version: 1,
      versionHistory: [
        {
          id: crypto.randomUUID(),
          version: 1,
          title: program.title,
          description: program.description,
          modules: program.modules,
          createdAt: new Date(),
          createdBy: program.createdBy,
          status: program.status,
          tags: program.tags,
          difficulty: program.difficulty,
          estimatedDuration: program.estimatedDuration,
          prerequisites: program.prerequisites,
          changeNotes: 'Initial version',
        },
      ],
      currentVersionId: crypto.randomUUID(),
    });

    const newProgram = {
      id: docRef.id,
      ...program,
      version: 1,
      versionHistory: [
        {
          id: crypto.randomUUID(),
          version: 1,
          title: program.title,
          description: program.description,
          modules: program.modules,
          createdAt: new Date(),
          createdBy: program.createdBy,
          status: program.status,
          tags: program.tags,
          difficulty: program.difficulty,
          estimatedDuration: program.estimatedDuration,
          prerequisites: program.prerequisites,
          changeNotes: 'Initial version',
        },
      ],
      currentVersionId: crypto.randomUUID(),
    };

    return { id: docRef.id, program: newProgram };
  }

  async getProgram(id: string): Promise<Program | null> {
    const docRef = doc(this.collection, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Program) : null;
  }

  async listPrograms(filters?: ProgramFilters): Promise<Program[]> {
    let q = query(this.collection);

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters?.difficulty) {
      q = query(q, where('difficulty', '==', filters.difficulty));
    }

    if (filters?.tags?.length) {
      q = query(q, where('tags', 'array-contains-any', filters.tags));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Program);
  }

  async updateProgram(id: string, program: Partial<Program>): Promise<void> {
    const docRef = doc(this.collection, id);
    await updateDoc(docRef, program);
  }

  async deleteProgram(id: string): Promise<void> {
    const docRef = doc(this.collection, id);
    await deleteDoc(docRef);
  }

  async createVersion(id: string, version: ProgramVersion): Promise<void> {
    const docRef = doc(this.collection, id);
    await updateDoc(docRef, {
      version: version.version,
      versionHistory: arrayUnion(version),
      currentVersionId: version.id,
    });
  }

  async restoreVersion(id: string, versionId: string): Promise<void> {
    const docRef = doc(this.collection, id);
    const program = await this.getProgram(id);
    if (!program) return;

    const version = program.versionHistory.find(v => v.id === versionId);
    if (!version) return;

    await updateDoc(docRef, {
      title: version.title,
      description: version.description,
      modules: version.modules,
      status: version.status,
      tags: version.tags,
      difficulty: version.difficulty,
      estimatedDuration: version.estimatedDuration,
      prerequisites: version.prerequisites,
      currentVersionId: version.id,
    });
  }

  async deleteVersion(id: string, versionId: string): Promise<void> {
    const docRef = doc(this.collection, id);
    const program = await this.getProgram(id);
    if (!program) return;

    const version = program.versionHistory.find(v => v.id === versionId);
    if (!version) return;

    await updateDoc(docRef, {
      versionHistory: arrayRemove(version),
    });
  }

  // Module operations
  async createModule(programId: string, module: Omit<Module, 'id'>): Promise<Module> {
    const programRef = doc(this.collection, programId);
    const moduleData = {
      ...module,
      id: crypto.randomUUID(),
    };

    await updateDoc(programRef, {
      modules: arrayUnion(moduleData),
      updatedAt: new Date(),
    });

    return moduleData;
  }

  async getModule(programId: string, moduleId: string): Promise<Module | null> {
    const program = await this.getProgram(programId);
    if (!program) {
      return null;
    }
    return program.modules.find(m => m.id === moduleId) || null;
  }

  // Exercise operations
  async createExercise(
    programId: string,
    moduleId: string,
    exercise: Omit<Exercise, 'id'>
  ): Promise<Exercise> {
    const program = await this.getProgram(programId);
    if (!program) {
      throw new Error('Program not found');
    }

    const exerciseData = {
      ...exercise,
      id: crypto.randomUUID(),
    };

    const updatedModules = program.modules.map(module => {
      if (module.id === moduleId) {
        return {
          ...module,
          content: module.content.map(content => {
            if (content.type === 'exercise' && content.content.id === exercise.id) {
              return {
                ...content,
                content: exerciseData,
              };
            }
            return content;
          }),
        };
      }
      return module;
    });

    await this.updateProgram(programId, { modules: updatedModules });

    return exerciseData;
  }

  async getExercise(
    programId: string,
    moduleId: string,
    exerciseId: string
  ): Promise<Exercise | null> {
    const module = await this.getModule(programId, moduleId);
    if (!module) {
      return null;
    }

    const exerciseContent = module.content.find(
      content => content.type === 'exercise' && content.content.id === exerciseId
    );

    return exerciseContent ? (exerciseContent.content as Exercise) : null;
  }

  // Quiz operations
  async createQuiz(programId: string, moduleId: string, quiz: Omit<Quiz, 'id'>): Promise<Quiz> {
    const program = await this.getProgram(programId);
    if (!program) {
      throw new Error('Program not found');
    }

    const quizData = {
      ...quiz,
      id: crypto.randomUUID(),
    };

    const updatedModules = program.modules.map(module => {
      if (module.id === moduleId) {
        return {
          ...module,
          content: module.content.map(content => {
            if (content.type === 'quiz' && content.content.id === quiz.id) {
              return {
                ...content,
                content: quizData,
              };
            }
            return content;
          }),
        };
      }
      return module;
    });

    await this.updateProgram(programId, { modules: updatedModules });

    return quizData;
  }

  async getQuiz(programId: string, moduleId: string, quizId: string): Promise<Quiz | null> {
    const module = await this.getModule(programId, moduleId);
    if (!module) {
      return null;
    }

    const quizContent = module.content.find(
      content => content.type === 'quiz' && content.content.id === quizId
    );

    return quizContent ? (quizContent.content as Quiz) : null;
  }
}

export const programService = new ProgramService();
