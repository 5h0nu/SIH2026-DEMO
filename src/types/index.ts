export type Role = 'citizen' | 'collector' | 'admin';
export type Language = 'en' | 'hi';

export interface ScrapCategory {
  id: string;
  name: string;
  hiName: string;
  rate: number;
  unit: string;
  icon: string;
  minKg: number;
  defaultKg: number;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
  rationale?: string;
  categoryGroup: 'paper' | 'plastic' | 'metal' | 'ewaste' | 'glass';
  isSubsidized?: boolean;
}

export type OrderStatus = 
  | 'pending_admin_approval' // Citizen requested, awaiting ULB Admin approval
  | 'collector_assigned'      // Admin approved & assigned to Kabadiwala
  | 'on_the_way'              // Kabadiwala accepted and is navigating to doorstep
  | 'weighed_and_paid'        // Scale weighed, UPI paid, completed
  | 'rejected';               // Rejected by admin (e.g. wet waste / contaminated)

export interface PickupOrder {
  id: string;
  citizenName: string;
  citizenPhone: string;
  address: string;
  pincode: string;
  ward: string;
  distance: string;
  materials: string[];
  estimatedWeight: number;
  estimatedPayout: number;
  actualWeight?: number;
  actualPayout?: number;
  timeSlot: string;
  upiId: string;
  photoUrl?: string;
  status: OrderStatus;
  createdAt: string;
  adminApprovalTimestamp?: string;
  completedTimestamp?: string;
  assignedCollector?: string;
  scaleHash?: string;
  upiRefId?: string;
  adminPriority?: 'Normal' | 'High' | 'Bulky';
  adminNotes?: string;
  bookingType?: 'Household' | 'Society/Bulk';
}

export interface AiInferenceResult {
  category: string;
  specificGrade: string;
  confidence: number;
  contamination: string;
  contaminationRisk: 'Low' | 'Medium' | 'High';
  estimatedRate: number;
  code: string;
  calcCategory: string;
  advice: string;
  source: 'groq' | 'edge-simulation';
}

export interface AdminLedgerItem {
  id: string;
  batchId: string;
  material: string;
  weight: string;
  destination: string;
  timestamp: string;
  status: 'In Transit' | 'Verified EPR' | 'Audit Passed';
  traceabilityHash: string;
}

export interface EprCertificate {
  certNumber: string;
  recycler: string;
  ward: string;
  material: string;
  volumeKg: number;
  co2Tons: number;
  issuedDate: string;
  hash: string;
  status: 'REDEEMABLE' | 'VERIFIED';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    target: 'calculator' | 'booking' | 'scanner' | 'rates';
  };
}

export interface RewardItem {
  id: string;
  title: string;
  hiTitle: string;
  pointsCost: number;
  category: 'tax_rebate' | 'transit' | 'compost' | 'eco_kit';
  description: string;
  partner: string;
  icon: string;
  isRedeemed?: boolean;
  couponCode?: string;
}

export interface RouteStop {
  id: string;
  orderId: string;
  name: string;
  address: string;
  weight: number;
  distanceKm: number;
  status: 'pending' | 'en_route' | 'completed';
  sequence: number;
  coordinates: { x: number; y: number };
}

export interface WardMetric {
  wardId: string;
  name: string;
  zone: string;
  dailyCollectedKg: number;
  contaminationRate: number;
  segregationGrade: 'A+' | 'A' | 'B' | 'C';
  activePartners: number;
  status: 'Optimal' | 'Warning' | 'Flagged';
}

export interface FleetPartner {
  id: string;
  name: string;
  vehicle: string;
  ward: string;
  ayushmanId: string;
  todayKg: number;
  status: 'On Route' | 'At Sorting Hub' | 'Available';
  rating: number;
  payoutsToday: number;
}

export interface PartnerEntity {
  id: string;
  name: string;
  type: 'Industrial Recycler' | 'Certified Kabadiwala';
  categoryBadge: string;
  location: string;
  distanceKm: number;
  licenseId: string;
  capacityOrVolume: string;
  materials: string[];
  phone: string;
  rating: number;
  status: 'CPCB Certified' | 'Active & On Route' | 'Verified Partner';
}
