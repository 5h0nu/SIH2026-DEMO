import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Key, Cpu, Sparkles, Check, ExternalLink, Zap, RefreshCw } from 'lucide-react';

export const GroqSettingsModal: React.FC = () => {
  const {
    isGroqModalOpen,
    closeGroqModal,
    groqKey,
    setGroqKey,
    refreshDailyRates,
    isFetchingRates,
    showToast
  } = useApp();

  const [inputKey, setInputKey] = useState<string>(groqKey);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  if (!isGroqModalOpen) return null;

  const handleSave = () => {
    setGroqKey(inputKey);
    closeGroqModal();
  };

  const handleTestAndFetch = async () => {
    setIsTesting(true);
    setGroqKey(inputKey);
    try {
      await refreshDailyRates();
      showToast('Groq API connection verified & rates refreshed!', 'success');
    } catch {
      showToast('Groq test request failed. Check API key.', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    setInputKey('');
    setGroqKey('');
    showToast('Groq API Key cleared. Prototype reverted to Edge Simulation mode.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shadow-inner">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center space-x-2">
                <span>Groq AI Cloud Settings</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  SIH AI Engine
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Powers real-time Mandi scrap prices &amp; Vision material grading
              </p>
            </div>
          </div>
          <button
            onClick={closeGroqModal}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Explainer */}
        <div className="space-y-2.5">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>1. Groq Llama 3.3 (70B) Mandi Price Auto-Fetcher</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Queries live spot benchmarks across Indian scrap mandis (paper mills, rPET flake recyclers, metal re-rolling yards) to prevent middleman rate manipulation.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>2. Groq Llama 3.2 Vision (11B) Scrap Classifier</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Processes uploaded camera photos to identify polymer grade (#1 PETE, #2 HDPE), metal purity (IS-Cu-ETP), and contamination percentage in under 40ms.
            </p>
          </div>
        </div>

        {/* Key Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Groq API Key (Optional)
          </label>
          <div className="relative">
            <input
              type="password"
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-mono"
            />
            {inputKey && (
              <span className="absolute right-3 top-2.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                CONFIGURED
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Don't have a key? The app runs with high-fidelity Edge Simulation out of the box!</span>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-0.5"
            >
              <span>Get Free Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
          >
            Clear Key (Demo Mode)
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleTestAndFetch}
              disabled={isTesting || isFetchingRates}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Syncing...' : 'Test & Sync'}</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
