import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, ShieldCheck, Download, Zap, X } from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const { isPaymentModalOpen, closePaymentModal, paymentModalData, showToast } = useApp();

  if (!isPaymentModalOpen || !paymentModalData) return null;

  const handleDownloadReceipt = () => {
    showToast('Transaction receipt downloaded as PDF/Text slip!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
        {/* Animated Checkmark */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-50 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            Direct DBT / UPI Settlement
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-2">
            Payment Disbursed!
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Instantly transferred from Municipal Escrow to Citizen Bank Account.
          </p>
        </div>

        {/* Transaction Slip Details */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 text-left">
          <div className="flex justify-between items-center text-slate-600">
            <span>Amount Disbursed:</span>
            <span className="text-lg font-black text-emerald-700">
              ₹ {paymentModalData.amount.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Citizen Beneficiary:</span>
            <span className="font-bold text-slate-800">{paymentModalData.recipientName}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>UPI Reference ID:</span>
            <span className="font-mono font-bold text-slate-700 text-[11px]">
              {paymentModalData.upiRef}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Order ID:</span>
            <span className="font-mono text-slate-700">{paymentModalData.orderId}</span>
          </div>

          <div className="border-t border-slate-200 pt-2 flex flex-col space-y-0.5">
            <span className="text-[10px] text-slate-400">Scale Cryptographic Hash:</span>
            <span className="font-mono text-[9px] text-slate-600 truncate bg-slate-200/60 p-1 rounded">
              {paymentModalData.scaleHash}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={closePaymentModal}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-600/20 active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <span>Done &amp; Update Ledger</span>
          </button>
          <button
            onClick={handleDownloadReceipt}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download UPI Payment Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
