
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { SchoolSettings } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onAdminClick?: () => void;
  isAdmin?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, onAdminClick, isAdmin }) => {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);

  useEffect(() => {
    setSettings(storageService.getSettings());
    // Listen for storage changes to update UI immediately if admin changes settings
    const handleStorageChange = () => setSettings(storageService.getSettings());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Use a fallback for initial render
  const currentSettings = settings || {
    schoolName: "Latihan TKA SMP Negeri 216 Jakarta",
    motto: "Unggul dalam Prestasi, Santun dalam Budi Pekerti",
    logoUrl: "https://raw.githubusercontent.com/ai-code-images/assets/main/smpn216.jpg"
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-blue-800 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-1 rounded-full w-12 h-12 flex items-center justify-center overflow-hidden shadow-inner">
              <img 
                src={currentSettings.logoUrl} 
                alt="Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/48?text=216";
                }}
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight leading-tight">
                {currentSettings.schoolName}
              </h1>
              <p className="text-[10px] sm:text-xs text-blue-100 opacity-80 hidden sm:block uppercase tracking-widest font-medium">
                {currentSettings.motto}
              </p>
            </div>
          </div>
          
          {onAdminClick && (
            <button 
              onClick={onAdminClick}
              className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border border-blue-500/30 flex items-center gap-2"
            >
              {isAdmin ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Panel Admin
                </>
              ) : (
                'Admin Login'
              )}
            </button>
          )}
        </div>
      </header>
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <div className="flex items-center gap-2 font-medium">
             <img src={currentSettings.logoUrl} alt="" className="w-5 h-5 opacity-50" />
             {currentSettings.schoolName}
          </div>
          <div className="text-xs">
            &copy; {new Date().getFullYear()} - Sistem Latihan Kompetensi Akademik
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
