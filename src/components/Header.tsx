import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Recycle,
  Home,
  Truck,
  ShieldCheck,
  Globe,
  RotateCcw,
  Key,
  Clock,
  Coins,
  Bot
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    language,
    toggleLanguage,
    resetDemoData,
    openGroqModal,
    openChatModal,
    openRewardsModal,
    swachhPoints,
    groqKey,
    orders
  } = useApp();

  const pendingApprovalsCount = orders.filter(o => o.status === 'pending_admin_approval').length;
  const availableLeadsCount = orders.filter(o => o.status === 'collector_assigned').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo & Hackathon Tag */}
          <div
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer shrink-0"
            onClick={() => setRole('citizen')}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20 transform transition hover:scale-105 shrink-0">
              <Recycle className="w-5 h-5 sm:w-6 sm:h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold text-lg sm:text-2xl tracking-tight bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-600 bg-clip-text text-transparent">
                  RecycleSetu
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                  SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden lg:block">
                {language === 'hi'
                  ? 'स्मार्ट कबाड़ीवाला एवं नगरीय चक्रीय अपशिष्ट मंच'
                  : 'Smart Informal Waste Integration & Circular Logistics'}
              </p>
            </div>
          </div>

          {/* Desktop Persistent Role Switcher Tabs (hidden on phone, shown on md+) */}
          <div className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-inner">
            {/* Citizen Tab */}
            <button
              onClick={() => setRole('citizen')}
              className={`relative flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                role === 'citizen'
                  ? 'bg-white shadow-md text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{language === 'hi' ? 'नागरिक पोर्टल' : 'Resident Portal'}</span>
            </button>

            {/* Collector Tab */}
            <button
              onClick={() => setRole('collector')}
              className={`relative flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                role === 'collector'
                  ? 'bg-white shadow-md text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>{language === 'hi' ? 'कबाड़ीवाला पोर्टल' : 'Collector'}</span>
              {availableLeadsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white animate-pulse">
                  {availableLeadsCount}
                </span>
              )}
            </button>

            {/* Admin Tab */}
            <button
              onClick={() => setRole('admin')}
              className={`relative flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                role === 'admin'
                  ? 'bg-white shadow-md text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'hi' ? 'नगर निगम (ULB)' : 'Admin / ULB'}</span>
              {pendingApprovalsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-bounce">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Action Tools: SetuAI, Rewards, Groq Key, Language, Reset */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {/* SetuAI Assistant Button */}
            <button
              onClick={openChatModal}
              title="Ask SetuAI Assistant"
              className="flex items-center space-x-1 sm:space-x-1.5 text-xs font-bold px-2 sm:px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 shadow-sm transition active:scale-95"
            >
              <Bot className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Ask SetuAI</span>
            </button>

            {/* Swachh Rewards Store Button */}
            <button
              onClick={openRewardsModal}
              title="Open Swachh Green Points Rewards Store"
              className="flex items-center space-x-1 text-xs font-bold px-2 sm:px-2.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 shadow-sm transition"
            >
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[11px] sm:text-xs font-extrabold">{swachhPoints}</span>
              <span className="hidden sm:inline text-[10px]">Pts</span>
            </button>

            {/* Groq AI Status Pill */}
            <button
              onClick={openGroqModal}
              title="Configure Groq AI (Llama 3.3 Scrap Mandi & Llama 3.2 Vision)"
              className="flex items-center space-x-1 sm:space-x-1.5 text-xs font-semibold px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50 shadow-sm transition group"
            >
              <Key className="w-3.5 h-3.5 text-emerald-600 group-hover:rotate-12 transition" />
              <span className="hidden xl:inline text-[11px]">
                {groqKey ? 'Groq Active' : 'Groq AI'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  groqKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </button>

            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-xs font-semibold px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm transition"
              title="Switch language between English and Hindi"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Demo Reset Trigger */}
            <button
              onClick={resetDemoData}
              title="Reset mock environment"
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Persistent Role Switcher (Shown ONLY on mobile < md) */}
        <div className="md:hidden pb-2.5">
          <div className="grid grid-cols-3 gap-1 bg-slate-100/95 p-1 rounded-2xl border border-slate-200 shadow-inner">
            <button
              onClick={() => setRole('citizen')}
              className={`flex items-center justify-center space-x-1 py-2 rounded-xl text-xs font-bold transition-all ${
                role === 'citizen'
                  ? 'bg-white shadow-md text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Resident</span>
            </button>

            <button
              onClick={() => setRole('collector')}
              className={`relative flex items-center justify-center space-x-1 py-2 rounded-xl text-xs font-bold transition-all ${
                role === 'collector'
                  ? 'bg-white shadow-md text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Collector</span>
              {availableLeadsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500 text-white">
                  {availableLeadsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setRole('admin')}
              className={`relative flex items-center justify-center space-x-1 py-2 rounded-xl text-xs font-bold transition-all ${
                role === 'admin'
                  ? 'bg-white shadow-md text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
              {pendingApprovalsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-white animate-bounce">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Sub-bar: Municipal Pilot Tag & Live Stats */}
        <div className="py-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 overflow-x-auto no-scrollbar whitespace-nowrap gap-2">
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-slate-700">
              {language === 'hi' ? 'बेंगलुरु / दिल्ली पायलट' : 'Bengaluru & Delhi Hub'}
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline">
              1,420 kg dry waste diverted this week
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {pendingApprovalsCount > 0 && (
              <span
                onClick={() => setRole('admin')}
                className="cursor-pointer text-amber-700 font-bold bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 transition flex items-center space-x-1 text-[10px]"
              >
                <Clock className="w-3 h-3 text-amber-600" />
                <span>{pendingApprovalsCount} approvals</span>
              </span>
            )}
            <span className="text-emerald-700 font-medium hidden sm:inline">
              CPCB Certified
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
