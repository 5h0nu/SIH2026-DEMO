import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ArrowRight,
  Calculator,
  CalendarPlus,
  ScanLine,
  Tag
} from 'lucide-react';

export const SetuAiChatModal: React.FC = () => {
  const {
    isChatModalOpen,
    closeChatModal,
    chatMessages,
    sendChatMessage,
    isAiTyping,
    openBookingModal,
    groqKey
  } = useApp();

  const [inputPrompt, setInputPrompt] = useState<string>('');

  if (!isChatModalOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;
    const text = inputPrompt;
    setInputPrompt('');
    sendChatMessage(text);
  };

  const handleSuggestedClick = (text: string) => {
    sendChatMessage(text);
  };

  const handleActionClick = (target: string) => {
    closeChatModal();
    if (target === 'booking') {
      openBookingModal();
    } else if (target === 'calculator') {
      const el = document.getElementById('calculator-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (target === 'scanner') {
      const el = document.getElementById('ai-demo-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (target === 'rates') {
      const el = document.getElementById('calculator-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full h-[620px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base tracking-tight">SetuAI Waste Assistant</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  {groqKey ? 'Groq Llama 3.3 Active' : 'Edge Circular AI'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Ask about scrap prices, segregation rules, or instant UPI bookings
              </p>
            </div>
          </div>
          <button
            onClick={closeChatModal}
            className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-50/50">
          {chatMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Optional Action Button */}
                {msg.suggestedAction && (
                  <button
                    onClick={() => handleActionClick(msg.suggestedAction!.target)}
                    className="mt-2.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center space-x-1.5 transition border border-emerald-200"
                  >
                    <span>{msg.suggestedAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                  </button>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {isAiTyping && (
            <div className="flex items-center space-x-2 p-3 bg-white border border-slate-200 rounded-2xl max-w-[120px] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        {/* Preset Query Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center space-x-2 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-slate-400 text-[10px] font-bold shrink-0">Suggestions:</span>
          {[
            'Check current scrap mandi prices',
            'How to safely recycle e-waste?',
            'Can I recycle thermocol foam?',
            'How do Swachh Points work?'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestedClick(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-600 transition shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            placeholder="Ask about scrap rates, materials, booking..."
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-2xl text-xs outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isAiTyping}
            className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition disabled:opacity-50 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
