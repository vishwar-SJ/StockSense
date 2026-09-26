import React, { useState } from 'react';
import { InventoryProvider } from './context/InventoryContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './views/DashboardView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView setActiveView={setActiveView} />;
      case 'profile':
        return <ProfileView onOpenAuth={() => setIsAuthModalOpen(true)} />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', textTransform: 'capitalize' }}>{activeView} Module</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              This module file is deleted from main branch so your teammate can upload it as a new file.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onOpenAuth={() => setIsAuthModalOpen(true)} 
      />

      <div className="main-content">
        <Header 
          activeView={activeView} 
          onOpenAuth={() => setIsAuthModalOpen(true)} 
        />
        
        <main className="page-body animate-fade-in">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <InventoryProvider>
      <MainLayout />
    </InventoryProvider>
  );
};

export default App;
