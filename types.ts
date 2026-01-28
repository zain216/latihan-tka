
export enum Subject {
  MATEMATIKA = 'Matematika',
  BAHASA_INDONESIA = 'Bahasa Indonesia'
}

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: string;
  number: number;
  text: string;
  imageUrl?: string;
  options: Record<OptionKey, string>;
  correctAnswer: OptionKey;
  subject: Subject;
  package: string;
}

export interface StudentInfo {
  nis: string;
  name: string;
  className: string;
}

export interface ExamResult {
  id: string;
  nis: string;
  studentName: string;
  className: string;
  subject: Subject;
  package: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  timestamp: string;
}

export interface SchoolSettings {
  schoolName: string;
  motto: string;
  academicYear: string;
  logoUrl: string;
  remoteSyncUrl?: string; // Tautan ke file JSON publik untuk update otomatis
}

export interface UserAnswers {
  [questionId: string]: OptionKey;
}

export type AppView = 'STUDENT_LOGIN' | 'STUDENT_EXAM' | 'STUDENT_RESULT' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD';
