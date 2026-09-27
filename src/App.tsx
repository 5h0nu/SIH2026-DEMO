import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { CitizenView } from './components/citizen/CitizenView';
import { CollectorView } from './components/collector/CollectorView';
import { AdminView } from './components/admin/AdminView';
import { BookingModal } from './components/modals/BookingModal';
import { GroqSettingsModal } from './components/modals/GroqSettingsModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { EprModal } from './components/modals/EprModal';
import { GreenRewardsModal } from './components/citizen/GreenRewardsModal';
import { GreenCertificateModal } from './components/modals/GreenCertificateModal';
import { SetuAiChatModal } from './components/chat/SetuAiChatModal';
import { ToastContainer } from './components/ToastContainer';
import { Recycle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { role } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Persistent Navigation Header */}
      <Header />

      {/* Main Role Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {role === 'citizen' && <CitizenView />}
        {role === 'collector' && <CollectorView />}
        {role === 'admin' && <AdminView />}
      </main>

      {/* Interactive Global Modals */}
      <BookingModal />
      <GroqSettingsModal />
      <PaymentModal />
      <EprModal />
      <GreenRewardsModal />
      <GreenCertificateModal />
      <SetuAiChatModal />

      {/* Toast Popups */}
      <ToastContainer />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Recycle className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-slate-800">RecycleSetu</span>
            <span className="text-slate-400">•</span>
            <span>Smart India Hackathon (SIH) Circular Dry Waste Prototype</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span>MoHUA &amp; CPCB Guidelines Aligned</span>
            <span>•</span>
            <span>ESP32 BLE IoT Integration</span>
            <span>•</span>
            <span>Groq Llama 3.3 Mandi Index</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
