import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { BarcodeScannerModal } from './components/common/BarcodeScannerModal';

import { DashboardView } from './views/DashboardView';
import { ProductsView } from './views/ProductsView';
import { ReceiptsView } from './views/ReceiptsView';
import { DeliveriesView } from './views/DeliveriesView';
import { TransfersView } from './views/TransfersView';
import { AdjustmentsView } from './views/AdjustmentsView';
import { LedgerView } from './views/LedgerView';
import { SettingsView } from './views/SettingsView';
import { ProfileView } from './views/ProfileView';

const MainLayout: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView setActiveView={setActiveView} />;
      case 'products':
        return <ProductsView />;
      case 'receipts':
        return <ReceiptsView />;
      case 'deliveries':
        return <DeliveriesView />;
      case 'transfers':
        return <TransfersView />;
      case 'adjustments':
        return <AdjustmentsView />;
      case 'ledger':
        return <LedgerView />;
      case 'settings':
        return <SettingsView />;
      case 'profile':
        return <ProfileView onOpenAuth={() => setIsAuthModalOpen(true)} />;
      default:
        return <DashboardView setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="app-container">
      {/* Left Navigation Sidebar */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onOpenAuth={() => setIsAuthModalOpen(true)} 
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Header 
          activeView={activeView} 
          onOpenAuth={() => setIsAuthModalOpen(true)} 
        />
        
        <main className="page-body animate-fade-in">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      
      <BarcodeScannerModal />
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
