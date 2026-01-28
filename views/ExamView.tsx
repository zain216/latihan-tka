
import React, { useState } from 'react';
import { Subject, Question, UserAnswers, OptionKey } from '../types';

interface ExamViewProps {
  subject: Subject;
  pkg: string;
  questions: Question[];
  onSubmit: (answers: UserAnswers) => void;
  studentName: string;
}

const ExamView: React.FC<ExamViewProps> = ({ subject, pkg, questions, onSubmit, studentName }) => {
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSelect = (qId: string, option: OptionKey) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const unansweredCount = questions.length - Object.keys(answers).length;

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="text-5xl mb-4">📭</div>
        <h3 className="text-xl font-bold text-slate-800">Soal Belum Tersedia</h3>
        <p className="text-slate-500 mt-2">Maaf, paket soal <b>{pkg}</b> untuk <b>{subject}</b> belum tersedia.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{subject} - {pkg}</h2>
          <p className="text-slate-600">Peserta: <span className="font-semibold text-blue-700">{studentName}</span></p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          <span className="text-sm font-medium text-blue-800">
            Terjawab: <span className="text-lg font-bold">{Object.keys(answers).length}</span> / {questions.length}
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                {idx + 1}
              </span>
              <div className="flex-grow">
                <p className="text-lg text-slate-800 mb-4 font-medium leading-relaxed">{q.text}</p>
                
                {q.imageUrl && (
                  <div className="mb-6 rounded-xl overflow-hidden border border-slate-100 max-w-lg mx-auto md:mx-0">
                    <img src={q.imageUrl} alt={`Soal ${idx + 1}`} className="w-full h-auto object-contain" />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Object.keys(q.options) as OptionKey[]).map(key => (
                    <button
                      key={key}
                      onClick={() => handleSelect(q.id, key)}
                      className={`flex items-center p-4 rounded-xl border text-left transition-all ${
                        answers[q.id] === key 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100' 
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mr-3 transition-colors ${
                        answers[q.id] === key ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {key}
                      </span>
                      <span className="flex-grow">{q.options[key]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 mb-20 flex justify-center">
        {!isConfirming ? (
          <button 
            onClick={() => setIsConfirming(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-200 transition-all flex items-center gap-2 active:scale-95"
          >
            Selesaikan Ujian
          </button>
        ) : (
          <div className="bg-white p-6 rounded-2xl border-2 border-orange-400 shadow-2xl max-w-md w-full animate-bounce-short">
            <h4 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi Pengumpulan</h4>
            <p className="text-slate-600 mb-4">
              {unansweredCount > 0 
                ? `Masih ada ${unansweredCount} soal yang belum Anda jawab. Yakin ingin mengumpulkan?` 
                : "Apakah Anda sudah yakin dengan seluruh jawaban Anda?"}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsConfirming(false)}
                className="flex-grow py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
              >
                Cek Lagi
              </button>
              <button 
                onClick={() => onSubmit(answers)}
                className="flex-grow py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamView;
