
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
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{subject} - {pkg}</h2>
          <p className="text-slate-500">Siswa: <span className="font-semibold text-blue-700">{studentName}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 text-center">
            <span className="block text-[10px] font-bold text-blue-400 uppercase">Progres</span>
            <span className="text-lg font-black text-blue-800">
              {Object.keys(answers).length} / {questions.length}
            </span>
          </div>
          <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 text-center">
            <span className="block text-[10px] font-bold text-orange-400 uppercase">Limit</span>
            <span className="text-lg font-black text-orange-800">Max 20</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-20"></div>
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                {idx + 1}
              </span>
              <div className="flex-grow">
                <p className="text-lg text-slate-800 mb-6 font-medium leading-relaxed">{q.text}</p>
                
                {q.imageUrl && (
                  <div className="mb-6 rounded-xl overflow-hidden border border-slate-100 max-w-2xl bg-slate-50 p-2">
                    <img src={q.imageUrl} alt={`Visual Soal ${idx + 1}`} className="w-full h-auto object-contain max-h-[400px] rounded-lg" />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Object.keys(q.options) as OptionKey[]).map(key => (
                    <button
                      key={key}
                      onClick={() => handleSelect(q.id, key)}
                      className={`flex items-center p-4 rounded-xl border text-left transition-all group ${
                        answers[q.id] === key 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mr-3 transition-colors ${
                        answers[q.id] === key ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50'
                      }`}>
                        {key}
                      </span>
                      <span className="flex-grow font-medium">{q.options[key]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        {!isConfirming ? (
          <button 
            onClick={() => setIsConfirming(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-green-100 transition-all flex items-center gap-3 active:scale-95"
          >
            <span>✅</span> Selesaikan Ujian
          </button>
        ) : (
          <div className="bg-white p-8 rounded-3xl border-2 border-orange-400 shadow-2xl max-w-md w-full">
            <h4 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span className="text-orange-500">⚠️</span> Konfirmasi
            </h4>
            <p className="text-slate-600 mb-6">
              {unansweredCount > 0 
                ? `Terdapat ${unansweredCount} soal yang belum terjawab. Tetap kumpulkan jawaban Anda?` 
                : "Apakah Anda sudah memeriksa semua jawaban dan yakin ingin mengakhiri ujian?"}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsConfirming(false)}
                className="flex-grow py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cek Kembali
              </button>
              <button 
                onClick={() => onSubmit(answers)}
                className="flex-grow py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-100"
              >
                Ya, Selesai
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamView;
