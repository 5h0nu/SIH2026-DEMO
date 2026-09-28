import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  PackagePlus,
  Calendar,
  MapPin,
  Camera,
  CheckCircle2,
  ShieldCheck,
  Building,
  Home,
  LocateFixed,
  Compass,
  Loader2
} from 'lucide-react';
import { playScaleBeep } from '../../utils/audio';

export const BookingModal: React.FC = () => {
  const {
    isBookingModalOpen,
    closeBookingModal,
    bookingInitialEstimates,
    scrapRates,
    createPickupOrder,
    showToast,
    language,
    userLocation,
    userCoords,
    isDetectingLocation,
    detectUserLocation
  } = useApp();

  const [bookingType, setBookingType] = useState<'Household' | 'Society/Bulk'>('Household');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([
    'Corrugated Cardboard',
    'PET Bottles (Plastic)'
  ]);
  const [estimatedWeight, setEstimatedWeight] = useState<number>(12);
  const [timeSlot, setTimeSlot] = useState<string>('Today: 2:00 PM - 4:00 PM');
  const [address, setAddress] = useState<string>(userLocation);
  const [pincode, setPincode] = useState<string>('560038');
  const [upiId, setUpiId] = useState<string>('user@okhdfcbank');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Sync address when userLocation updates or modal opens
  useEffect(() => {
    if (userLocation) {
      setAddress(userLocation);
    }
  }, [userLocation, isBookingModalOpen]);

  const handleAutoDetectLocation = async () => {
    const loc = await detectUserLocation();
    setAddress(loc);
    setPincode('560038');
  };


  useEffect(() => {
    if (bookingInitialEstimates) {
      if (bookingInitialEstimates.weight) {
        setEstimatedWeight(bookingInitialEstimates.weight);
      }
      if (bookingInitialEstimates.categoryId) {
        const cat = scrapRates.find(r => r.id === bookingInitialEstimates.categoryId);
        if (cat && !selectedMaterials.includes(cat.name)) {
          setSelectedMaterials(prev => [...prev, cat.name]);
        }
      }
    }
  }, [bookingInitialEstimates, scrapRates]);

  // Adjust weight default when switching between Household and Bulk Society
  const handleTypeChange = (type: 'Household' | 'Society/Bulk') => {
    setBookingType(type);
    if (type === 'Society/Bulk') {
      setEstimatedWeight(Math.max(60, estimatedWeight));
    } else {
      setEstimatedWeight(Math.min(30, estimatedWeight));
    }
  };

  if (!isBookingModalOpen) return null;

  const toggleMaterial = (name: string) => {
    setSelectedMaterials(prev =>
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    );
  };

  const matchingRates = scrapRates.filter(r => selectedMaterials.includes(r.name));
  const avgRate =
    matchingRates.length > 0
      ? matchingRates.reduce((acc, curr) => acc + curr.rate, 0) / matchingRates.length
      : 18;

  // Add 5% community bonus for bulk society bookings
  const bulkMultiplier = bookingType === 'Society/Bulk' ? 1.05 : 1.0;
  const estimatedPayout = Math.round(estimatedWeight * avgRate * bulkMultiplier);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMaterials.length === 0) {
      alert('Please select at least one material category.');
      return;
    }

    createPickupOrder({
      materials: selectedMaterials,
      estimatedWeight,
      estimatedPayout,
      timeSlot,
      address,
      pincode,
      upiId,
      photoUrl: photoPreview || undefined,
      bookingType
    });

    closeBookingModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-7 shadow-2xl border border-slate-200 space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-inner">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {language === 'hi' ? 'घर बैठे रद्दी पिकअप बुक करें' : 'Schedule Doorstep Scrap Pickup'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'hi'
                  ? 'डिजिटल तौल मशीन एवं तुरंत UPI बैंक ट्रांसफर'
                  : 'Fair BLE digital scales & instant UPI payout guarantee'}
              </p>
            </div>
          </div>
          <button
            onClick={closeBookingModal}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Generator Type Selector (Household vs Bulk Society) */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => handleTypeChange('Household')}
            className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition ${
              bookingType === 'Household'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Household (3-40 kg)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('Society/Bulk')}
            className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition ${
              bookingType === 'Society/Bulk'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Gated Society / RWA (50+ kg)</span>
          </button>
        </div>

        {/* Workflow Info Callout */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 flex items-start space-x-2.5 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Smart India Hackathon Municipal Workflow:</span>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Your request is routed directly to the <strong>ULB Municipal Admin</strong> for ward verification and zero-contamination check. Once confirmed, a certified local Kabadiwala is dispatched with an IoT Bluetooth scale!
              {bookingType === 'Society/Bulk' && (
                <span className="block mt-1 font-bold text-emerald-700">
                  🎉 +5% Community Bulk Segregation Incentive Applied!
                </span>
              )}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Material Category Multi-selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Select Scrap Materials for Pickup:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {scrapRates.slice(0, 6).map(cat => {
                const isSelected = selectedMaterials.includes(cat.name);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => toggleMaterial(cat.name)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-[11px] truncate">{cat.name}</span>
                    <span className="text-[10px] text-emerald-700 font-bold shrink-0 ml-1">
                      ₹{cat.rate}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estimated Weight & Preferred Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">Estimated Weight</label>
                <span className="font-mono font-bold text-emerald-700">{estimatedWeight} kg</span>
              </div>
              <input
                type="range"
                min={bookingType === 'Society/Bulk' ? 40 : 3}
                max={bookingType === 'Society/Bulk' ? 300 : 60}
                value={estimatedWeight}
                onChange={e => setEstimatedWeight(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Min: {bookingType === 'Society/Bulk' ? '40 kg' : '3 kg'}</span>
                <span>Est. Payout: ~₹{estimatedPayout}</span>
                <span>Max: {bookingType === 'Society/Bulk' ? '300 kg' : '60 kg'}</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Preferred Time Slot</label>
              <div className="relative">
                <select
                  value={timeSlot}
                  onChange={e => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 bg-white"
                >
                  <option>Today: 2:00 PM - 4:00 PM</option>
                  <option>Today: 4:00 PM - 6:00 PM</option>
                  <option>Tomorrow: 9:00 AM - 12:00 PM</option>
                  <option>Tomorrow: 2:00 PM - 5:00 PM</option>
                  <option>Sunday Community Drive</option>
                </select>
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Address & Pincode with Auto-Detect Location */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700">Doorstep Address &amp; Landmark</label>
              <button
                type="button"
                onClick={handleAutoDetectLocation}
                disabled={isDetectingLocation}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-xl transition flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
              >
                {isDetectingLocation ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{isDetectingLocation ? 'Detecting GPS...' : '📍 Auto-Detect Location'}</span>
              </button>
            </div>

            {userCoords && (
              <div className="text-[10px] text-emerald-800 bg-emerald-50/70 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center space-x-1 font-mono">
                <Compass className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{userCoords}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Flat No, Apartment, Street name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                />
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Postal Pincode</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                placeholder="560038"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* UPI ID for Payout */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">UPI ID for Direct Bank Payout</label>
            <div className="relative">
              <input
                type="text"
                required
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="mobile@upi or id@okhdfc"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-mono"
              />
              <span className="absolute right-3 top-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                VERIFIED UPI
              </span>
            </div>
          </div>

          {/* Optional Photo Attachment */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Optional: Photo of Scrap (Fast-tracks Admin Verification)
            </label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition text-slate-600">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span className="text-xs">
                  {photoPreview ? 'Change Photo Attached' : 'Attach Photo of Waste Pile'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {photoPreview && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-300">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Payout Summary Sticky Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                Estimated Doorstep Earnings
              </span>
              <div className="text-xl font-extrabold text-emerald-700">₹ {estimatedPayout}.00</div>
              <span className="text-[10px] text-slate-500">
                Based on current ~{estimatedWeight} kg dry recyclables
              </span>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 transition flex items-center space-x-2 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm &amp; Send to Admin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
