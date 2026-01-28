
import React from 'react';
import { ExamResult } from '../types';

interface ResultViewProps {
  result: ExamResult;
  onFinish: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, onFinish }) => {
  const getFeedback = (score: number) => {
    if (score >= 80) return { title: 'Sangat Memuaskan!', color: 'text-green-600', emoji: '🌟' };
    if (score >= 70) return { title: 'Bagus Sekali!', color: 'text-blue-600', emoji: '👍' };
    if (score >= 60) return { title: 'Cukup Baik', color: 'text-yellow-600', emoji: '📝' };
    return { title: 'Ayo Belajar Lagi!', color: 'text-orange-600', emoji: '📚' };
  };

  const feedback = getFeedback(result.score);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="text-6xl mb-4">{feedback.emoji}</div>
          <h2 className="text-3xl font-extrabold mb-1">{feedback.title}</h2>
          <p className="text-blue-100 opacity-90">Anda telah menyelesaikan latihan dengan baik.</p>
        </div>

        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <svg className="w-40 h-40">
                <circle className="text-slate-100" strokeWidth="12" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
                <circle 
                  className="text-blue-600 transition-all duration-1000 ease-out" 
                  strokeWidth="12" 
                  strokeDasharray={440} 
                  strokeDashoffset={440 - (440 * result.score) / 100} 
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="70" 
                  cx="80" 
                  cy="80" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-800">{result.score}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Skor Akhir</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-100">
              <p className="text-xs font-bold text-green-600 uppercase mb-1">Benar</p>
              <p className="text-2xl font-black text-green-700">{result.correctCount}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-100">
              <p className="text-xs font-bold text-red-600 uppercase mb-1">Salah</p>
              <p className="text-2xl font-black text-red-700">{result.wrongCount}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
              <p className="text-xs font-bold text-slate-600 uppercase mb-1">Total Soal</p>
              <p className="text-2xl font-black text-slate-700">{result.totalQuestions}</p>
            </div>
          </div>

          <div className="space-y-4 mb-10">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500">Nama</span>
              <span className="font-bold text-slate-800">{result.studentName}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500">NIS</span>
              <span className="font-bold text-slate-800">{result.nis}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500">Mata Pelajaran</span>
              <span className="font-bold text-slate-800">{result.subject}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500">Paket Soal</span>
              <span className="font-bold text-slate-800">{result.package}</span>
            </div>
          </div>

          <button 
            onClick={onFinish}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
          >
            Selesai dan Keluar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
