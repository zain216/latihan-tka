
import { Question, Subject, SchoolSettings } from './types';

export const ADMIN_CREDENTIALS = {
  username: '216jaya',
  password: '216216'
};

export const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'SMP Negeri 216 Jakarta',
  motto: 'Unggul dalam Prestasi, Santun dalam Budi Pekerti',
  academicYear: '2024/2025',
  logoUrl: 'https://raw.githubusercontent.com/ai-code-images/assets/main/smpn216.jpg'
};

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: '1',
    number: 1,
    text: 'Jika 3x + 5 = 20, berapakah nilai x?',
    options: { A: '3', B: '5', C: '7', D: '15' },
    correctAnswer: 'B',
    subject: Subject.MATEMATIKA,
    package: 'Paket 1'
  },
  {
    id: '2',
    number: 2,
    text: 'Hasil dari 12 x 12 + 10 adalah...',
    options: { A: '144', B: '154', C: '164', D: '120' },
    correctAnswer: 'B',
    subject: Subject.MATEMATIKA,
    package: 'Paket 1'
  },
  {
    id: '3',
    number: 1,
    text: 'Ide pokok dari sebuah paragraf biasanya terletak pada...',
    options: { A: 'Kalimat utama', B: 'Kalimat penjelas', C: 'Akhir paragraf saja', D: 'Judul' },
    correctAnswer: 'A',
    subject: Subject.BAHASA_INDONESIA,
    package: 'Paket 1'
  },
  {
    id: '4',
    number: 2,
    text: 'Sinonim dari kata "Edukasi" adalah...',
    options: { A: 'Pendidikan', B: 'Hiburan', C: 'Pekerjaan', D: 'Perjalanan' },
    correctAnswer: 'A',
    subject: Subject.BAHASA_INDONESIA,
    package: 'Paket 1'
  }
];

export const CLASSES = [
  'IX-1', 'IX-2', 'IX-3', 'IX-4', 'IX-5', 'IX-6', 'IX-7', 'IX-8', 'IX-9'
];

export const PACKAGES = ['Paket 1', 'Paket 2', 'Paket 3', 'Paket 4', 'Paket 5'];
