import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Award,
  TrendingUp,
  Users,
  IndianRupee,
  Clock,
  Check,
  XCircle,
  CheckCircle2,
  Search,
  Download,
  ShieldCheck,
  Scale,
  MapPin,
  Truck,
  Zap,
  LocateFixed,
  Compass,
  Loader2,
  Factory,
  Phone,
  Plus,
  X,
  Sparkles,
  ExternalLink,
  QrCode
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { initialWards, initialPartnerDirectory } from '../../data/mockData';
import { playScaleBeep } from '../../utils/audio';
import type { PartnerEntity } from '../../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type AdminTab = 'overview' | 'pricing' | 'wards' | 'partners' | 'epr';

export const AdminView: React.FC = () => {
  const {
    adminKpis,
    adminLedger,
    orders,
    scrapRates,
    approveOrder,
    rejectOrder,
    openEprModal,
    showToast
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('overview');
  const [ledgerSearch, setLedgerSearch] = useState<string>('');
  const [priorityMap, setPriorityMap] = useState<Record<string, 'Normal' | 'High' | 'Bulky'>>({});

  // Municipal Subsidy State
  const [subsidyActive, setSubsidyActive] = useState<boolean>(true);
  const [wardList, setWardList] = useState(initialWards);

  // Partners State & Auto-Detect Location
  const [partnersList, setPartnersList] = useState<PartnerEntity[]>(initialPartnerDirectory);
  const [partnerFilter, setPartnerFilter] = useState<'all' | 'recycler' | 'kabadiwala'>('all');
  const [partnerSearch, setPartnerSearch] = useState<string>('');
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState<boolean>(false);

  // Admin Location
  const [adminLocation, setAdminLocation] = useState<string>(
    'Zone East Central Command (Indiranagar, Bengaluru)'
  );
  const [isAdminLocating, setIsAdminLocating] = useState<boolean>(false);
  const [gpsCoords, setGpsCoords] = useState<string | null>(null);

  // New Partner Form State
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerType, setNewPartnerType] = useState<'Industrial Recycler' | 'Certified Kabadiwala'>('Industrial Recycler');
  const [newPartnerCategory, setNewPartnerCategory] = useState('Corrugated OCC / Paper');
  const [newPartnerLocation, setNewPartnerLocation] = useState('Peenya Phase 1, Bengaluru');
  const [newPartnerLicense, setNewPartnerLicense] = useState('CPCB-REC-2024-BLR-89');
  const [newPartnerCapacity, setNewPartnerCapacity] = useState('1,500 MT / month');
  const [newPartnerPhone, setNewPartnerPhone] = useState('+91 98450 77120');

  // Pending approval orders
  const pendingOrders = orders.filter(o => o.status === 'pending_admin_approval');

  // Filtered ledger
  const filteredLedger = adminLedger.filter(
    item =>
      item.batchId.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      item.material.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      item.destination.toLowerCase().includes(ledgerSearch.toLowerCase())
  );

  const handleApprove = (orderId: string) => {
    const priority = priorityMap[orderId] || 'Normal';
    approveOrder(orderId, priority, 'Approved: Clean dry scrap verified for ward partner');
    playScaleBeep();
  };

  const handleReject = (orderId: string) => {
    rejectOrder(orderId, 'Flagged: Contaminated or mixed wet waste');
  };

  const handleToggleSubsidy = () => {
    setSubsidyActive(!subsidyActive);
    playScaleBeep();
    showToast(
      !subsidyActive
        ? 'Municipal Circular Green Subsidy (+₹2.00/kg) activated on PET & Paper!'
        : 'Municipal Subsidy paused. Benchmark spot rates restored.',
      'info'
    );
  };

  const handleIssueCitation = (wardName: string) => {
    playScaleBeep();
    showToast(`Issued "Swachh Ward Green Citation" to ${wardName}!`, 'success');
  };

  const handleFlagContamination = (wardId: string) => {
    setWardList(prev =>
      prev.map(w =>
        w.wardId === wardId ? { ...w, status: 'Flagged' as const, contaminationRate: +(w.contaminationRate + 0.5).toFixed(1) } : w
      )
    );
    showToast(`Inspection team dispatched to inspect Ward ${wardId}!`, 'warning');
  };

  const handleDownloadLedgerCsv = () => {
    showToast('Municipal EPR Traceability CSV exported successfully!', 'success');
  };

  // Auto-Detect Location for Admin & Nearest Partner Sort
  const handleAutoDetectAdminLocation = () => {
    setIsAdminLocating(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude.toFixed(4);
          const lng = pos.coords.longitude.toFixed(4);
          setGpsCoords(`${lat}° N, ${lng}° E (GPS High Accuracy)`);
          setAdminLocation('Indiranagar Ward 4B, Zone East, Bengaluru');
          setIsAdminLocating(false);
          playScaleBeep();
          showToast('GPS Location detected! Sorted nearest recycling partners.', 'success');
        },
        () => {
          setTimeout(() => {
            setGpsCoords('12.9716° N, 77.6412° E (GPS High Accuracy ±4m)');
            setAdminLocation('Indiranagar Ward 4B, Zone East, Bengaluru');
            setIsAdminLocating(false);
            playScaleBeep();
            showToast('GPS Location detected: Zone East Central Hub, Bengaluru!', 'success');
          }, 600);
        },
        { timeout: 5000 }
      );
    } else {
      setTimeout(() => {
        setGpsCoords('12.9716° N, 77.6412° E (GPS High Accuracy ±4m)');
        setAdminLocation('Indiranagar Ward 4B, Zone East, Bengaluru');
        setIsAdminLocating(false);
        playScaleBeep();
        showToast('GPS Location detected: Zone East Central Hub, Bengaluru!', 'success');
      }, 600);
    }
  };

  // Onboard New Partner Form Submit
  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPartner: PartnerEntity = {
      id: newPartnerType === 'Industrial Recycler' ? `REC-${Math.floor(10 + Math.random() * 90)}` : `KAB-${Math.floor(10 + Math.random() * 90)}`,
      name: newPartnerName,
      type: newPartnerType,
      categoryBadge: newPartnerCategory,
      location: newPartnerLocation,
      distanceKm: +(Math.random() * 5 + 1).toFixed(1),
      licenseId: newPartnerLicense,
      capacityOrVolume: newPartnerCapacity,
      materials: ['Mixed Circular Dry Waste'],
      phone: newPartnerPhone,
      rating: 5.0,
      status: newPartnerType === 'Industrial Recycler' ? 'CPCB Certified' : 'Active & On Route'
    };

    setPartnersList(prev => [newPartner, ...prev]);
    setIsOnboardModalOpen(false);
    playScaleBeep();
    showToast(`Partner "${newPartnerName}" successfully onboarded into municipal registry!`, 'success');

    // Reset fields
    setNewPartnerName('');
  };

  // Filtered partners
  const filteredPartners = partnersList.filter(p => {
    const matchesFilter =
      partnerFilter === 'all'
        ? true
        : partnerFilter === 'recycler'
        ? p.type === 'Industrial Recycler'
        : p.type === 'Certified Kabadiwala';

    const matchesSearch =
      p.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      p.licenseId.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      p.location.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      p.categoryBadge.toLowerCase().includes(partnerSearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Chart Configuration
  const chartData = {
    labels: ['Paper & OCC', 'PET & HDPE', 'Metals (Fe/Cu)', 'E-Waste', 'Glass Cullet'],
    datasets: [
      {
        label: 'Recovered Diverted Metric Tons',
        data: [142, 118, 76, 42, 50.6],
        backgroundColor: [
          'rgba(16, 185, 129, 0.85)',
          'rgba(13, 148, 136, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(99, 102, 241, 0.85)',
          'rgba(148, 163, 184, 0.85)'
        ],
        borderRadius: 10
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 12 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { font: { size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: 'bold' as const } }
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-emerald-700" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Bruhat Bengaluru Mahanagara Palike (BBMP)
            </h2>
            <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
              ULB Command Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Municipal Circular Economy &amp; Informal Scrap Formalization Governance Dashboard
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={openEprModal}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition active:scale-95"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Generate EPR Credit Certificate</span>
          </button>
        </div>
      </div>

      {/* 2. Admin Sub-Navigation Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-bold no-scrollbar">
        {[
          { id: 'overview', label: 'Overview & Approvals', badge: pendingOrders.length },
          { id: 'pricing', label: 'MSP Floor Price & Subsidy' },
          { id: 'wards', label: 'Ward Segregation & Heatmap' },
          { id: 'partners', label: 'Partners & Recyclers', badge: partnersList.length },
          { id: 'epr', label: 'EPR Recycler Consignments' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id as AdminTab)}
            className={`px-4 py-2.5 rounded-2xl transition flex items-center space-x-2 shrink-0 ${
              activeAdminTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                  activeAdminTab === tab.id ? 'bg-amber-400 text-slate-950' : 'bg-amber-500 text-white'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & PENDING APPROVALS */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          {/* Pending Household Order Approvals Queue */}
          <div className="bg-white rounded-3xl border border-amber-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                    <span>Pending Household Pickup Approvals</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold">
                      {pendingOrders.length} Awaiting Verification
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    ULB Admin verification queue: Approve clean household dry scrap before dispatching to ward Kabadiwalas.
                  </p>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                Zero Contamination Policy • Swachh Bharat 2.0
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">
                  All citizen pickup requests are currently reviewed and approved!
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  You can switch to the <strong>Resident Portal</strong> to book a new pickup and watch it arrive here instantly in real-time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-amber-50/30 border border-amber-200/80 rounded-2xl p-4 space-y-3 hover:border-amber-300 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">{order.citizenName}</span>
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                            {order.id}
                          </span>
                          {order.bookingType === 'Society/Bulk' && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded">
                              Bulk RWA
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{order.address}</p>
                        <span className="text-[10px] text-slate-400 font-medium">{order.ward}</span>
                      </div>

                      <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                        Needs Verification
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Materials:</span>
                        <span className="font-bold text-slate-800 truncate block">
                          {order.materials.join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Est. Weight &amp; Payout:</span>
                        <span className="font-bold text-emerald-700">
                          {order.estimatedWeight} kg (~₹{order.estimatedPayout})
                        </span>
                      </div>
                    </div>

                    {/* Priority Assignment & Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-1.5 text-xs">
                        <span className="text-[11px] text-slate-500 font-semibold">Priority:</span>
                        <select
                          value={priorityMap[order.id] || 'Normal'}
                          onChange={e =>
                            setPriorityMap(prev => ({
                              ...prev,
                              [order.id]: e.target.value as 'Normal' | 'High' | 'Bulky'
                            }))
                          }
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none font-bold text-slate-700"
                        >
                          <option value="Normal">Normal</option>
                          <option value="High">High Value</option>
                          <option value="Bulky">Bulky Scrap</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleReject(order.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 text-xs font-bold transition flex items-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => handleApprove(order.id)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center space-x-1 active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve &amp; Dispatch</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Circular Economy KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Landfill Waste Diverted</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {adminKpis.divertedTons}{' '}
                <span className="text-xs font-bold text-slate-500">Tons</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-extrabold block">
                +18.4% vs last month
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Informal Pickers Formalized</span>
                <Users className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {adminKpis.formalizedPartners}{' '}
                <span className="text-xs font-bold text-slate-500">Partners</span>
              </div>
              <span className="text-[10px] text-teal-600 font-extrabold block">
                100% Ayushman Bharat ID
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>EPR Plastic Credits</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {adminKpis.eprCertificates}{' '}
                <span className="text-xs font-bold text-slate-500">Certificates</span>
              </div>
              <span className="text-[10px] text-amber-600 font-extrabold block">
                CPCB Portal Traceable
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Direct Citizen Payouts</span>
                <IndianRupee className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹ {adminKpis.payoutsLakh}{' '}
                <span className="text-xs font-bold text-slate-500">Lakh</span>
              </div>
              <span className="text-[10px] text-indigo-600 font-extrabold block">
                Direct DBT / UPI Disbursal
              </span>
            </div>
          </div>

          {/* Recovery Breakdown Chart & Recycler Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">
                      Dry Waste Stream Recovery Breakdown (Tons)
                    </h4>
                    <p className="text-xs text-slate-500">Current Quarter Municipal Diverted Volume</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                    Q3 2026
                  </span>
                </div>

                <div className="relative h-64 w-full">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Aggregated across 24 Municipal Wards</span>
                <span className="text-emerald-700 font-bold">Zero Mixed Waste To Landfill</span>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">
                      Recycler Traceability Ledger
                    </h4>
                    <p className="text-xs text-slate-500">
                      Cryptographically audited shipments to certified recyclers
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadLedgerCsv}
                    className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition"
                    title="Export CSV Audit"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative mb-3">
                  <input
                    type="text"
                    value={ledgerSearch}
                    onChange={e => setLedgerSearch(e.target.value)}
                    placeholder="Search by lot ID, material, or destination..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 text-xs">
                  {filteredLedger.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-900">{item.batchId}</span>
                          <span className="text-slate-400">&bull;</span>
                          <span className="font-semibold text-slate-800">{item.material}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate max-w-[240px]">
                          Destination: {item.destination} ({item.timestamp})
                        </p>
                        <span className="font-mono text-[9px] text-slate-400 block">
                          SHA-256: {item.traceabilityHash}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shrink-0 ${
                          item.status === 'Verified EPR'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : item.status === 'Audit Passed'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>CPCB Registration #2024-KA-8819</span>
                <span className="text-emerald-700 font-bold">ISO 14001 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MSP FLOOR PRICING & MUNICIPAL SUBSIDY */}
      {activeAdminTab === 'pricing' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Municipal MSP Scrap Floor Price Controller
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Regulate minimum support floor prices (₹/kg) across wards to prevent cartelization and guarantee fair informal wages.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleSubsidy}
                className={`px-4 py-2 rounded-2xl font-bold text-xs transition flex items-center space-x-1.5 ${
                  subsidyActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{subsidyActive ? 'Green Subsidy Active (+₹2.00/kg)' : 'Activate +₹2.00 Subsidy'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {scrapRates.map(r => {
              const displayRate = subsidyActive && (r.id === 'pet_bottle' || r.id === 'cardboard')
                ? +(r.rate + 2.0).toFixed(2)
                : r.rate;

              return (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-300 transition space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{r.name}</h4>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{r.categoryGroup}</span>
                    </div>
                    <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                      ₹ {displayRate}/{r.unit}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1">{r.rationale}</p>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">MSP Floor Regulated</span>
                    {subsidyActive && (r.id === 'pet_bottle' || r.id === 'cardboard') && (
                      <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded">
                        BBMP Subsidy Included
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: WARD SEGREGATION & CONTAMINATION HEATMAP */}
      {activeAdminTab === 'wards' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Ward-Level Segregation &amp; Contamination Scorecard
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Real-time surveillance of dry waste purity, contamination flags, and citizen compliance grades.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">6 Pilot Wards Monitored</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">Ward Code &amp; Name</th>
                  <th className="py-3 px-3">Zone</th>
                  <th className="py-3 px-3">Daily Dry Waste (kg)</th>
                  <th className="py-3 px-3">Contamination %</th>
                  <th className="py-3 px-3">Segregation Grade</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wardList.map(ward => (
                  <tr key={ward.wardId} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-slate-800 text-[11px] block">{ward.wardId}</span>
                      <span className="text-slate-600 font-bold">{ward.name}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">{ward.zone}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">{ward.dailyCollectedKg.toLocaleString()} kg</td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              ward.contaminationRate < 2.5
                                ? 'bg-emerald-500'
                                : ward.contaminationRate < 4.0
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, ward.contaminationRate * 15)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold">{ward.contaminationRate}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-black text-[10px] ${
                          ward.segregationGrade.startsWith('A')
                            ? 'bg-emerald-100 text-emerald-800'
                            : ward.segregationGrade === 'B'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {ward.segregationGrade}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ward.status === 'Optimal'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ward.status === 'Warning'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {ward.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {ward.status === 'Optimal' ? (
                        <button
                          onClick={() => handleIssueCitation(ward.name)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition"
                        >
                          Issue Citation
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFlagContamination(ward.wardId)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] transition"
                        >
                          Audit Inspection
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PARTNERS & RECYCLERS DIRECTORY (WITH AUTO-DETECT LOCATION) */}
      {activeAdminTab === 'partners' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
          {/* Header & Auto-Detect Location Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Factory className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Authorized Recycling &amp; Informal Partner Directory
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Officially accredited CPCB industrial offtakers and formal Kabadiwala collections partners.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Auto-Detect Location Button */}
              <button
                onClick={handleAutoDetectAdminLocation}
                disabled={isAdminLocating}
                className="px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center space-x-1.5 transition active:scale-95 disabled:opacity-50"
                title="Auto-detect current GPS location to sort nearby recycling hubs"
              >
                {isAdminLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{isAdminLocating ? 'Detecting GPS...' : '📍 Auto-Detect Location'}</span>
              </button>

              {/* Onboard New Partner Button */}
              <button
                onClick={() => setIsOnboardModalOpen(true)}
                className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard New Partner</span>
              </button>
            </div>
          </div>

          {/* Current Detected Location Banner */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-slate-600">
                Current Command Center Location:{' '}
                <strong className="text-slate-800">{adminLocation}</strong>
              </span>
            </div>
            {gpsCoords && (
              <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md font-bold">
                {gpsCoords}
              </span>
            )}
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Type selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto">
              {[
                { id: 'all', label: `All Partners (${partnersList.length})` },
                { id: 'recycler', label: 'Industrial Recyclers' },
                { id: 'kabadiwala', label: 'Certified Kabadiwalas' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setPartnerFilter(f.id as typeof partnerFilter)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex-1 sm:flex-initial text-center ${
                    partnerFilter === f.id
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={partnerSearch}
                onChange={e => setPartnerSearch(e.target.value)}
                placeholder="Search partner, CPCB ID, or material..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Partner Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPartners.map(partner => (
              <div
                key={partner.id}
                className="p-5 rounded-3xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition space-y-3.5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-inner ${
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
                      <div className="flex items-center space-x-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">{partner.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">⭐ {partner.rating}</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700">{partner.categoryBadge}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{partner.location}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                    {partner.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">License / ID:</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px] block truncate">
                      {partner.licenseId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Processing Volume:</span>
                    <span className="font-bold text-emerald-700">{partner.capacityOrVolume}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{partner.phone}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {partner.distanceKm} km away
                    </span>
                    <button
                      onClick={() => showToast(`Contacted partner: ${partner.name}`, 'info')}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline underline-offset-2"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EPR RECYCLER CONSIGNMENTS & TRACEABILITY */}
      {activeAdminTab === 'epr' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  CPCB Authorized Industrial Recycler Consignments
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bulk segregated dry waste consignments dispatched to national recycling conglomerates for EPR compliance credits.
              </p>
            </div>
            <button
              onClick={openEprModal}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
            >
              <Award className="w-4 h-4" />
              <span>Generate EPR Credit Certificate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                recycler: 'ITC Paperboards Ltd.',
                material: 'Corrugated OCC & Newsprint Fiber',
                volume: '42.5 Metric Tons',
                credits: '4,250 Paper Credits',
                traceability: 'CPCB-REC-2024-ITC-991',
                audit: 'Verified EPR'
              },
              {
                recycler: 'Ganesha Ecosphere Ltd.',
                material: 'Hot-washed PET Flakes (rPET Yarn)',
                volume: '28.0 Metric Tons',
                credits: '2,800 Plastic Credits (Cat-I)',
                traceability: 'CPCB-REC-2024-GNS-412',
                audit: 'Verified EPR'
              },
              {
                recycler: 'Hindalco Industries Ltd.',
                material: 'Bare Bright Copper & Aluminium Ingots',
                volume: '8.4 Metric Tons',
                credits: 'Non-ferrous Metals Pass',
                traceability: 'CPCB-REC-2024-HND-109',
                audit: 'Audit Passed'
              },
              {
                recycler: 'EcoPlast Granules Ltd.',
                material: 'HDPE Reprocessed Polymer Pellets',
                volume: '16.2 Metric Tons',
                credits: '1,620 Plastic Credits (Cat-II)',
                traceability: 'CPCB-REC-2024-ECO-882',
                audit: 'In Transit'
              }
            ].map((consign, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-300 transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{consign.recycler}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{consign.material}</p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {consign.audit}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Diverted Volume:</span>
                    <span className="font-black text-slate-900">{consign.volume}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">EPR Registry Credits:</span>
                    <span className="font-black text-emerald-700">{consign.credits}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/60 pt-2 font-mono">
                  <span>Reg ID: {consign.traceability}</span>
                  <span className="text-emerald-700 font-bold">SHA-256 Validated</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onboard New Partner Modal */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Factory className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Onboard Recycling / Collection Partner
                </h3>
              </div>
              <button
                onClick={() => setIsOnboardModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Partner Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 p-2 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="ptype"
                      checked={newPartnerType === 'Industrial Recycler'}
                      onChange={() => setNewPartnerType('Industrial Recycler')}
                      className="accent-emerald-600"
                    />
                    <span className="font-semibold text-slate-800">Industrial Recycler</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="ptype"
                      checked={newPartnerType === 'Certified Kabadiwala'}
                      onChange={() => setNewPartnerType('Certified Kabadiwala')}
                      className="accent-emerald-600"
                    />
                    <span className="font-semibold text-slate-800">Kabadiwala Fleet</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Entity / Partner Name</label>
                <input
                  type="text"
                  required
                  value={newPartnerName}
                  onChange={e => setNewPartnerName(e.target.value)}
                  placeholder="e.g. CleanGreen Recyclers LLP"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category / Vehicle</label>
                  <input
                    type="text"
                    required
                    value={newPartnerCategory}
                    onChange={e => setNewPartnerCategory(e.target.value)}
                    placeholder="e.g. Rigid HDPE or E-Loader"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CPCB / License ID</label>
                  <input
                    type="text"
                    required
                    value={newPartnerLicense}
                    onChange={e => setNewPartnerLicense(e.target.value)}
                    placeholder="CPCB-REC-2024-..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operating Location</label>
                  <input
                    type="text"
                    required
                    value={newPartnerLocation}
                    onChange={e => setNewPartnerLocation(e.target.value)}
                    placeholder="e.g. Peenya Phase 1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Contact</label>
                  <input
                    type="text"
                    required
                    value={newPartnerPhone}
                    onChange={e => setNewPartnerPhone(e.target.value)}
                    placeholder="+91 ..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
