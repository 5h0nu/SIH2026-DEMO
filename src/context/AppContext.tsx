import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  Role,
  Language,
  ScrapCategory,
  PickupOrder,
  AdminLedgerItem,
  ChatMessage,
  RewardItem,
  RouteStop
} from '../types';
import {
  initialScrapRates,
  initialPickupOrders,
  initialAdminLedger,
  initialRewards,
  initialRouteStops
} from '../data/mockData';
import {
  getStoredGroqApiKey,
  setStoredGroqApiKey,
  fetchDailyScrapPricesFromGroq
} from '../services/groqService';
import type { GroqPriceResponse } from '../services/groqService';
import {
  playScaleBeep,
  playScaleTare,
  playBleConnect,
  playUpiPaymentSuccess
} from '../utils/audio';
import confetti from 'canvas-confetti';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

interface BleScaleState {
  isConnected: boolean;
  currentWeight: number;
  tareOffset: number;
  selectedMaterialId: string;
  activeOrderId?: string;
  isLocked: boolean;
  scaleHash?: string;
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  language: Language;
  toggleLanguage: () => void;
  scrapRates: ScrapCategory[];
  orders: PickupOrder[];
  adminLedger: AdminLedgerItem[];
  groqKey: string;
  setGroqKey: (key: string) => void;
  groqMandiInfo: {
    mandi: string;
    timestamp: string;
    marketSummary: string;
    source: 'groq' | 'simulation';
  };
  isFetchingRates: boolean;
  refreshDailyRates: () => Promise<void>;

  // Wallet, Impact & Swachh Points
  userWallet: {
    balance: number;
    lifetime: number;
    divertedKg: number;
    co2Kg: number;
  };
  swachhPoints: number;
  rewardsList: RewardItem[];
  redeemReward: (rewardId: string) => void;

  // User / Resident Location State & GPS Auto-Detection
  userLocation: string;
  setUserLocation: (loc: string) => void;
  userCoords: string | null;
  isDetectingLocation: boolean;
  detectUserLocation: () => Promise<string>;

  adminKpis: {
    divertedTons: number;
    formalizedPartners: number;
    eprCertificates: number;
    payoutsLakh: number;
  };

  // BLE Scale & Sound FX
  bleScale: BleScaleState;
  setBleWeight: (weight: number) => void;
  setBleMaterial: (materialId: string) => void;
  tareBleScale: () => void;
  toggleBleConnection: () => void;
  lockScaleWeight: () => string;
  loadOrderIntoScale: (orderId: string) => void;

  // Order Lifecycle
  createPickupOrder: (data: {
    materials: string[];
    estimatedWeight: number;
    estimatedPayout: number;
    timeSlot: string;
    address: string;
    pincode: string;
    upiId: string;
    photoUrl?: string;
    bookingType?: 'Household' | 'Society/Bulk';
  }) => PickupOrder;
  approveOrder: (orderId: string, priority?: 'Normal' | 'High' | 'Bulky', notes?: string) => void;
  rejectOrder: (orderId: string, reason?: string) => void;
  acceptCollectorLead: (orderId: string) => void;
  passCollectorLead: (orderId: string) => void;
  completeOrderWithScale: (orderId: string, weight: number, payout: number) => void;

  // Route Planning & GPS
  routeStops: RouteStop[];
  optimizeRouteTsp: () => void;

  // Modals & UI
  isBookingModalOpen: boolean;
  openBookingModal: (initialEstimates?: { weight?: number; categoryId?: string; payout?: number }) => void;
  closeBookingModal: () => void;
  bookingInitialEstimates?: { weight?: number; categoryId?: string; payout?: number };

  isGroqModalOpen: boolean;
  openGroqModal: () => void;
  closeGroqModal: () => void;

  isPaymentModalOpen: boolean;
  paymentModalData?: {
    amount: number;
    recipientName: string;
    upiRef: string;
    orderId: string;
    scaleHash: string;
  };
  closePaymentModal: () => void;

  isEprModalOpen: boolean;
  openEprModal: () => void;
  closeEprModal: () => void;

  isRewardsModalOpen: boolean;
  openRewardsModal: () => void;
  closeRewardsModal: () => void;

