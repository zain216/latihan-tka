
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
    refreshData();
  }, []);

  const refreshData = () => {
    setResults(storageService.getResults());
    setQuestions(storageService.getQuestions());
    setSettings(storageService.getSettings());
  };

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
      logoUrl: settings?.logoUrl || '',
      remoteSyncUrl: formData.get('remoteSyncUrl') as string
    };
    storageService.saveSettings(updated);
    setSettings(updated);
    alert('Pengaturan berhasil disimpan!');
    window.dispatchEvent(new Event('storage'));
  };

  const exportData = () => {
    const backup = {
      questions,
      settings,
      timestamp: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `TKA_Backup_${new Date().toLocaleDateString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.questions && imported.settings) {
          if (confirm('Unggah data baru akan menimpa data lokal. Lanjutkan?')) {
            storageService.saveQuestions(imported.questions);
            storageService.saveSettings(imported.settings);
            refreshData();
            onUpdateQuestions();
            alert('Data berhasil diimpor!');
            window.dispatchEvent(new Event('storage'));
          }
        } else {
          alert('Format file tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Dashboard Control</h2>
          <p className="text-slate-500 font-medium">Latihan TKA SMP Negeri 216 Jakarta</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={exportData}
            className="flex-grow md:flex-none bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl font-bold transition-all text-sm border border-blue-200"
            title="Ekspor data untuk di-host di Cloud"
          >
            💾 Ekspor JSON
          </button>
          <button 
            onClick={onLogout}
            className="flex-grow md:flex-none bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl font-bold transition-all text-sm border border-red-200"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 w-fit">
        <button onClick={() => setActiveTab('RESULTS')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'RESULTS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>Data Hasil</button>
        <button onClick={() => setActiveTab('QUESTIONS')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'QUESTIONS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>Bank Soal</button>
        <button onClick={() => setActiveTab('SETTINGS')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'SETTINGS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}>Sync & Branding</button>
      </div>

      {activeTab === 'RESULTS' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><span>🔍</span> Filter Data</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <select className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                <option value="">Semua Kelas</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                <option value="">Semua Mapel</option>
                <option value={Subject.MATEMATIKA}>{Subject.MATEMATIKA}</option>
                <option value={Subject.BAHASA_INDONESIA}>{Subject.BAHASA_INDONESIA}</option>
              </select>
              <select className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none" value={filterPackage} onChange={(e) => setFilterPackage(e.target.value)}>
                <option value="">Semua Paket</option>
                {PACKAGES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Siswa</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Kelas</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Mapel</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Skor</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{res.studentName}</div>
                      <div className="text-xs text-slate-400 font-mono">NIS: {res.nis}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{res.className}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-tighter">{res.subject}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-black text-lg ${res.score >= 75 ? 'text-green-600' : 'text-slate-800'}`}>{res.score}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-3">
                        <button onClick={() => handleDeleteResult(res.id)} className="text-slate-300 hover:text-red-600 transition-colors">🗑️</button>
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
          <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Bank Soal ({questions.length})</h3>
              <p className="text-xs text-slate-400">Hanya 20 soal acak yang akan muncul di siswa</p>
            </div>
            <button onClick={() => { setEditingQuestion(null); setQImageBase64(''); setShowQuestionModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all">Tambah Soal</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map(q => (
              <div key={q.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col group hover:border-blue-400 transition-all">
                <div className="flex justify-between mb-4">
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg text-slate-500 uppercase">{q.subject} • {q.package}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingQuestion(q); setQImageBase64(q.imageUrl || ''); setShowQuestionModal(true); }} className="text-slate-400 hover:text-blue-600">✏️</button>
                    <button onClick={() => handleDeleteQuestion(q.id)} className="text-slate-400 hover:text-red-600">🗑️</button>
                  </div>
                </div>
                {q.imageUrl && <img src={q.imageUrl} className="w-full h-32 object-contain rounded-xl mb-4 bg-slate-50 border border-slate-100" alt="Soal" />}
                <p className="text-slate-800 font-semibold line-clamp-3 mb-4">{q.number}. {q.text}</p>
                <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Kunci:</span>
                  <span className="font-black text-green-600 text-sm bg-green-50 px-3 py-1 rounded-lg">{q.correctAnswer}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'SETTINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><span>🔄</span> Sinkronisasi Cloud</h3>
            <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl mb-6">
              <p className="text-sm text-blue-800 leading-relaxed font-medium">
                Siswa akan mendapatkan pembaruan otomatis jika Anda memasukkan tautan file JSON publik di sini.
              </p>
            </div>
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Tautan Sinkronisasi (Remote JSON URL)</label>
                <input 
                  name="remoteSyncUrl" 
                  defaultValue={settings?.remoteSyncUrl} 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs" 
                  placeholder="https://raw.githubusercontent.com/.../data.json"
                />
                <p className="text-[10px] text-slate-400 mt-2">Gunakan Direct Link dari Google Drive atau GitHub Gist.</p>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 mb-4">Identitas Sekolah</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Nama Sekolah</label>
                    <input name="schoolName" defaultValue={settings?.schoolName} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Moto</label>
                    <input name="motto" defaultValue={settings?.motto} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Tahun Pelajaran</label>
                    <input name="academicYear" defaultValue={settings?.academicYear} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" required />
                  </div>
                </div>
              </div>
              
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Simpan Konfigurasi</button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><span>🖼️</span> Logo & Media</h3>
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                {settings?.logoUrl ? (
                  <img src={settings.logoUrl} className="w-full h-full object-contain p-2" alt="Logo Preview" />
                ) : (
                  <span className="text-slate-300 text-xs font-bold">No Logo</span>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, (b64) => setSettings(prev => prev ? {...prev, logoUrl: b64} : null))} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700">Logo Instansi</p>
                <p className="text-xs text-slate-400 mt-1">Klik gambar untuk mengganti logo sekolah</p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><span>📥</span> Impor Cadangan Lokal</h4>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">Gunakan fitur ini untuk memulihkan bank soal dari file JSON di komputer Anda.</p>
              <label className="block w-full py-3 bg-white border border-slate-300 text-slate-700 text-center rounded-xl font-bold cursor-pointer hover:bg-slate-100 transition-all shadow-sm">
                Pilih File JSON
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Modal Soal tetep sama dengan penambahan styling sedikit */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-200">
            <form onSubmit={handleSaveQuestion} className="p-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-800">{editingQuestion ? 'Edit Butir Soal' : 'Soal Baru'}</h3>
                <button type="button" onClick={() => setShowQuestionModal(false)} className="text-slate-300 hover:text-red-500 text-3xl font-light">×</button>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Nomor</label>
                  <input name="number" type="number" defaultValue={editingQuestion?.number || questions.length + 1} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Mata Pelajaran</label>
                  <select name="subject" defaultValue={editingQuestion?.subject} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value={Subject.MATEMATIKA}>{Subject.MATEMATIKA}</option>
                    <option value={Subject.BAHASA_INDONESIA}>{Subject.BAHASA_INDONESIA}</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Paket</label>
                <select name="package" defaultValue={editingQuestion?.package} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold">
                  {PACKAGES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Visual Soal (Opsional)</label>
                <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setQImageBase64)} className="text-[10px] file:bg-blue-600 file:text-white file:border-none file:px-3 file:py-1 file:rounded-md file:mr-4 file:font-bold" />
                  {qImageBase64 && (
                    <div className="relative">
                      <img src={qImageBase64} className="w-16 h-16 object-cover rounded-lg border shadow-sm" alt="Preview" />
                      <button type="button" onClick={() => setQImageBase64('')} className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-[10px] font-bold">×</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Pertanyaan</label>
                <textarea name="text" defaultValue={editingQuestion?.text} className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-28 leading-relaxed font-medium" placeholder="Tuliskan teks soal di sini..." required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <input name="optA" placeholder="Pilihan A" defaultValue={editingQuestion?.options.A} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500" required />
                <input name="optB" placeholder="Pilihan B" defaultValue={editingQuestion?.options.B} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500" required />
                <input name="optC" placeholder="Pilihan C" defaultValue={editingQuestion?.options.C} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500" required />
                <input name="optD" placeholder="Pilihan D" defaultValue={editingQuestion?.options.D} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500" required />
              </div>

              <div className="mb-10">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest text-green-600">Jawaban Benar</label>
                <select name="correctAnswer" defaultValue={editingQuestion?.correctAnswer} className="w-full p-4 border border-green-200 bg-green-50 rounded-xl outline-none font-black text-green-700">
                  <option value="A">Pilihan A</option>
                  <option value="B">Pilihan B</option>
                  <option value="C">Pilihan C</option>
                  <option value="D">Pilihan D</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setShowQuestionModal(false)} className="flex-grow py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Batal</button>
                <button type="submit" className="flex-grow py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100">Simpan Butir Soal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
