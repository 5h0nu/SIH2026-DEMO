import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  CalendarPlus,
  Calculator,
  ScanLine,
  Tag,
  RefreshCw,
  Send,
  Cpu,
  Camera,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Zap,
  ShieldAlert,
  Info,
  Award,
  Coins,
  Search,
  Factory,
  LocateFixed,
  Compass,
  Loader2,
  Phone,
  ShieldCheck,
  MapPin,
  Building2,
  ExternalLink
} from 'lucide-react';
import { presetAiSpecimens, initialPartnerDirectory } from '../../data/mockData';
import { analyzeScrapImageWithGroq } from '../../services/groqService';
import { playScaleBeep } from '../../utils/audio';
import type { AiInferenceResult } from '../../types';


export const CitizenView: React.FC = () => {
  const {
    language,
    userWallet,
    swachhPoints,
    scrapRates,
    orders,
    openBookingModal,
    openRewardsModal,
    openCertificateModal,
    refreshDailyRates,
    isFetchingRates,
    groqMandiInfo,
    groqKey,
    showToast,
    userLocation,
    userCoords,
    isDetectingLocation,
    detectUserLocation
  } = useApp();

  // Category filter for Rate Card
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  // Interactive Estimator Quantities
  const [estimatorValues, setEstimatorValues] = useState<Record<string, number>>({
    newspaper: 10,
    cardboard: 8,
    pet_bottle: 5,
    iron: 6,
    copper: 0,
    ewaste: 2
  });

  // AI Scanner State
  const [activeAiSampleKey, setActiveAiSampleKey] = useState<string>('pet_bottle');
  const [aiResult, setAiResult] = useState<AiInferenceResult>(presetAiSpecimens.pet_bottle);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [customPhotoLabel, setCustomPhotoLabel] = useState<string | null>(null);

  // Find the latest / active order for the citizen
  const citizenOrders = orders.filter(
    o => o.citizenName.includes('You') || o.id === 'RS-8921' || o.status === 'pending_admin_approval'
  );
  const activeOrder = citizenOrders[0] || orders[0];

  // Partners Filter & Search for Citizen Portal
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<'all' | 'recycler' | 'kabadiwala'>('all');
  const [partnerSearchQuery, setPartnerSearchQuery] = useState<string>('');

  // Estimator Calculations
  const updateQuantity = (id: string, val: number) => {
    setEstimatorValues(prev => ({ ...prev, [id]: Math.max(0, val) }));
  };

  const resetEstimator = () => {
    setEstimatorValues({
      newspaper: 0,
      cardboard: 0,
      pet_bottle: 0,
      iron: 0,
      copper: 0,
      ewaste: 0
    });
    showToast('Estimator quantities reset to zero.', 'info');
  };

  let grandTotal = 0;
  let totalWeight = 0;
  Object.entries(estimatorValues).forEach(([id, qty]) => {
    const rateItem = scrapRates.find(r => r.id === id);
    if (rateItem && qty > 0) {
      grandTotal += qty * rateItem.rate;
      totalWeight += qty;
    }
  });

  const handleBookWithEstimates = () => {
    openBookingModal({
      weight: totalWeight > 0 ? totalWeight : 15,
      payout: grandTotal > 0 ? grandTotal : 250
    });
  };

  // Run AI Scrap Classifier
  const handleSelectPreset = async (key: string) => {
    setActiveAiSampleKey(key);
    setIsScanning(true);
    setCustomPhotoLabel(null);
    try {
      const res = await analyzeScrapImageWithGroq('', key, groqKey);
      setAiResult(res);
      showToast('Specimen classified by AI model!', 'success');
    } catch {
      showToast('Classification failed. Check connection.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleCustomPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomPhotoLabel(file.name.substring(0, 20) + (file.name.length > 20 ? '...' : ''));
      setIsScanning(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const res = await analyzeScrapImageWithGroq(base64, undefined, groqKey);
          setAiResult(res);
          showToast(
            groqKey
              ? 'Classified using Groq Llama 3.2 Vision Model!'
              : 'Classified using Edge Computer Vision Simulator!',
            'success'
          );
        } catch {
          showToast('Image analysis error.', 'error');
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyAiToEstimator = () => {
    if (aiResult.calcCategory && estimatorValues[aiResult.calcCategory] !== undefined) {
      setEstimatorValues(prev => ({
        ...prev,
        [aiResult.calcCategory]: Math.max(12, (prev[aiResult.calcCategory] || 0) + 12)
      }));
    } else {
      setEstimatorValues(prev => ({
        ...prev,
        pet_bottle: Math.max(12, (prev.pet_bottle || 0) + 12)
      }));
    }

    const calcEl = document.getElementById('calculator-section');
    if (calcEl) {
      calcEl.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(`Added ${aiResult.category} (12 kg) to Estimator!`, 'success');
  };

  // Filtered rates
  const filteredRates =
    selectedGroup === 'all'
      ? scrapRates
      : scrapRates.filter(r => r.categoryGroup === selectedGroup);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Hero Banner with Green Wallet */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 text-white p-6 sm:p-10 shadow-xl shadow-emerald-950/20">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-semibold backdrop-blur-sm border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                {language === 'hi'
                  ? 'घर बैठे निष्पक्ष तौल रद्दी संग्रहण'
                  : 'Doorstep Fair-Weight Scrap Collection & Circular Payout'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {language === 'hi'
                ? 'सूखे कचरे से कमाई करें और स्वच्छ भारत को गति दें।'
                : 'Turn household dry waste into cash & verified green impact.'}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              {language === 'hi'
                ? 'प्रमाणित डिजिटल ब्लूटूथ तौल, पारदर्शी दैनिक मंडी भाव, तुरंत UPI भुगतान एवं नगर निगम रीसाइक्लिंग प्रमाणन।'
                : 'Certified BLE digital scales, AI scrap grading, standardized rates across India, instant UPI deposit to bank, and traceability into authorized recycling centers.'}
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => openBookingModal()}
                className="px-5 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-400/20 transition flex items-center space-x-2 active:scale-95"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>
                  {language === 'hi' ? 'निशुल्क पिकअप बुक करें' : 'Schedule Free Pickup'}
                </span>
              </button>

              <a
                href="#calculator-section"
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-sm transition flex items-center space-x-2"
              >
                <Calculator className="w-4 h-4 text-emerald-300" />
                <span>{language === 'hi' ? 'संभावित कमाई जांचें' : 'Scrap Calculator'}</span>
              </a>

              <a
                href="#ai-demo-section"
                className="px-4 py-3 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 font-bold text-xs sm:text-sm border border-teal-400/30 transition flex items-center space-x-2"
              >
                <ScanLine className="w-4 h-4 text-teal-300" />
                <span>{language === 'hi' ? 'AI कचरा स्कैनर' : 'AI Scrap Scanner'}</span>
              </a>
            </div>
          </div>

          {/* Quick User Stats Card (My Green Wallet) */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/15 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs uppercase tracking-wider text-slate-300 font-bold">
                {language === 'hi' ? 'मेरा ग्रीन वॉलेट' : 'My Green Wallet'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-[10px] font-extrabold text-white uppercase shadow-sm">
                Active Escrow
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ₹ {userWallet.balance.toFixed(2)}
              </span>
              <div className="text-[11px] text-emerald-300 font-semibold">
                {language === 'hi' ? 'कुल अर्जित राशि' : 'Lifetime Direct UPI Earnings'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                <div className="text-slate-400 text-[11px]">
                  {language === 'hi' ? 'बचाई रद्दी' : 'Dry Waste Diverted'}
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                  {userWallet.divertedKg} kg
                </div>
              </div>
              <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                <div className="text-slate-400 text-[11px]">
                  {language === 'hi' ? 'CO₂ कटौती' : 'CO₂ Abatement'}
                </div>
                <div className="text-sm sm:text-base font-extrabold text-emerald-300 mt-0.5">
                  {userWallet.co2Kg} kg
                </div>
              </div>
            </div>

            {/* Quick Actions inside Wallet */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs gap-2">
              <button
                onClick={openRewardsModal}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 font-bold transition flex items-center justify-center space-x-1.5"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{swachhPoints} Points &bull; Store</span>
              </button>

              <button
                onClick={openCertificateModal}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-bold transition flex items-center justify-center space-x-1.5"
              >
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Certificate</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 2. User Service Location & Auto-Detect Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-inner shrink-0">
            <MapPin className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                User Service Location &amp; Ward
              </span>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping mr-1" />
                <span>Ward 4B Active</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                &bull; Nearest Partner: Ramesh Kumar (0.8 km)
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-1 mt-0.5">
              {userLocation}
            </h3>
            {userCoords && (
              <span className="text-[10px] text-emerald-700 font-mono font-bold block mt-0.5">
                📍 {userCoords}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => detectUserLocation()}
            disabled={isDetectingLocation}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
            title="Auto-detect current GPS location for doorstep pickup and nearby recycling centers"
          >
            {isDetectingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <LocateFixed className="w-4 h-4 text-white" />
            )}
            <span>{isDetectingLocation ? 'Detecting GPS...' : '📍 Auto-Detect Location'}</span>
          </button>
        </div>
      </div>

      {/* 3. Live Pickup Tracking Status Box with Pending Admin Confirmation Highlight */}
      {activeOrder && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  activeOrder.status === 'pending_admin_approval'
                    ? 'bg-amber-400 animate-ping'
                    : activeOrder.status === 'on_the_way'
                    ? 'bg-emerald-500 animate-ping'
                    : 'bg-emerald-600'
                }`}
              />
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Active Pickup Tracking #{activeOrder.id}
              </h3>
              {activeOrder.status === 'pending_admin_approval' && (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                  Pending ULB Confirmation
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500">
              {activeOrder.assignedCollector ? (
                <>
                  Assigned Partner:{' '}
                  <strong className="text-slate-800 font-bold">
                    {activeOrder.assignedCollector}
                  </strong>
                </>
              ) : (
                <span className="text-amber-700 font-semibold flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Awaiting Municipal Ward Admin Verification</span>
                </span>
              )}
            </div>
          </div>

          {/* Stepper with 5 States */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-center text-xs">
            {/* Step 1: Requested */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800">1. Requested</span>
              <span className="text-[10px] text-slate-400">Order Created</span>
            </div>

            {/* Step 2: ULB Admin Approval */}
            <div
              className={`flex flex-col items-center ${
                activeOrder.status === 'pending_admin_approval' ? '' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 shadow-sm ${
                  activeOrder.status === 'pending_admin_approval'
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {activeOrder.status === 'pending_admin_approval' ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>
              <span
                className={`font-bold ${
                  activeOrder.status === 'pending_admin_approval'
                    ? 'text-amber-700'
                    : 'text-slate-800'
                }`}
              >
                2. Admin Approval
              </span>
              <span className="text-[10px] text-slate-400">
                {activeOrder.status === 'pending_admin_approval'
                  ? 'In Review (Pending)'
                  : 'Verified & Approved'}
              </span>
            </div>

            {/* Step 3: Partner Assigned */}
            <div
              className={`flex flex-col items-center ${
                activeOrder.status === 'pending_admin_approval' ? 'opacity-40' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 shadow-sm ${
                  activeOrder.status === 'collector_assigned'
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : activeOrder.status === 'on_the_way' || activeOrder.status === 'weighed_and_paid'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Truck className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800">3. Partner Assigned</span>
              <span className="text-[10px] text-slate-400">Ward Kabadiwala</span>
            </div>

            {/* Step 4: On The Way */}
            <div
              className={`flex flex-col items-center ${
                activeOrder.status === 'on_the_way'
                  ? ''
                  : activeOrder.status === 'weighed_and_paid'
                  ? ''
                  : 'opacity-40'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 shadow-sm ${
                  activeOrder.status === 'on_the_way'
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                    : activeOrder.status === 'weighed_and_paid'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Truck className="w-4 h-4" />
              </div>
              <span
                className={`font-bold ${
                  activeOrder.status === 'on_the_way' ? 'text-amber-700' : 'text-slate-800'
                }`}
              >
                4. On The Way
              </span>
              <span className="text-[10px] text-slate-400">
                {activeOrder.status === 'on_the_way' ? 'ETA: 12 Mins' : 'In Transit'}
              </span>
            </div>

            {/* Step 5: Weigh & Pay */}
            <div
              className={`flex flex-col items-center ${
                activeOrder.status === 'weighed_and_paid' ? '' : 'opacity-40'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 shadow-sm ${
                  activeOrder.status === 'weighed_and_paid'
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800">5. Weigh &amp; Paid</span>
              <span className="text-[10px] text-slate-400">
                {activeOrder.status === 'weighed_and_paid'
                  ? `₹${activeOrder.actualPayout} Settled`
                  : 'Instant UPI'}
              </span>
            </div>
          </div>

          {/* Pending Approval Explainer Banner for Demo Evaluation */}
          {activeOrder.status === 'pending_admin_approval' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start space-x-3 text-xs text-amber-900 mt-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Pending Confirmation Workflow:</span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Order <strong>#{activeOrder.id}</strong> is currently waiting in the municipal verification queue. Switch to the <strong>ULB Municipal Admin</strong> tab in the top header to review and approve it!
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Live Scrap Rate Card & Interactive Earnings Estimator */}
      <div id="calculator-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live Mandi Rate Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-emerald-600" />
                  <span>
                    {language === 'hi'
                      ? 'दैनिक कबाड़ भाव (मंडी दरें)'
                      : 'Daily Scrap Mandi Rate Card'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {groqMandiInfo.mandi} • {groqMandiInfo.timestamp}
                </p>
              </div>

              {/* Auto-Fetch via Groq AI Button */}
              <button
                onClick={refreshDailyRates}
                disabled={isFetchingRates}
                className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
                title="Auto-fetch latest scrap prices from Groq AI Llama 3.3 Mandi Index"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingRates ? 'animate-spin' : ''}`} />
                <span>{isFetchingRates ? 'Fetching...' : 'Groq AI Sync'}</span>
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 mb-3 text-xs">
              {[
                { id: 'all', label: 'All Scrap' },
                { id: 'paper', label: 'Paper' },
                { id: 'plastic', label: 'Plastics' },
                { id: 'metal', label: 'Metals' },
                { id: 'ewaste', label: 'E-Waste' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedGroup(tab.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    selectedGroup === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Rate List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 text-sm">
              {filteredRates.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-xs">
                        {language === 'hi' ? item.hiName : item.name}
                      </span>
                      {item.trend === 'up' && (
                        <span className="flex items-center text-[10px] text-emerald-600 font-bold">
                          <TrendingUp className="w-3 h-3 mr-0.5" />+{item.changePercent}%
                        </span>
                      )}
                      {item.trend === 'down' && (
                        <span className="flex items-center text-[10px] text-rose-500 font-bold">
                          <TrendingDown className="w-3 h-3 mr-0.5" />{item.changePercent}%
                        </span>
                      )}
                      {item.trend === 'stable' && (
                        <span className="flex items-center text-[10px] text-slate-400 font-medium">
                          <Minus className="w-2.5 h-2.5 mr-0.5" />0%
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{item.rationale}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-emerald-700 text-sm">
                      ₹ {item.rate.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      /{item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>* Minimum doorstep batch: 3 kg</span>
            <span className="text-emerald-600 font-bold">IoT Calibrated Scale Guarantee</span>
          </div>
        </div>

        {/* Interactive Earnings Estimator */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-emerald-600" />
                  <span>
                    {language === 'hi'
                      ? 'कबाड़ मूल्य कैलकुलेटर'
                      : 'Interactive Scrap Value Estimator'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Adjust kilograms to estimate your fair doorstep cash/UPI deposit.
                </p>
              </div>
              <button
                onClick={resetEstimator}
                className="text-xs text-slate-500 hover:text-emerald-600 font-semibold flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Material Sliders */}
            <div className="space-y-3.5">
              {[
                { id: 'newspaper', label: 'Newspaper (Raddi)', defaultUnit: 'kg' },
                { id: 'cardboard', label: 'Corrugated Box (Gatta)', defaultUnit: 'kg' },
                { id: 'pet_bottle', label: 'PET Bottles (Plastic)', defaultUnit: 'kg' },
                { id: 'iron', label: 'Iron & Mild Steel', defaultUnit: 'kg' },
                { id: 'copper', label: 'Bare Copper Wire', defaultUnit: 'kg' },
                { id: 'ewaste', label: 'E-Waste (Motherboards/Gadgets)', defaultUnit: 'kg' }
              ].map(spec => {
                const rateObj = scrapRates.find(r => r.id === spec.id) || { rate: 15, unit: 'kg' };
                const qty = estimatorValues[spec.id] || 0;
                const subTotal = (qty * rateObj.rate).toFixed(2);

                return (
                  <div key={spec.id} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800">
                        {spec.label}{' '}
                        <span className="text-slate-400 font-normal">
                          (₹{rateObj.rate}/{rateObj.unit})
                        </span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          {qty} {rateObj.unit}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          ₹{subTotal}
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={qty}
                      onChange={e => updateQuantity(spec.id, Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Total Payout Box */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Estimated Cash / Instant UPI
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                ₹ {grandTotal.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Total Estimated Weight: {totalWeight.toFixed(1)} kg
              </span>
            </div>

            <button
              onClick={handleBookWithEstimates}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-2 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Book For This Amount</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Edge AI & Groq Vision Material Classifier Simulator */}
      <div
        id="ai-demo-section"
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
      >
        <div className="max-w-3xl mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-400/30">
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            <span>SIH Tech Feature: Edge AI Computer Vision Scrap Classifier</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            AI Scrap Recognition &amp; Polymer Grade Predictor
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
            Eliminates scrap grade manipulation by using Computer Vision models (Groq Llama 3.2 Vision / YOLO) to detect polymer types, contamination risks, and accurate mandi benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Preset Buttons & Custom Photo Input */}
          <div className="md:col-span-6 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Choose a test scrap specimen:
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { key: 'pet_bottle', icon: '🧴', name: 'PET Plastic Bottle', sub: 'Clear Polyethylene' },
                { key: 'cardboard', icon: '📦', name: 'Corrugated Box', sub: 'Packaging Kraft Grade' },
                { key: 'copper_wire', icon: '🔌', name: 'Copper Wire Scrap', sub: 'High-purity Red Metal' },
                { key: 'pcb', icon: '💻', name: 'Circuit Board (PCB)', sub: 'Grade-A Motherboard' },
                { key: 'aluminium_cans', icon: '🥫', name: 'Aluminium UBC Can', sub: 'Alloy 3004 Sheet' }
              ].map(item => {
                const isActive = activeAiSampleKey === item.key && !customPhotoLabel;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleSelectPreset(item.key)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center space-x-3 group ${
                      isActive
                        ? 'border-emerald-400 bg-slate-700/90 shadow-md ring-2 ring-emerald-500/30'
                        : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{item.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Camera Upload */}
            <div className="pt-2">
              <label className="block text-[11px] text-slate-400 mb-1.5">
                Or upload your camera photo feed:
              </label>
              <label className="cursor-pointer flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl border border-dashed border-slate-600 bg-slate-800/50 hover:bg-slate-800 text-xs text-slate-300 transition">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>{customPhotoLabel || 'Upload Photo / Snap Camera'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomPhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* AI Inference Output Card */}
          <div className="md:col-span-6">
            <div className="bg-slate-950/90 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-2xl">
              {/* Scanning Overlay */}
              {isScanning && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-3">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-mono text-emerald-400">
                    Extracting visual features &amp; polymer density...
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
                    Model: {aiResult.source === 'groq' ? 'Groq Llama-3.2-Vision' : 'YOLOv8-RecycleSeg'}
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded-full font-semibold">
                  Latency: 28ms
                </span>
              </div>

              {/* Classification Results */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Detected Category:</span>
                  <span className="font-extrabold text-sm text-emerald-400">
                    {aiResult.category}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Specific Grade:</span>
                  <span className="font-bold text-slate-200 truncate max-w-[200px]">
                    {aiResult.specificGrade}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Grading Confidence:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${aiResult.confidence}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold text-white">
                      {aiResult.confidence}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Contamination Risk:</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                      aiResult.contaminationRisk === 'Low'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {aiResult.contamination}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <span className="text-slate-400">Standard Mandi Benchmark:</span>
                  <span className="text-base font-black text-white">
                    ₹ {aiResult.estimatedRate.toFixed(2)} / kg
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  <span className="font-bold text-emerald-400">Circular Advice: </span>
                  {aiResult.advice}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Circular Code: <span className="font-mono text-slate-200">{aiResult.code}</span>
                </span>
                <button
                  onClick={handleApplyAiToEstimator}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4 flex items-center space-x-1"
                >
                  <span>Add to Calculator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Authorized Circular Partners & Processing Centers */}
      <div id="partners-section" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header & Auto-Detect Location CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2 border border-emerald-200">
              <Factory className="w-3.5 h-3.5 text-emerald-700" />
              <span>CPCB Accredited Industrial Offtakers &amp; Ward Fleets</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Authorized Circular Partners &amp; Processing Centers
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Transparent dry waste destination tracking: See the authorized national recyclers and verified ward kabadiwala collectors handling your segregated recyclables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => detectUserLocation()}
              disabled={isDetectingLocation}
              className="px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center space-x-2 transition active:scale-95 disabled:opacity-50 shadow-sm"
              title="Auto-detect current GPS location to sort nearby recycling hubs"
            >
              {isDetectingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <LocateFixed className="w-4 h-4 text-emerald-600" />
              )}
              <span>{isDetectingLocation ? 'Detecting GPS...' : '📍 Auto-Detect Location'}</span>
            </button>
          </div>
        </div>

        {/* Current Detected Location Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2.5">
            <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-600">
              Showing accredited recycling destinations near:{' '}
              <strong className="text-slate-900">{userLocation}</strong>
            </span>
          </div>
          {userCoords && (
            <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md font-bold">
              {userCoords}
            </span>
          )}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto">
            {[
              { id: 'all', label: `All Partners (${initialPartnerDirectory.length})` },
              { id: 'recycler', label: 'Industrial Recyclers (5)' },
              { id: 'kabadiwala', label: 'Ward Kabadiwalas (4)' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setPartnerTypeFilter(f.id as typeof partnerTypeFilter)}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex-1 sm:flex-initial text-center ${
                  partnerTypeFilter === f.id
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={partnerSearchQuery}
              onChange={e => setPartnerSearchQuery(e.target.value)}
              placeholder="Search partner, material, or location..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Partner Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialPartnerDirectory
            .filter(p => {
              const matchesType =
                partnerTypeFilter === 'all'
                  ? true
                  : partnerTypeFilter === 'recycler'
                  ? p.type === 'Industrial Recycler'
                  : p.type === 'Certified Kabadiwala';
              const matchesSearch =
                p.name.toLowerCase().includes(partnerSearchQuery.toLowerCase()) ||
                p.categoryBadge.toLowerCase().includes(partnerSearchQuery.toLowerCase()) ||
                p.location.toLowerCase().includes(partnerSearchQuery.toLowerCase()) ||
                p.materials.some(m => m.toLowerCase().includes(partnerSearchQuery.toLowerCase()));
              return matchesType && matchesSearch;
            })
            .map(partner => (
              <div
                key={partner.id}
                className="p-5 rounded-3xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition space-y-3.5 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 shadow-inner ${
                          partner.type === 'Industrial Recycler'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {partner.type === 'Industrial Recycler' ? (
                          <Factory className="w-5 h-5 text-blue-700" />
                        ) : (
                          <Truck className="w-5 h-5 text-amber-700" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1">
                          {partner.name}
                        </h4>
                        <span className="text-[11px] font-bold text-emerald-700 block">
                          {partner.categoryBadge}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shrink-0">
                      📍 {partner.distanceKm} km
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{partner.location}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">Capacity / Scale:</span>
                      <span className="font-bold text-emerald-700">{partner.capacityOrVolume}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">License / ID:</span>
                      <span className="font-mono font-bold text-slate-700 truncate max-w-[150px]">
                        {partner.licenseId}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {partner.materials.map((m, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {partner.status}
                  </span>

                  <button
                    onClick={() => {
                      openBookingModal({ weight: 15, payout: 280 });
                      showToast(`Booking pickup routed for ${partner.name}!`, 'info');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center space-x-1 transition active:scale-95 shadow-sm"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Book Pickup</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
