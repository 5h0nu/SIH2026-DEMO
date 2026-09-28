import React from 'react';
import { useApp } from '../../context/AppContext';
import { Award, X, Download, ShieldCheck, QrCode } from 'lucide-react';

export const EprModal: React.FC = () => {
  const { isEprModalOpen, closeEprModal, showToast } = useApp();

  if (!isEprModalOpen) return null;

  const handleDownloadProof = () => {
    showToast('Official CPCB EPR Credit Certificate PDF generated & downloaded!', 'success');
    closeEprModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-7 shadow-2xl border border-slate-200 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        {/* Certificate Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold shadow-inner">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                EPR Circular Recycling Certificate
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                CPCB-EPR-2024-BLR-00492 • ISO 14001 Compliant
              </span>
            </div>
          </div>
          <button
            onClick={closeEprModal}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body Container */}
        <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-amber-200/60 pb-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">
                Authorized Recycler Entity
              </span>
              <div className="font-extrabold text-slate-900 text-sm">
                EcoPlast Polymer Recovery &amp; Granulation Ltd.
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-white border border-amber-200 flex items-center justify-center text-slate-700">
              <QrCode className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <span className="text-slate-500 text-[11px]">Municipal Jurisdiction:</span>
              <div className="font-bold text-slate-800">BBMP Bangalore Urban (Zone East)</div>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Certified Material:</span>
              <div className="font-bold text-slate-800">Rigid HDPE &amp; Clear rPET Flakes</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <span className="text-slate-500 text-[11px]">Volume Diverted from Landfill:</span>
              <div className="font-black text-emerald-700 text-sm">12,450.00 kg (12.45 MT)</div>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">CO₂ Equivalent Abatement:</span>
              <div className="font-black text-emerald-700 text-sm">18.67 Metric Tons</div>
            </div>
          </div>

          <div className="border-t border-amber-200/60 pt-2 flex justify-between items-center text-[10px] text-slate-500">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Digital Signature: SHA-256 Validated</span>
            </span>
            <span className="text-amber-800 font-mono font-bold bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
              STATUS: REDEEMABLE EPR CREDIT
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end space-x-2 pt-1">
          <button
            onClick={closeEprModal}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={handleDownloadProof}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download CPCB Verified PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
