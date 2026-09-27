import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Coins,
  X,
  Building,
  Bus,
  Sprout,
  Gift,
  CheckCircle2,
  Copy,
  ExternalLink
} from 'lucide-react';

export const GreenRewardsModal: React.FC = () => {
  const {
    isRewardsModalOpen,
    closeRewardsModal,
    swachhPoints,
    rewardsList,
    redeemReward,
    showToast,
    language
  } = useApp();

  if (!isRewardsModalOpen) return null;

  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'building':
        return <Building className="w-5 h-5 text-indigo-600" />;
      case 'bus':
        return <Bus className="w-5 h-5 text-teal-600" />;
      case 'sprout':
        return <Sprout className="w-5 h-5 text-emerald-600" />;
      default:
        return <Gift className="w-5 h-5 text-amber-600" />;
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Voucher code ${code} copied to clipboard!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-black shadow-inner">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Swachh Points &amp; Green Rewards Store
              </h3>
              <p className="text-xs text-slate-500">
                Earn 10 points per kg recycled. Redeem for municipal tax rebates &amp; transit passes.
              </p>
            </div>
          </div>
          <button
            onClick={closeRewardsModal}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between shadow-lg shadow-amber-500/20">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">
              Your Available Swachh Balance
            </span>
            <div className="text-3xl font-black mt-0.5">{swachhPoints} Points</div>
            <span className="text-[11px] opacity-90">Earned via zero-contamination dry waste</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Coins className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {rewardsList.map(item => {
            const canAfford = swachhPoints >= item.pointsCost;

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                      {getRewardIcon(item.icon)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {language === 'hi' ? item.hiTitle : item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                      <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                        Partner: {item.partner}
                      </span>
                    </div>
                  </div>

                  <span className="font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-xs shrink-0 ml-2">
                    {item.pointsCost} Pts
                  </span>
                </div>

                {/* Redeem state / Action */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  {item.isRedeemed ? (
                    <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono font-bold text-xs">{item.couponCode}</span>
                      <button
                        onClick={() => handleCopyCode(item.couponCode!)}
                        className="text-slate-400 hover:text-emerald-700 p-1"
                        title="Copy code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {canAfford ? 'Eligible for instant voucher' : 'Earn more points to unlock'}
                    </span>
                  )}

                  {!item.isRedeemed && (
                    <button
                      onClick={() => redeemReward(item.id)}
                      disabled={!canAfford}
                      className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs transition active:scale-95 shadow-sm"
                    >
                      Redeem Voucher
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
