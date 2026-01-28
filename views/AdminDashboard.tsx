
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { ExamResult, Question, Subject, OptionKey, SchoolSettings } from '../types';
import { CLASSES, PACKAGES } from '../constants';

interface AdminDashboardProps {
  onLogout: () => void;
  onUpdateQuestions: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onUpdateQuestions }) => {
  const [activeTab, setActiveTab] = useState<'RESULTS' | 'QUESTIONS' | 'SETTINGS'>('RESULTS');
  const [results, setResults] = useState<ExamResult[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  
  // Filter states
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterPackage, setFilterPackage] = useState('');

  // Question Form
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [qImageBase64, setQImageBase64] = useState<string>('');

  // Result Editing State
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [editScoreValue, setEditScoreValue] = useState<number>(0);

  useEffect(() => {
    setResults(storageService.getResults());
    setQuestions(storageService.getQuestions());
    setSettings(storageService.getSettings());
  }, []);

  const handleDeleteResult = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data hasil ini?')) {
      storageService.deleteResult(id);
      setResults(storageService.getResults());
    }
  };

  const handleEditResult = (res: ExamResult) => {
    setEditingResultId(res.id);
    setEditScoreValue(res.score);
  };

  const saveEditedResult = (res: ExamResult) => {
    storageService.updateResult({ ...res, score: editScoreValue });
    setResults(storageService.getResults());
    setEditingResultId(null);
  };

  const filteredResults = results.filter(r => {
    return (!filterClass || r.className === filterClass) &&
           (!filterSubject || r.subject === filterSubject) &&
           (!filterPackage || r.package === filterPackage);
  });

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Hapus soal ini?')) {
      const updated = questions.filter(q => q.id !== id);
      storageService.saveQuestions(updated);
      setQuestions(updated);
      onUpdateQuestions();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveQuestion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newQuestion: Question = {
      id: editingQuestion?.id || crypto.randomUUID(),
      number: parseInt(formData.get('number') as string),
      text: formData.get('text') as string,
      imageUrl: qImageBase64 || editingQuestion?.imageUrl,
      options: {
        A: formData.get('optA') as string,
        B: formData.get('optB') as string,
        C: formData.get('optC') as string,
        D: formData.get('optD') as string,
      },
      correctAnswer: formData.get('correctAnswer') as OptionKey,
      subject: formData.get('subject') as Subject,
      package: formData.get('package') as string,
    };

    let updatedQuestions;
    if (editingQuestion) {
      updatedQuestions = questions.map(q => q.id === editingQuestion.id ? newQuestion : q);
    } else {
      updatedQuestions = [...questions, newQuestion];
    }

    storageService.saveQuestions(updatedQuestions);
    setQuestions(updatedQuestions);
    setShowQuestionModal(false);
    setEditingQuestion(null);
    setQImageBase64('');
    onUpdateQuestions();
  };

  const handleSaveSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updated: SchoolSettings = {
      schoolName: formData.get('schoolName') as string,
      motto: formData.get('motto') as string,
      academicYear: formData.get('academicYear') as string,
      logoUrl: settings?.logoUrl || ''
    };
    storageService.saveSettings(updated);
    setSettings(updated);
    alert('Pengaturan berhasil disimpan!');
    // Trigger layout update
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Dashboard Admin</h2>
          <p className="text-slate-500">Kelola soal, hasil latihan, dan branding sekolah</p>
        </div>
        <button 
          onClick={onLogout}
          className="bg-red-50 text-red-600 hover:bg-red-100 px-6 py-2 rounded-xl font-bold transition-all border border-red-200"
        >
          Keluar Admin
        </button>
      </div>

      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 w-fit">
        <button 
          onClick={() => setActiveTab('RESULTS')}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'RESULTS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Data Hasil
        </button>
        <button 
          onClick={() => setActiveTab('QUESTIONS')}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'QUESTIONS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Bank Soal
        </button>
        <button 
          onClick={() => setActiveTab('SETTINGS')}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'SETTINGS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Pengaturan
        </button>
      </div>

      {activeTab === 'RESULTS' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>🔍</span> Filter Data
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <select className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                <option value="">Semua Kelas</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                <option value="">Semua Mapel</option>
                <option value={Subject.MATEMATIKA}>{Subject.MATEMATIKA}</option>
                <option value={Subject.BAHASA_INDONESIA}>{Subject.BAHASA_INDONESIA}</option>
              </select>
              <select className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50" value={filterPackage} onChange={(e) => setFilterPackage(e.target.value)}>
                <option value="">Semua Paket</option>
                {PACKAGES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">NIS & Nama</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mapel</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Nilai</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{res.studentName}</div>
                      <div className="text-xs text-slate-400">NIS: {res.nis}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{res.className}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{res.subject}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingResultId === res.id ? (
                        <input type="number" className="w-16 border rounded px-1 text-center" value={editScoreValue} onChange={(e) => setEditScoreValue(parseInt(e.target.value))} />
                      ) : (
                        <span className="font-black text-lg">{res.score}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                        {editingResultId === res.id ? (
                          <button onClick={() => saveEditedResult(res)} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Save</button>
                        ) : (
                          <button onClick={() => handleEditResult(res)} className="text-slate-400 hover:text-blue-600">✏️</button>
                        )}
                        <button onClick={() => handleDeleteResult(res.id)} className="text-slate-400 hover:text-red-600">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'QUESTIONS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">Manajemen Soal</h3>
            <button onClick={() => { setEditingQuestion(null); setQImageBase64(''); setShowQuestionModal(true); }} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-100">Tambah Soal</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map(q => (
              <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                <div className="flex justify-between mb-4">
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{q.subject} • {q.package}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingQuestion(q); setQImageBase64(q.imageUrl || ''); setShowQuestionModal(true); }} className="text-slate-400 hover:text-blue-600">✏️</button>
                    <button onClick={() => handleDeleteQuestion(q.id)} className="text-slate-400 hover:text-red-600">🗑️</button>
                  </div>
                </div>
                {q.imageUrl && <img src={q.imageUrl} className="w-full h-32 object-cover rounded-lg mb-4" alt="Soal" />}
                <p className="text-slate-800 font-medium line-clamp-2">{q.number}. {q.text}</p>
                <div className="mt-4 pt-4 border-t border-slate-50 text-xs text-slate-400 flex justify-between">
                  <span>Kunci: <span className="font-bold text-green-600">{q.correctAnswer}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'SETTINGS' && (
        <div className="max-w-2xl bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Pengaturan Branding</h3>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                {settings?.logoUrl ? (
                  <img src={settings.logoUrl} className="w-full h-full object-contain" alt="Logo" />
                ) : (
                  <span className="text-slate-400 text-xs">Pilih Logo</span>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, (b64) => setSettings(prev => prev ? {...prev, logoUrl: b64} : null))} />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-bold text-slate-700">Logo Sekolah</p>
                <p className="text-xs text-slate-400">Gunakan format PNG atau JPG (Kotak 1:1 direkomendasikan)</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nama Sekolah</label>
              <input name="schoolName" defaultValue={settings?.schoolName} className="w-full px-4 py-2 border rounded-xl" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Moto / Slogan</label>
              <input name="motto" defaultValue={settings?.motto} className="w-full px-4 py-2 border rounded-xl" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tahun Pelajaran</label>
              <input name="academicYear" defaultValue={settings?.academicYear} className="w-full px-4 py-2 border rounded-xl" required />
            </div>
            
            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100">Simpan Perubahan</button>
          </form>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <form onSubmit={handleSaveQuestion} className="p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">{editingQuestion ? 'Edit Soal' : 'Tambah Soal'}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nomor</label>
                  <input name="number" type="number" defaultValue={editingQuestion?.number || questions.length + 1} className="w-full p-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mata Pelajaran</label>
                  <select name="subject" defaultValue={editingQuestion?.subject} className="w-full p-2 border rounded-lg">
                    <option value={Subject.MATEMATIKA}>{Subject.MATEMATIKA}</option>
                    <option value={Subject.BAHASA_INDONESIA}>{Subject.BAHASA_INDONESIA}</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Paket Soal</label>
                <select name="package" defaultValue={editingQuestion?.package} className="w-full p-2 border rounded-lg">
                  {PACKAGES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Gambar Soal (Opsional)</label>
                <div className="flex items-center gap-4">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setQImageBase64)} className="text-xs" />
                  {qImageBase64 && (
                    <div className="relative">
                      <img src={qImageBase64} className="w-20 h-20 object-cover rounded border" alt="Preview" />
                      <button type="button" onClick={() => setQImageBase64('')} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-[10px]">X</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Teks Soal</label>
                <textarea name="text" defaultValue={editingQuestion?.text} className="w-full p-2 border rounded-lg h-24" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input name="optA" placeholder="Opsi A" defaultValue={editingQuestion?.options.A} className="w-full p-2 border rounded-lg" required />
                <input name="optB" placeholder="Opsi B" defaultValue={editingQuestion?.options.B} className="w-full p-2 border rounded-lg" required />
                <input name="optC" placeholder="Opsi C" defaultValue={editingQuestion?.options.C} className="w-full p-2 border rounded-lg" required />
                <input name="optD" placeholder="Opsi D" defaultValue={editingQuestion?.options.D} className="w-full p-2 border rounded-lg" required />
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Jawaban Benar</label>
                <select name="correctAnswer" defaultValue={editingQuestion?.correctAnswer} className="w-full p-2 border rounded-lg">
                  <option value="A">Opsi A</option>
                  <option value="B">Opsi B</option>
                  <option value="C">Opsi C</option>
                  <option value="D">Opsi D</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowQuestionModal(false)} className="px-6 py-2 bg-slate-100 rounded-xl font-bold">Batal</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Simpan Soal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