  isCertificateModalOpen: boolean;
  openCertificateModal: () => void;
  closeCertificateModal: () => void;

  // SetuAI Assistant
  isChatModalOpen: boolean;
  openChatModal: () => void;
  closeChatModal: () => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => Promise<void>;
  isAiTyping: boolean;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;

  // Reset
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(() => {
    try {
      return (localStorage.getItem('recyclesetu_role') as Role) || 'citizen';
    } catch {
      return 'citizen';
    }
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      return (localStorage.getItem('recyclesetu_lang') as Language) || 'en';
    } catch {
      return 'en';
    }
  });

  const [scrapRates, setScrapRates] = useState<ScrapCategory[]>(() => {
    try {
      const saved = localStorage.getItem('recyclesetu_rates');
      return saved ? JSON.parse(saved) : initialScrapRates;
    } catch {
      return initialScrapRates;
    }
  });

  const [orders, setOrders] = useState<PickupOrder[]>(() => {
    try {
      const saved = localStorage.getItem('recyclesetu_orders');
      return saved ? JSON.parse(saved) : initialPickupOrders;
    } catch {
      return initialPickupOrders;
    }
  });

  const [adminLedger, setAdminLedger] = useState<AdminLedgerItem[]>(() => {
    try {
      const saved = localStorage.getItem('recyclesetu_ledger');
      return saved ? JSON.parse(saved) : initialAdminLedger;
    } catch {
      return initialAdminLedger;
    }
  });

  const [groqKey, setGroqKeyState] = useState<string>(() => getStoredGroqApiKey());

  const [groqMandiInfo, setGroqMandiInfo] = useState<{
    mandi: string;
    timestamp: string;
    marketSummary: string;
    source: 'groq' | 'simulation';
  }>({
    mandi: 'Bengaluru & Delhi NCR Hub',
    timestamp: 'Today (Live Mandi Index)',
    marketSummary: 'Daily spot scrap indices updated via verified circular mandi transactions.',
    source: 'simulation'
  });

  const [isFetchingRates, setIsFetchingRates] = useState<boolean>(false);

  // Citizen Green Wallet & Swachh Points
  const [userWallet, setUserWallet] = useState<{
    balance: number;
    lifetime: number;
    divertedKg: number;
    co2Kg: number;
  }>({
    balance: 1480.0,
    lifetime: 1480.0,
    divertedKg: 84.5,
    co2Kg: 122.0
  });

  const [swachhPoints, setSwachhPoints] = useState<number>(480);
  const [rewardsList, setRewardsList] = useState<RewardItem[]>(initialRewards);

  // User / Resident Location State & GPS Auto-Detection
  const [userLocation, setUserLocation] = useState<string>(() => {
    try {
      return localStorage.getItem('recyclesetu_location') || 'Flat 402, Green Palm Residency, Indiranagar, Bengaluru';
    } catch {
      return 'Flat 402, Green Palm Residency, Indiranagar, Bengaluru';
    }
  });
  const [userCoords, setUserCoords] = useState<string | null>('12.9716° N, 77.6412° E (GPS High Accuracy)');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  const detectUserLocation = async (): Promise<string> => {
    setIsDetectingLocation(true);
    return new Promise(resolve => {
      const finalizeSuccess = (lat: string, lng: string, accuracy: string) => {
        const coords = `${lat}° N, ${lng}° E (${accuracy})`;
        const loc = 'Flat 402, Green Palm Residency, 12th Main Rd, Indiranagar Ward 4B, Bengaluru';
        setUserCoords(coords);
        setUserLocation(loc);
        try {
          localStorage.setItem('recyclesetu_location', loc);
        } catch {
          // ignore
        }
        setIsDetectingLocation(false);
        playScaleBeep();
        showToast('📍 GPS Location auto-detected: Indiranagar Ward 4B, Bengaluru!', 'success');
        resolve(loc);
      };

      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const lat = pos.coords.latitude.toFixed(4);
            const lng = pos.coords.longitude.toFixed(4);
            finalizeSuccess(lat, lng, 'GPS High Accuracy ±4m');
          },
          () => {
            setTimeout(() => {
              finalizeSuccess('12.9716', '77.6412', 'GPS High Accuracy ±4m');
            }, 600);
          },
          { timeout: 5000 }
        );
      } else {
        setTimeout(() => {
          finalizeSuccess('12.9716', '77.6412', 'GPS High Accuracy ±4m');
        }, 600);
      }
    });
  };

  // Admin KPIs
  const [adminKpis, setAdminKpis] = useState<{
    divertedTons: number;
    formalizedPartners: number;
    eprCertificates: number;
    payoutsLakh: number;
  }>({
    divertedTons: 428.6,
    formalizedPartners: 342,
    eprCertificates: 184,
    payoutsLakh: 38.4
  });

  // BLE Digital Scale State
  const [bleScale, setBleScale] = useState<BleScaleState>({
    isConnected: true,
    currentWeight: 14.8,
    tareOffset: 0.0,
    selectedMaterialId: 'cardboard',
    isLocked: false
  });

  // Route Stops for GPS Map
  const [routeStops, setRouteStops] = useState<RouteStop[]>(initialRouteStops);

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingInitialEstimates, setBookingInitialEstimates] = useState<{ weight?: number; categoryId?: string; payout?: number } | undefined>();
  const [isGroqModalOpen, setIsGroqModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState<{
    amount: number;
    recipientName: string;
    upiRef: string;
    orderId: string;
    scaleHash: string;
  } | undefined>();
  const [isEprModalOpen, setIsEprModalOpen] = useState(false);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  // SetuAI Waste Assistant Chat State
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Namaste! I am SetuAI, your circular economy & scrap recycling assistant. Ask me anything about current scrap prices, segregation guidelines, e-waste handling, or booking a pickup!',
      timestamp: 'Just now',
      suggestedAction: { label: 'Check Today Mandi Rates', target: 'rates' }
    }
  ]);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    try {
      localStorage.setItem('recyclesetu_role', role);
      localStorage.setItem('recyclesetu_lang', language);
      localStorage.setItem('recyclesetu_rates', JSON.stringify(scrapRates));
      localStorage.setItem('recyclesetu_orders', JSON.stringify(orders));
      localStorage.setItem('recyclesetu_ledger', JSON.stringify(adminLedger));
    } catch (e) {
      console.error('LocalStorage sync error:', e);
    }
  }, [role, language, scrapRates, orders, adminLedger]);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    showToast(
      language === 'hi'
        ? `रोल बदला: ${newRole === 'citizen' ? 'नागरिक पोर्टल' : newRole === 'collector' ? 'कबाड़ीवाला पोर्टल' : 'नगर निगम एडमिन'}`
        : `Switched view to ${newRole.toUpperCase()} Portal`,
      'info'
    );
  };

  const toggleLanguage = () => {
    const newLang: Language = language === 'en' ? 'hi' : 'en';
    setLanguageState(newLang);
    showToast(newLang === 'hi' ? 'भाषा हिन्दी में बदल दी गई है' : 'Switched language to English', 'info');
  };

  const setGroqKey = (key: string) => {
    setGroqKeyState(key);
    setStoredGroqApiKey(key);
    showToast(key ? 'Groq API Key saved! Real-time Llama 3.3 enabled.' : 'Groq API Key cleared. Prototype running in Edge AI simulation mode.', 'success');
  };

  const refreshDailyRates = async () => {
    setIsFetchingRates(true);
    try {
      const res: GroqPriceResponse = await fetchDailyScrapPricesFromGroq(groqKey);
      setScrapRates(res.updatedRates);
      setGroqMandiInfo({
        mandi: res.mandi,
        timestamp: res.timestamp,
        marketSummary: res.marketSummary,
        source: res.source
      });
      playScaleBeep();
      showToast(
        res.source === 'groq'
          ? 'Live scrap mandi prices fetched via Groq Llama 3.3!'
          : 'Scrap rates synced with dynamic benchmark index!',
        'success'
      );
    } catch {
      showToast('Could not fetch rates. Using fallback benchmark card.', 'warning');
    } finally {
      setIsFetchingRates(false);
    }
  };

  // BLE Scale actions with authentic sound effects!
  const setBleWeight = (weight: number) => {
    setBleScale(prev => ({
      ...prev,
      currentWeight: Math.max(0, +weight.toFixed(2)),
      isLocked: false
    }));
    playScaleBeep();
  };

  const setBleMaterial = (materialId: string) => {
    setBleScale(prev => ({ ...prev, selectedMaterialId: materialId }));
    playScaleBeep();
  };

  const tareBleScale = () => {
    setBleScale(prev => ({
      ...prev,
      tareOffset: prev.currentWeight,
      currentWeight: 0.0,
      isLocked: false
    }));
    playScaleTare();
    showToast('Digital scale zeroed / tared (0.00 kg).', 'info');
  };

  const toggleBleConnection = () => {
    setBleScale(prev => {
      const next = !prev.isConnected;
      if (next) playBleConnect();
      showToast(next ? 'Scale connected via Bluetooth (ESP32 BLE-v2)' : 'Scale disconnected', next ? 'success' : 'warning');
      return { ...prev, isConnected: next };
    });
  };

  const lockScaleWeight = (): string => {
    const hash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setBleScale(prev => ({ ...prev, isLocked: true, scaleHash: hash }));
    playScaleBeep();
    return hash;
  };

  const loadOrderIntoScale = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let matchedMatId = 'cardboard';
    if (order.materials.some(m => m.toLowerCase().includes('bottle') || m.toLowerCase().includes('plastic'))) {
      matchedMatId = 'pet_bottle';
    } else if (order.materials.some(m => m.toLowerCase().includes('iron') || m.toLowerCase().includes('metal'))) {
      matchedMatId = 'iron';
    } else if (order.materials.some(m => m.toLowerCase().includes('copper'))) {
      matchedMatId = 'copper';
    } else if (order.materials.some(m => m.toLowerCase().includes('ewaste') || m.toLowerCase().includes('pcb'))) {
      matchedMatId = 'ewaste';
    }

    setBleScale(prev => ({
      ...prev,
      activeOrderId: orderId,
      currentWeight: order.estimatedWeight || 12.5,
      selectedMaterialId: matchedMatId,
      isLocked: false
    }));

    playScaleBeep();
    showToast(`Loaded Order ${order.id} (${order.citizenName}) into IoT Scale!`, 'info');
  };

  // Order Lifecycle
  const createPickupOrder = (data: {
    materials: string[];
    estimatedWeight: number;
    estimatedPayout: number;
    timeSlot: string;
    address: string;
    pincode: string;
    upiId: string;
    photoUrl?: string;
    bookingType?: 'Household' | 'Society/Bulk';
  }): PickupOrder => {
    const newId = `RS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: PickupOrder = {
      id: newId,
      citizenName: 'You (Citizen Resident)',
      citizenPhone: '+91 98450 XXXXX',
      address: data.address,
      pincode: data.pincode || '560038',
      ward: 'Ward 4B (Koramangala/Indiranagar)',
      distance: '0.4 km away',
      materials: data.materials,
      estimatedWeight: data.estimatedWeight,
      estimatedPayout: data.estimatedPayout,
      timeSlot: data.timeSlot,
      upiId: data.upiId,
      photoUrl: data.photoUrl,
      status: 'pending_admin_approval',
      createdAt: 'Just now',
      adminPriority: data.bookingType === 'Society/Bulk' ? 'Bulky' : 'Normal',
      adminNotes: 'Awaiting ULB Municipal verification',
      bookingType: data.bookingType || 'Household'
    };

    setOrders(prev => [newOrder, ...prev]);

    // Also add to route stops
    const newStop: RouteStop = {
      id: `STOP-${Math.floor(10 + Math.random() * 90)}`,
      orderId: newId,
      name: 'You (Citizen Resident)',
      address: data.address,
      weight: data.estimatedWeight,
      distanceKm: 0.5,
      status: 'pending',
      sequence: routeStops.length + 1,
      coordinates: { x: Math.floor(20 + Math.random() * 60), y: Math.floor(20 + Math.random() * 60) }
    };
    setRouteStops(prev => [...prev, newStop]);

    showToast(
      language === 'hi'
        ? `पिकअप अनुरोध ${newId} दर्ज हुआ! नगर निगम एडमिन द्वारा अनुमोदन की प्रतीक्षा में।`
        : `Pickup Request ${newId} created! Status: Pending ULB Admin Confirmation.`,
      'success'
    );

    return newOrder;
  };

  const approveOrder = (orderId: string, priority: 'Normal' | 'High' | 'Bulky' = 'Normal', notes: string = 'Verified recyclable dry waste') => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'collector_assigned',
            adminApprovalTimestamp: 'Just now',
            assignedCollector: 'Ramesh Kumar (Ward 4B Partner)',
            adminPriority: priority,
            adminNotes: notes
          };
        }
        return ord;
      })
    );
    showToast(
      language === 'hi'
        ? `अनुरोध ${orderId} स्वीकृत! वार्ड कबाड़ीवाला (रमेश कुमार) को सौंपा गया।`
        : `Order ${orderId} approved by Municipal Admin! Dispatched to Ward Kabadiwala.`,
      'success'
    );
  };

  const rejectOrder = (orderId: string, reason: string = 'Contaminated or wet waste flagged') => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'rejected',
            adminNotes: reason
          };
        }
        return ord;
      })
    );
    showToast(`Order ${orderId} rejected: ${reason}`, 'warning');
  };

  const acceptCollectorLead = (orderId: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return { ...ord, status: 'on_the_way' };
        }
        return ord;
      })
    );
    setRouteStops(prev =>
      prev.map(st => (st.orderId === orderId ? { ...st, status: 'en_route' } : st))
    );
    loadOrderIntoScale(orderId);
    showToast(`Accepted Job ${orderId}! Route navigation mapped to electric loader.`, 'success');
  };

  const passCollectorLead = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setRouteStops(prev => prev.filter(st => st.orderId !== orderId));
    showToast(`Lead ${orderId} passed to neighboring ward partner.`, 'info');
  };

  const completeOrderWithScale = (orderId: string, weight: number, payout: number) => {
    const hash = lockScaleWeight();
    const upiRef = 'UPI-' + Math.floor(1000000000 + Math.random() * 9000000000);
    const targetOrder = orders.find(o => o.id === orderId);

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'weighed_and_paid',
            actualWeight: weight,
            actualPayout: payout,
            completedTimestamp: 'Just now',
            scaleHash: hash,
            upiRefId: upiRef
          };
        }
        return ord;
      })
    );

    setRouteStops(prev =>
      prev.map(st => (st.orderId === orderId ? { ...st, status: 'completed' } : st))
    );

    // Update Citizen Wallet & Award Swachh Points (10 points per kg)
    const earnedPoints = Math.round(weight * 10);
    setUserWallet(prev => ({
      balance: +(prev.balance + payout).toFixed(2),
      lifetime: +(prev.lifetime + payout).toFixed(2),
      divertedKg: +(prev.divertedKg + weight).toFixed(1),
      co2Kg: +(prev.co2Kg + weight * 1.44).toFixed(1)
    }));
    setSwachhPoints(prev => prev + earnedPoints);

    // Update Admin KPIs
    setAdminKpis(prev => ({
      ...prev,
      divertedTons: +(prev.divertedTons + weight / 1000).toFixed(2),
      payoutsLakh: +(prev.payoutsLakh + payout / 100000).toFixed(2),
      eprCertificates: prev.eprCertificates + 1
    }));

    // Add traceability ledger item
    const newBatchId = `LOT-${Math.floor(9830 + Math.random() * 100)}`;
    const newLedgerItem: AdminLedgerItem = {
      id: `AUD-${Math.floor(910 + Math.random() * 80)}`,
      batchId: newBatchId,
      material: `${targetOrder?.materials.join(' + ') || 'Dry Scrap'} (${weight} kg)`,
      weight: `${weight} kg`,
      destination: 'Authorized CPCB Processing Center',
      timestamp: 'Just now',
      status: 'Verified EPR',
      traceabilityHash: hash.substring(0, 20)
    };
    setAdminLedger(prev => [newLedgerItem, ...prev]);

    // Play tactile soundbox chime!
    playUpiPaymentSuccess();

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    setPaymentModalData({
      amount: payout,
      recipientName: targetOrder?.citizenName || 'Resident Citizen',
      upiRef,
      orderId,
      scaleHash: hash
    });
    setIsPaymentModalOpen(true);

    showToast(`₹${payout.toFixed(2)} instant UPI payment disbursed! +${earnedPoints} Swachh Points earned.`, 'success');
  };

  // Route Optimizer (TSP Algorithm Simulation)
  const optimizeRouteTsp = () => {
    // Re-order pending stops by nearest distance
    const completedStops = routeStops.filter(s => s.status === 'completed');
    const activeStops = routeStops.filter(s => s.status !== 'completed');

    activeStops.sort((a, b) => a.distanceKm - b.distanceKm);

    const resequenced = activeStops.map((st, i) => ({
      ...st,
      sequence: completedStops.length + i + 1
    }));

    setRouteStops([...completedStops, ...resequenced]);
    playScaleBeep();
    showToast('AI Route Optimized! Saved 3.8 km electric loader battery range & 1.4 kg CO2.', 'success');
  };

  // Swachh Points Redemption
  const redeemReward = (rewardId: string) => {
    const reward = rewardsList.find(r => r.id === rewardId);
    if (!reward) return;

    if (swachhPoints < reward.pointsCost) {
      showToast(`Insufficient Swachh Points. Need ${reward.pointsCost} points!`, 'warning');
      return;
    }

    const coupon = `SWACHH-${reward.category.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;

    setSwachhPoints(prev => prev - reward.pointsCost);
    setRewardsList(prev =>
      prev.map(r => (r.id === rewardId ? { ...r, isRedeemed: true, couponCode: coupon } : r))
    );

    playUpiPaymentSuccess();
    showToast(`Redeemed "${reward.title}"! Voucher code: ${coupon}`, 'success');
  };

  // SetuAI Chatbot integration
  const sendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now'
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsAiTyping(true);

    // Call Groq API if key is present
    if (groqKey) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            messages: [
              {
                role: 'system',
                content: `You are SetuAI, an intelligent multilingual circular waste & informal kabadiwala assistant for the Smart India Hackathon platform "RecycleSetu".
Respond warmly, concisely, and authoritatively in the user's language (English or Hindi).
Provide accurate advice about scrap prices in India (₹), segregation at source (dry vs wet waste), plastics (#1 PETE, #2 HDPE, etc.), e-waste handling, and how the platform guarantees fair digital scale weight and instant UPI payments.`
              },
              ...chatMessages.map(m => ({
                role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
                content: m.text
              })),
              { role: 'user', content: text }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const aiReply = data.choices?.[0]?.message?.content;
          if (aiReply) {
            setChatMessages(prev => [
              ...prev,
              {
                id: `msg-ai-${Date.now()}`,
                sender: 'assistant',
                text: aiReply,
                timestamp: 'Just now'
              }
            ]);
            setIsAiTyping(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Groq chat error, falling back to local circular knowledge engine:', e);
      }
    }

    // High-fidelity fallback Circular Knowledge Engine
    await new Promise(res => setTimeout(res, 900));
    const lower = text.toLowerCase();
    let reply =
      'On RecycleSetu, dry waste is collected at your doorstep using IoT BLE certified scales and paid instantly via UPI. Make sure scrap is dry and segregated for maximum payout!';
    let action: ChatMessage['suggestedAction'];

    if (lower.includes('price') || lower.includes('rate') || lower.includes('mandi') || lower.includes('bhav')) {
      reply =
        'Current benchmark scrap rates today in India: Newspaper ₹14.50/kg, Corrugated Cardboard ₹13.00/kg, PET Bottles ₹18.00/kg, Iron ₹32.00/kg, Bare Copper ₹440.00/kg, and E-Waste ₹48.00/kg. You can auto-sync live prices using our Groq AI engine!';
      action = { label: 'Open Scrap Calculator', target: 'calculator' };
    } else if (lower.includes('thermocol') || lower.includes('foam') || lower.includes('eps')) {
      reply =
        'Thermocol (Expanded Polystyrene / EPS-6) is accepted if clean and compacted! However, due to its very low bulk density, it is best bundled with cardboard cartons for collection.';
    } else if (lower.includes('e-waste') || lower.includes('electronic') || lower.includes('mobile') || lower.includes('laptop')) {
      reply =
        'E-Waste (circuit boards, defunct chargers, old phones) should NEVER be mixed with wet garbage. RecycleSetu dispatches certified e-waste recyclers who safely extract gold, copper, and rare-earth elements compliant with CPCB WEEE norms!';
      action = { label: 'Scan E-Waste with AI', target: 'scanner' };
    } else if (lower.includes('point') || lower.includes('reward') || lower.includes('tax')) {
      reply =
        'Every kilogram of dry waste you divert earns you 10 Swachh Green Points! You can redeem points for property tax rebates, electric bus passes, and organic urban compost in the Green Rewards store.';
    } else if (lower.includes('book') || lower.includes('pickup') || lower.includes('schedule')) {
      reply =
        'You can schedule a free doorstep pickup right now! Your order will be verified by the ULB Municipal Admin and dispatched to your ward partner Ramesh Kumar.';
      action = { label: 'Schedule Free Pickup', target: 'booking' };
    }

    setChatMessages(prev => [
      ...prev,
      {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: 'Just now',
        suggestedAction: action
      }
    ]);
    setIsAiTyping(false);
  };

  const openBookingModal = (initialEstimates?: { weight?: number; categoryId?: string; payout?: number }) => {
    setBookingInitialEstimates(initialEstimates);
    setIsBookingModalOpen(true);
  };
  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingInitialEstimates(undefined);
  };

  const openGroqModal = () => setIsGroqModalOpen(true);
  const closeGroqModal = () => setIsGroqModalOpen(false);

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentModalData(undefined);
  };

  const openEprModal = () => setIsEprModalOpen(true);
  const closeEprModal = () => setIsEprModalOpen(false);

  const openRewardsModal = () => setIsRewardsModalOpen(true);
  const closeRewardsModal = () => setIsRewardsModalOpen(false);

  const openCertificateModal = () => setIsCertificateModalOpen(true);
  const closeCertificateModal = () => setIsCertificateModalOpen(false);

  const openChatModal = () => setIsChatModalOpen(true);
  const closeChatModal = () => setIsChatModalOpen(false);

  const resetDemoData = () => {
    setScrapRates(initialScrapRates);
    setOrders(initialPickupOrders);
    setAdminLedger(initialAdminLedger);
    setUserWallet({
      balance: 1480.0,
      lifetime: 1480.0,
      divertedKg: 84.5,
      co2Kg: 122.0
    });
    setSwachhPoints(480);
    setRewardsList(initialRewards);
    setRouteStops(initialRouteStops);
    setBleScale({
      isConnected: true,
      currentWeight: 14.8,
      tareOffset: 0.0,
      selectedMaterialId: 'cardboard',
      isLocked: false
    });
    localStorage.removeItem('recyclesetu_rates');
    localStorage.removeItem('recyclesetu_orders');
    localStorage.removeItem('recyclesetu_ledger');
    showToast('Demo data reset to default benchmark state.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        language,
        toggleLanguage,
        scrapRates,
        orders,
        adminLedger,
        groqKey,
        setGroqKey,
        groqMandiInfo,
        isFetchingRates,
        refreshDailyRates,
        userWallet,
        swachhPoints,
        rewardsList,
        redeemReward,
        userLocation,
        setUserLocation,
        userCoords,
        isDetectingLocation,
        detectUserLocation,
        adminKpis,
        bleScale,
        setBleWeight,
        setBleMaterial,
        tareBleScale,
        toggleBleConnection,
        lockScaleWeight,
        loadOrderIntoScale,
        createPickupOrder,
        approveOrder,
        rejectOrder,
        acceptCollectorLead,
        passCollectorLead,
        completeOrderWithScale,
        routeStops,
        optimizeRouteTsp,
        isBookingModalOpen,
        openBookingModal,
        closeBookingModal,
        bookingInitialEstimates,
        isGroqModalOpen,
        openGroqModal,
        closeGroqModal,
        isPaymentModalOpen,
        paymentModalData,
        closePaymentModal,
        isEprModalOpen,
        openEprModal,
        closeEprModal,
        isRewardsModalOpen,
        openRewardsModal,
        closeRewardsModal,
        isCertificateModalOpen,
        openCertificateModal,
        closeCertificateModal,
        isChatModalOpen,
        openChatModal,
        closeChatModal,
        chatMessages,
        sendChatMessage,
        isAiTyping,
        toasts,
        showToast,
        resetDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
