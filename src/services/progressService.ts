import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  arrayUnion,
} from 'firebase/firestore';
import { Program, Module } from '../types/program';

interface Progress {
  id: string;
  userId: string;
  programId: string;
  moduleId: string;
  contentId: string;
  completed: boolean;
  completedAt: Date;
  timeSpent: number; // in minutes
  score?: number; // for quizzes
  notes?: string;
}

interface Achievement {
  id: string;
  userId: string;
  programId: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  type: 'completion' | 'streak' | 'milestone';
}

class ProgressService {
  private progressCollection = collection(db, 'progress');
  private achievementsCollection = collection(db, 'achievements');

  async getProgress(userId: string, programId: string): Promise<Progress[]> {
    const q = query(
      this.progressCollection,
      where('userId', '==', userId),
      where('programId', '==', programId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      completedAt: doc.data().completedAt.toDate(),
    })) as Progress[];
  }

  async getAchievements(userId: string, programId: string): Promise<Achievement[]> {
    const q = query(
      this.achievementsCollection,
      where('userId', '==', userId),
      where('programId', '==', programId),
      orderBy('earnedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      earnedAt: doc.data().earnedAt.toDate(),
    })) as Achievement[];
  }

  async markContentComplete(
    userId: string,
    programId: string,
    moduleId: string,
    contentId: string,
    timeSpent: number,
    score?: number,
    notes?: string
  ): Promise<void> {
    const progress: Omit<Progress, 'id'> = {
      userId,
      programId,
      moduleId,
      contentId,
      completed: true,
      completedAt: new Date(),
      timeSpent,
      score,
      notes,
    };

    await addDoc(this.progressCollection, progress);
    await this.checkAchievements(userId, programId);
  }

  async getTimeSpent(userId: string, programId: string): Promise<number> {
    const progress = await this.getProgress(userId, programId);
    return progress.reduce((sum, p) => sum + p.timeSpent, 0);
  }

  async getCompletedContentCount(
    userId: string,
    programId: string,
    moduleId: string
  ): Promise<number> {
    const progress = await this.getProgress(userId, programId);
    return progress.filter(p => p.moduleId === moduleId && p.completed).length;
  }

  private async checkAchievements(userId: string, programId: string): Promise<void> {
    const progress = await this.getProgress(userId, programId);
    const achievements = await this.getAchievements(userId, programId);

    // Check for completion achievements
    const completedModules = new Set(progress.map(p => p.moduleId));
    const program = await this.getProgram(programId);
    if (!program) return;

    // Module completion achievement
    if (completedModules.size === program.modules.length) {
      const hasCompletionAchievement = achievements.some(
        a => a.type === 'completion' && a.title === 'Program Completion'
      );
      if (!hasCompletionAchievement) {
        await this.createAchievement(userId, programId, {
          title: 'Program Completion',
          description: 'Completed all modules in the program',
          icon: 'fas fa-trophy',
          type: 'completion',
        });
      }
    }

    // Streak achievement
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recentProgress = progress.filter(p => p.completedAt >= today);
    if (recentProgress.length >= 7) {
      const hasStreakAchievement = achievements.some(
        a => a.type === 'streak' && a.title === '7-Day Streak'
      );
      if (!hasStreakAchievement) {
        await this.createAchievement(userId, programId, {
          title: '7-Day Streak',
          description: 'Completed content for 7 days in a row',
          icon: 'fas fa-fire',
          type: 'streak',
        });
      }
    }

    // Milestone achievements
    const totalTimeSpent = await this.getTimeSpent(userId, programId);
    if (totalTimeSpent >= 60) {
      const hasHourAchievement = achievements.some(
        a => a.type === 'milestone' && a.title === 'Hour of Progress'
      );
      if (!hasHourAchievement) {
        await this.createAchievement(userId, programId, {
          title: 'Hour of Progress',
          description: 'Spent 1 hour working on the program',
          icon: 'fas fa-clock',
          type: 'milestone',
        });
      }
    }
  }

  private async createAchievement(
    userId: string,
    programId: string,
    achievement: Omit<Achievement, 'id' | 'userId' | 'programId' | 'earnedAt'>
  ): Promise<void> {
    const newAchievement: Omit<Achievement, 'id'> = {
      ...achievement,
      userId,
      programId,
      earnedAt: new Date(),
    };
    await addDoc(this.achievementsCollection, newAchievement);
  }

  private async getProgram(programId: string): Promise<Program | null> {
    const docRef = doc(db, 'programs', programId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Program) : null;
  }
}

export const progressService = new ProgressService();
