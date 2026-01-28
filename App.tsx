
import React, { useState, useEffect } from 'react';
import { AppView, StudentInfo, Subject, Question, ExamResult, UserAnswers, SchoolSettings } from './types';
import Layout from './components/Layout';
import StudentLogin from './views/StudentLogin';
import ExamView from './views/ExamView';
import ResultView from './views/ResultView';
import AdminLogin from './views/AdminLogin';
import AdminDashboard from './views/AdminDashboard';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('STUDENT_LOGIN');
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>('Paket 1');
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeExamQuestions, setActiveExamQuestions] = useState<Question[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const initData = async () => {
      setIsSyncing(true);
      const settings = storageService.getSettings();
      
      // Auto-Sync if remote URL is provided
      if (settings.remoteSyncUrl) {
        try {
          const response = await fetch(settings.remoteSyncUrl);
          if (response.ok) {
            const remoteData = await response.json();
            if (remoteData.questions && remoteData.settings) {
              storageService.saveQuestions(remoteData.questions);
              storageService.saveSettings(remoteData.settings);
              // Trigger storage event for Layout component
              window.dispatchEvent(new Event('storage'));
            }
          }
        } catch (error) {
          console.error('Failed to sync remote data:', error);
        }
      }
      
      setQuestions(storageService.getQuestions());
      setIsSyncing(false);
    };

    initData();
  }, []);

  const handleStudentStart = (info: StudentInfo, subject: Subject, pkg: string) => {
    // Filter questions by subject and package
    const filtered = questions.filter(q => q.subject === subject && q.package === pkg);
    
    // Shuffle all available questions
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    
    // STRICT LIMIT: Only take max 20 questions
    const limited = shuffled.slice(0, 20);
    
    setStudentInfo(info);
    setSelectedSubject(subject);
    setSelectedPackage(pkg);
    setActiveExamQuestions(limited);
    setView('STUDENT_EXAM');
  };

  const handleExamSubmit = (answers: UserAnswers) => {
    if (!studentInfo || !selectedSubject) return;

    let correctCount = 0;
    activeExamQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const total = activeExamQuestions.length;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const wrongCount = total - correctCount;

    const result: ExamResult = {
      id: crypto.randomUUID(),
      nis: studentInfo.nis,
      studentName: studentInfo.name,
      className: studentInfo.className,
      subject: selectedSubject,
      package: selectedPackage,
      score,
      correctCount,
      wrongCount,
      totalQuestions: total,
      timestamp: new Date().toISOString()
    };

    storageService.saveResult(result);
    setExamResult(result);
    setView('STUDENT_RESULT');
  };

  const handleAdminAuth = () => {
    setView('ADMIN_DASHBOARD');
  };

  const navigateToAdmin = () => {
    if (view === 'ADMIN_DASHBOARD') {
      setView('ADMIN_DASHBOARD');
    } else {
      setView('ADMIN_LOGIN');
    }
  };

  const renderView = () => {
    if (isSyncing) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium animate-pulse">Menyelaraskan data soal terbaru...</p>
        </div>
      );
    }

    switch (view) {
      case 'STUDENT_LOGIN':
        return <StudentLogin onStart={handleStudentStart} />;
      case 'STUDENT_EXAM':
        return (
          <ExamView 
            subject={selectedSubject!} 
            pkg={selectedPackage} 
            questions={activeExamQuestions}
            onSubmit={handleExamSubmit}
            studentName={studentInfo?.name || ''}
          />
        );
      case 'STUDENT_RESULT':
        return <ResultView result={examResult!} onFinish={() => setView('STUDENT_LOGIN')} />;
      case 'ADMIN_LOGIN':
        return <AdminLogin onLogin={handleAdminAuth} onBack={() => setView('STUDENT_LOGIN')} />;
      case 'ADMIN_DASHBOARD':
        return (
          <AdminDashboard 
            onLogout={() => {
              setQuestions(storageService.getQuestions());
              setView('STUDENT_LOGIN');
            }} 
            onUpdateQuestions={() => setQuestions(storageService.getQuestions())}
          />
        );
      default:
        return <StudentLogin onStart={handleStudentStart} />;
    }
  };

  return (
    <Layout onAdminClick={navigateToAdmin} isAdmin={view === 'ADMIN_DASHBOARD'}>
      {renderView()}
    </Layout>
  );
};

export default App;
