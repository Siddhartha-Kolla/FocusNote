import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Landing } from './components/pages/Landing';
import { Features } from './components/pages/Features';
import { Demo } from './components/pages/Demo';
import { Dashboard } from './components/pages/Dashboard';
import { Timetable } from './components/pages/Timetable';
import { MockExam } from './components/pages/MockExam';
import { About } from './components/pages/About';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Landing onNavigate={handleNavigate} />;
      case 'features':
        return <Features />;
      case 'demo':
        return <Demo onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard />;
      case 'timetable':
        return <Timetable />;
      case 'mockexam':
        return <MockExam onNavigate={handleNavigate} />;
      case 'about':
        return <About />;
      default:
        return <Landing onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-1">
        {renderCurrentPage()}
      </main>
      <Footer />
    </div>
  );
}