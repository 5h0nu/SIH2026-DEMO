import React from 'react';
import { useApp } from '../../context/AppContext';
import { RouteMapSimulator } from './RouteMapSimulator';
import {
  MapPin,
  Bluetooth,
  Zap,
  CheckCircle2,
  Navigation,
  Scale,
  Lock
} from 'lucide-react';


export const CollectorView: React.FC = () => {
  const {
    language,
    orders,
    scrapRates,
    bleScale,
    setBleWeight,
    setBleMaterial,
    tareBleScale,
    toggleBleConnection,
    acceptCollectorLead,
    passCollectorLead,
    completeOrderWithScale,
    loadOrderIntoScale,
    showToast
  } = useApp();

  // Collector leads: orders that are assigned or on the way
  const availableLeads = orders.filter(
    o => o.status === 'collector_assigned' || o.status === 'on_the_way'
  );

  // Selected rate for scale
  const selectedRateObj =
    scrapRates.find(r => r.id === bleScale.selectedMaterialId) ||
    scrapRates.find(r => r.id === 'cardboard') ||
    scrapRates[0];

  const currentScalePrice = bleScale.currentWeight * selectedRateObj.rate;

  const handleDisburseUpi = () => {
    if (bleScale.currentWeight <= 0) {
      showToast('Scale weight is 0.00 kg. Place scrap on digital scale first!', 'error');
      return;
    }

    // Determine target order
    let targetOrderId = bleScale.activeOrderId;
    if (!targetOrderId && availableLeads.length > 0) {
      targetOrderId = availableLeads[0].id;
    }

    if (!targetOrderId) {
      showToast('No active pickup selected. Please accept a lead first!', 'warning');
      return;
    }

    completeOrderWithScale(targetOrderId, bleScale.currentWeight, currentScalePrice);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Verified Partner Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-black text-lg sm:text-xl border border-amber-200 shadow-inner shrink-0">
            RK
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                Ramesh Kumar
              </h2>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Verified Kabadiwala
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ward 4B: Koramangala &bull; Vehicle: Electric Loader #KA-01-EA-4910
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
              Today's Payouts
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              ₹ 4,320.00
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
              Daily Volume
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-600">
              214.2 kg
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive GPS Dispatch & TSP Route Optimizer */}
      <RouteMapSimulator />

      {/* 3. Main Workflow: Nearby Leads & Live BLE Digital Scale */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Nearby Pickup Leads */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>
                {language === 'hi' ? 'आसपास के पिकअप अनुरोध' : 'Nearby Approved Pickup Leads'}
              </span>
            </h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
              {availableLeads.length} Available
            </span>
          </div>

          {availableLeads.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">
                All nearby requests fulfilled for this ward!
              </p>
              <p>New bookings will appear here once approved by the ULB Municipal Admin.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {availableLeads.map(req => {
                const isOnTheWay = req.status === 'on_the_way';
                const isScaleActive = bleScale.activeOrderId === req.id;

                return (
                  <div
                    key={req.id}
                    className={`bg-white p-5 rounded-3xl border shadow-sm space-y-3 transition ${
                      isScaleActive
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {req.citizenName}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono font-bold">
                            {req.id}
                          </span>
                          {isOnTheWay && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full animate-pulse">
                              En Route
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{req.address}</p>
                      </div>

                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                        {req.distance}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                        📦 Est: <strong>{req.estimatedWeight} kg</strong>
                      </span>
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                        🏷️ {req.materials.join(', ')}
                      </span>
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                        🕒 {req.timeSlot}
                      </span>
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg font-mono">
                        💳 {req.upiId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => loadOrderIntoScale(req.id)}
                          className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center space-x-1 transition ${
                            isScaleActive
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>{isScaleActive ? 'Loaded in Scale' : 'Select for Scale'}</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => passCollectorLead(req.id)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                        >
                          Pass Lead
                        </button>

                        <button
                          onClick={() => acceptCollectorLead(req.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition active:scale-95"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>{isOnTheWay ? 'Navigate (En Route)' : 'Accept & Navigate'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Simulated IoT Bluetooth Digital Weighing Machine & Instant UPI Trigger */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Scale Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Bluetooth
                  className={`w-5 h-5 ${
                    bleScale.isConnected ? 'text-blue-400 animate-pulse' : 'text-slate-500'
                  }`}
                />
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight">
                    RecycleScale BLE-v2 Hardware
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    HX711 Loadcell / ESP32 Firmware 2.4.1
                  </p>
                </div>
              </div>

              <button
                onClick={toggleBleConnection}
                className={`flex items-center space-x-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border transition ${
                  bleScale.isConnected
                    ? 'text-emerald-400 bg-emerald-950/80 border-emerald-600/40'
                    : 'text-rose-400 bg-rose-950/80 border-rose-600/40'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    bleScale.isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
                  }`}
                />
                <span>{bleScale.isConnected ? 'SYNCED' : 'DISCONNECTED'}</span>
              </button>
            </div>

            {/* Tamper-Proof Digital LCD Weight Display Screen */}
            <div className="bg-black/90 rounded-3xl p-6 border border-emerald-500/30 text-center space-y-2 mb-4 relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-widest text-emerald-400/80">
                <span>Tamper-Proof Weight Output</span>
                {bleScale.isLocked && (
                  <span className="flex items-center text-amber-400 font-bold">
                    <Lock className="w-3 h-3 mr-1" />
                    LOCKED
                  </span>
                )}
              </div>

              <div className="text-5xl sm:text-6xl font-black text-emerald-400 font-lcd lcd-glow-green tracking-wider py-1">
                {bleScale.currentWeight.toFixed(2)}{' '}
                <span className="text-xl sm:text-2xl text-emerald-500">KG</span>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-mono">
                <span>Tare Offset: {bleScale.tareOffset.toFixed(2)}kg</span>
                <span>&bull;</span>
                <span>Loadcell Error: ±0.01kg</span>
              </div>
            </div>

            {/* Scale Simulator Controls */}
            <div className="space-y-3.5 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold">Select Material on Scale:</span>
                <select
                  value={bleScale.selectedMaterialId}
                  onChange={e => setBleMaterial(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-1.5 outline-none font-medium"
                >
                  {scrapRates.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} (₹{r.rate}/{r.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Simulated Weights */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5 font-bold uppercase tracking-wider">
                  Simulate Physical Scale Load:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setBleWeight(5.2)}
                    className="py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-mono text-center transition font-bold"
                  >
                    5.2kg
                  </button>
                  <button
                    onClick={() => setBleWeight(12.8)}
                    className="py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-mono text-center transition font-bold"
                  >
                    12.8kg
                  </button>
                  <button
                    onClick={() => setBleWeight(24.5)}
                    className="py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-mono text-center transition font-bold"
                  >
                    24.5kg
                  </button>
                  <button
                    onClick={tareBleScale}
                    className="py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-mono text-center transition font-bold"
                  >
                    Tare
                  </button>
                </div>
              </div>

              {/* Fine weight slider */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Fine Adjust Loadcell:</span>
                  <span className="font-mono text-white">{bleScale.currentWeight.toFixed(1)} kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="0.1"
                  value={bleScale.currentWeight}
                  onChange={e => setBleWeight(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                />
              </div>
            </div>

            {/* Valuation Output Box */}
            <div className="mt-4 p-4 bg-slate-800/80 rounded-2xl flex items-center justify-between border border-slate-700">
              <div>
                <span className="text-xs text-slate-300 block">Calculated Instant Payout:</span>
                <span className="text-[11px] text-slate-400">
                  {bleScale.currentWeight.toFixed(2)} kg &times; ₹{selectedRateObj.rate}
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                ₹ {currentScalePrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Instant UPI Disbursement Button */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={handleDisburseUpi}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/25 transition flex items-center justify-center space-x-2 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Disburse Instant UPI to Resident</span>
            </button>
            <p className="text-[10px] text-center text-slate-500 mt-2">
              Cryptographic SHA-256 weight hash automatically committed to ULB Municipal ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
