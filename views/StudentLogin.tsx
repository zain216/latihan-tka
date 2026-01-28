
import React, { useState, useEffect } from 'react';
import { Subject, StudentInfo, SchoolSettings } from '../types';
import { CLASSES, PACKAGES } from '../constants';
import { storageService } from '../services/storageService';

interface StudentLoginProps {
  onStart: (info: StudentInfo, subject: Subject, pkg: string) => void;
}

const StudentLogin: React.FC<StudentLoginProps> = ({ onStart }) => {
  const [nis, setNis] = useState('');
  const [name, setName] = useState('');
  const [className, setClassName] = useState(CLASSES[0]);
  const [subject, setSubject] = useState<Subject>(Subject.MATEMATIKA);
  const [pkg, setPkg] = useState(PACKAGES[0]);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);

  useEffect(() => {
    setSettings(storageService.getSettings());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis || !name) return alert('Mohon lengkapi seluruh data.');
    onStart({ nis, name, className }, subject, pkg);
  };

  const currentSettings = settings || {
    logoUrl: "https://raw.githubusercontent.com/ai-code-images/assets/main/smpn216.jpg",
    academicYear: "2024/2025"
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 mt-4">
      <div className="bg-blue-600 py-8 px-8 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-blue-400 rounded-full opacity-20 blur-xl"></div>
        
        <div className="relative z-10">
          <img 
            src={currentSettings.logoUrl} 
            alt="Logo" 
            className="w-20 h-20 mx-auto mb-4 bg-white p-1 rounded-full shadow-lg object-contain"
          />
          <h2 className="text-2xl font-bold">Latihan TKA</h2>
          <p className="text-blue-100 text-xs opacity-90 mt-1 uppercase tracking-wider font-semibold">Tahun Pelajaran {currentSettings.academicYear}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Nomor Induk Siswa (NIS)</label>
            <input 
              type="text" 
              required 
              placeholder="Masukkan NIS Anda"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50"
              value={nis}
              onChange={(e) => setNis(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Nama Lengkap</label>
            <input 
              type="text" 
              required 
              placeholder="Masukkan nama lengkap"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Kelas</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            >
              {CLASSES.map(c => <option key={c} value={c}>Kelas {c}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider text-center">Pilih Mata Pelajaran</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSubject(Subject.MATEMATIKA)}
              className={`py-4 px-2 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-2 ${subject === Subject.MATEMATIKA ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <span className="text-xl">📐</span>
              Matematika
            </button>
            <button
              type="button"
              onClick={() => setSubject(Subject.BAHASA_INDONESIA)}
              className={`py-4 px-2 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-2 ${subject === Subject.BAHASA_INDONESIA ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <span className="text-xl">🇮🇩</span>
              B. Indonesia
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Pilih Paket Soal</label>
          <select 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-semibold text-slate-700"
            value={pkg}
            onChange={(e) => setPkg(e.target.value)}
          >
            {PACKAGES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-3"
        >
          <span>🚀</span> Mulai Ujian Sekarang
        </button>
      </form>
    </div>
  );
};

export default StudentLogin;
