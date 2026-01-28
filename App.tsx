
import React, { useState, useEffect } from 'react';
import { AppView, StudentInfo, Subject, Question, ExamResult, UserAnswers } from './types';
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

  useEffect(() => {
    setQuestions(storageService.getQuestions());
  }, []);

  const handleStudentStart = (info: StudentInfo, subject: Subject, pkg: string) => {
    setStudentInfo(info);
    setSelectedSubject(subject);
    setSelectedPackage(pkg);
    setView('STUDENT_EXAM');
  };

  const handleExamSubmit = (answers: UserAnswers) => {
    if (!studentInfo || !selectedSubject) return;

    const filteredQuestions = questions.filter(
      q => q.subject === selectedSubject && q.package === selectedPackage
    );

    let correctCount = 0;
    filteredQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const total = filteredQuestions.length;
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
    switch (view) {
      case 'STUDENT_LOGIN':
        return <StudentLogin onStart={handleStudentStart} />;
      case 'STUDENT_EXAM':
        return (
          <ExamView 
            subject={selectedSubject!} 
            pkg={selectedPackage} 
            questions={questions.filter(q => q.subject === selectedSubject && q.package === selectedPackage)}
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
            onLogout={() => setView('STUDENT_LOGIN')} 
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
