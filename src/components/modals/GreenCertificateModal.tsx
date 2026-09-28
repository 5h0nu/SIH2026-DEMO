import React from 'react';
import { useApp } from '../../context/AppContext';
import { Award, X, Download, ShieldCheck, QrCode, Trees, Droplets, Wind, Sparkles } from 'lucide-react';

export const GreenCertificateModal: React.FC = () => {
  const { isCertificateModalOpen, closeCertificateModal, userWallet, showToast } = useApp();

  if (!isCertificateModalOpen) return null;

  const treesSaved = (userWallet.divertedKg * 0.04).toFixed(1);
  const waterSavedLtr = Math.round(userWallet.divertedKg * 49.5);
  const landfillSavedCubic = (userWallet.divertedKg * 0.01).toFixed(2);

  const handleDownload = () => {
    showToast('Green Citizen Impact Certificate downloaded as high-res PDF!', 'success');
    closeCertificateModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-8 shadow-2xl border border-slate-200 space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
              Official Environmental Impact Certificate
            </span>
          </div>
          <button
            onClick={closeCertificateModal}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Plaque */}
        <div className="border-4 border-double border-emerald-600/40 rounded-3xl p-6 bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/50 relative overflow-hidden shadow-inner text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-100/80 px-3 py-0.5 rounded-full border border-emerald-300">
              Swachh Bharat Mission 2.0 • Circular Household Citation
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-heading">
              Green Citizen of Honor
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              This digital certificate certifies that the resident household of{' '}
              <strong className="text-slate-900 font-bold">Pooja Sharma (Indiranagar Ward 4B)</strong> has segregated dry waste at source with verified circular traceability.
            </p>
          </div>

          {/* 4 Impact Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-left">
            <div className="bg-white/90 p-3 rounded-2xl border border-emerald-100 shadow-sm">
              <div className="flex items-center text-emerald-600 mb-1">
                <Trees className="w-4 h-4 mr-1" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Trees</span>
              </div>
              <div className="text-base font-black text-slate-900">{treesSaved}</div>
              <span className="text-[9px] text-slate-400">Equivalent Saved</span>
            </div>

            <div className="bg-white/90 p-3 rounded-2xl border border-emerald-100 shadow-sm">
              <div className="flex items-center text-blue-600 mb-1">
                <Droplets className="w-4 h-4 mr-1" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Water</span>
              </div>
              <div className="text-base font-black text-slate-900">{waterSavedLtr} L</div>
              <span className="text-[9px] text-slate-400">Industrial Water Saved</span>
            </div>

            <div className="bg-white/90 p-3 rounded-2xl border border-emerald-100 shadow-sm">
              <div className="flex items-center text-teal-600 mb-1">
                <Wind className="w-4 h-4 mr-1" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">CO₂</span>
              </div>
              <div className="text-base font-black text-emerald-700">{userWallet.co2Kg} kg</div>
              <span className="text-[9px] text-slate-400">Emissions Abated</span>
            </div>

            <div className="bg-white/90 p-3 rounded-2xl border border-emerald-100 shadow-sm">
              <div className="flex items-center text-amber-600 mb-1">
                <ShieldCheck className="w-4 h-4 mr-1" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Diverted</span>
              </div>
              <div className="text-base font-black text-slate-900">{userWallet.divertedKg} kg</div>
              <span className="text-[9px] text-slate-400">Zero to Landfill</span>
            </div>
          </div>

          {/* Certificate Verification Stamp */}
          <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center space-x-2 text-left">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                <QrCode className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <span className="font-bold text-slate-800 block">CPCB-SBM-2024-BLR-8819</span>
                <span className="text-[9px] text-emerald-700">Digital Tamper-Proof Hash Validated</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-bold text-slate-800 block">MoHUA &amp; BBMP Certified</span>
              <span className="text-[9px] text-slate-400">Issued September 2026</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end space-x-2 pt-1">
          <button
            onClick={closeCertificateModal}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download High-Res PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
