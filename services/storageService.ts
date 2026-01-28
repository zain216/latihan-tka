
import { Question, ExamResult, Subject, SchoolSettings } from '../types';
import { INITIAL_QUESTIONS, INITIAL_SCHOOL_SETTINGS } from '../constants';

const KEYS = {
  QUESTIONS: 'tka_216_questions',
  RESULTS: 'tka_216_results',
  SETTINGS: 'tka_216_settings'
};

export const storageService = {
  getSettings: (): SchoolSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SCHOOL_SETTINGS));
      return INITIAL_SCHOOL_SETTINGS;
    }
    return JSON.parse(data);
  },

  saveSettings: (settings: SchoolSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  getQuestions: (): Question[] => {
    const data = localStorage.getItem(KEYS.QUESTIONS);
    if (!data) {
      localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS;
    }
    return JSON.parse(data);
  },

  saveQuestions: (questions: Question[]) => {
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
  },

  getResults: (): ExamResult[] => {
    const data = localStorage.getItem(KEYS.RESULTS);
    return data ? JSON.parse(data) : [];
  },

  saveResult: (result: ExamResult) => {
    const results = storageService.getResults();
    results.push(result);
    localStorage.setItem(KEYS.RESULTS, JSON.stringify(results));
  },

  updateResult: (updatedResult: ExamResult) => {
    const results = storageService.getResults();
    const index = results.findIndex(r => r.id === updatedResult.id);
    if (index !== -1) {
      results[index] = updatedResult;
      localStorage.setItem(KEYS.RESULTS, JSON.stringify(results));
    }
  },

  deleteResult: (id: string) => {
    const results = storageService.getResults();
    const filtered = results.filter(r => r.id !== id);
    localStorage.setItem(KEYS.RESULTS, JSON.stringify(filtered));
  }
};
