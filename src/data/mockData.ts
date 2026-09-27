import type {
  ScrapCategory,
  PickupOrder,
  AdminLedgerItem,
  RewardItem,
  RouteStop,
  WardMetric,
  FleetPartner,
  PartnerEntity
} from '../types';

export const initialScrapRates: ScrapCategory[] = [
  {
    id: 'newspaper',
    name: 'Newspaper (Raddi)',
    hiName: 'अख़बार / रद्दी',
    rate: 14.5,
    unit: 'kg',
    icon: 'newspaper',
    minKg: 0,
    defaultKg: 10,
    trend: 'stable',
    changePercent: 0,
    rationale: 'Domestic paper mill demand steady',
    categoryGroup: 'paper'
  },
  {
    id: 'cardboard',
    name: 'Corrugated Cardboard (Gatta)',
    hiName: 'कार्टन / गत्ता',
    rate: 13.0,
    unit: 'kg',
    icon: 'package',
    minKg: 0,
    defaultKg: 8,
    trend: 'up',
    changePercent: 4.2,
    rationale: 'E-commerce packaging demand surge',
    categoryGroup: 'paper'
  },
  {
    id: 'pet_bottle',
    name: 'PET Bottles (Water & Soda)',
    hiName: 'PET प्लास्टिक की बोतलें',
    rate: 18.0,
    unit: 'kg',
    icon: 'flask-conical',
    minKg: 0,
    defaultKg: 5,
    trend: 'up',
    changePercent: 6.5,
    rationale: 'Polyester yarn manufacturers driving raw flake prices',
    categoryGroup: 'plastic'
  },
  {
    id: 'hdpe_plastic',
    name: 'HDPE Rigid Plastic (Milk/Oil Cans)',
    hiName: 'कठोर प्लास्टिक (HDPE)',
    rate: 22.0,
    unit: 'kg',
    icon: 'container',
    minKg: 0,
    defaultKg: 3,
    trend: 'stable',
    changePercent: 1.1,
    rationale: 'Industrial reprocessing benchmark firm',
    categoryGroup: 'plastic'
  },
  {
    id: 'iron',
    name: 'Iron & Mild Steel (Loha)',
    hiName: 'लोहा एवं इस्पात (Iron)',
    rate: 32.0,
    unit: 'kg',
    icon: 'hammer',
    minKg: 0,
    defaultKg: 6,
    trend: 'down',
    changePercent: -2.3,
    rationale: 'Secondary re-rolling mills inventory surplus',
    categoryGroup: 'metal'
  },
  {
    id: 'copper',
    name: 'Bare Copper Wire / Utensils',
    hiName: 'शुद्ध तांबा (Copper)',
    rate: 440.0,
    unit: 'kg',
    icon: 'zap',
    minKg: 0,
    defaultKg: 1,
    trend: 'up',
    changePercent: 8.1,
    rationale: 'LME global spot copper rally',
    categoryGroup: 'metal'
  },
  {
    id: 'brass',
    name: 'Brass / Peetal Scrap',
    hiName: 'पीतल (Brass)',
    rate: 320.0,
    unit: 'kg',
    icon: 'sparkles',
    minKg: 0,
    defaultKg: 0,
    trend: 'stable',
    changePercent: 0.5,
    rationale: 'Handicraft export units stable intake',
    categoryGroup: 'metal'
  },
  {
    id: 'aluminium',
    name: 'Aluminium Utensils & Cans',
    hiName: 'एल्युमिनियम (Aluminium)',
    rate: 115.0,
    unit: 'kg',
    icon: 'shield',
    minKg: 0,
    defaultKg: 2,
    trend: 'up',
    changePercent: 3.4,
    rationale: 'Automotive die-casting recycling demand',
    categoryGroup: 'metal'
  },
  {
    id: 'ewaste',
    name: 'E-Waste (PCBs, Mobiles, Gadgets)',
    hiName: 'ई-कचरा (E-Waste Circuit Boards)',
    rate: 48.0,
    unit: 'kg',
    icon: 'cpu',
    minKg: 0,
    defaultKg: 2,
    trend: 'up',
    changePercent: 5.0,
    rationale: 'CPCB authorized precious metal recovery pull',
    categoryGroup: 'ewaste'
  },
  {
    id: 'beer_bottle',
    name: 'Glass Cullet & Soda Bottles',
    hiName: 'कांच की बोतलें / शीशा',
    rate: 3.5,
    unit: 'piece',
    icon: 'wine',
    minKg: 0,
    defaultKg: 10,
    trend: 'stable',
    changePercent: 0,
    rationale: 'Breweries returnable crate collection standard',
    categoryGroup: 'glass'
  }
];

export const initialPickupOrders: PickupOrder[] = [
  {
    id: 'RS-9042',
    citizenName: 'Devika Krishnan',
    citizenPhone: '+91 98201 44819',
    address: 'Flat 6B, Salarpuria Green Crest, Bellandur, Bengaluru',
    pincode: '560103',
    ward: 'Ward 150 (Bellandur)',
    distance: '0.6 km away',
    materials: ['Cardboard', 'PET Bottles', 'E-Waste'],
    estimatedWeight: 18.5,
    estimatedPayout: 320.0,
    timeSlot: 'Today: 2:00 PM - 4:00 PM',
    upiId: 'devika.krish@oksbi',
    status: 'pending_admin_approval',
    createdAt: '15 mins ago',
    adminPriority: 'Normal',
    adminNotes: 'Resident segregation verified via photo upload',
    bookingType: 'Household'
  },
  {
    id: 'RS-8921',
    citizenName: 'Pooja Sharma (You)',
    citizenPhone: '+91 98450 11921',
    address: 'Villa 12, Palm Meadows, Indiranagar, Bengaluru',
    pincode: '560038',
    ward: 'Ward 4B (Koramangala/Indiranagar)',
    distance: '0.8 km away',
    materials: ['Cardboard', 'Plastics & Bottles'],
    estimatedWeight: 16.5,
    estimatedPayout: 245.0,
    timeSlot: 'Today: 1:30 PM - 3:30 PM',
    upiId: 'pooja.sharma@okhdfcbank',
    status: 'on_the_way',
    createdAt: '45 mins ago',
    adminApprovalTimestamp: '30 mins ago',
    assignedCollector: 'Ramesh Kumar (Ward 4B Partner)',
    bookingType: 'Household'
  },
  {
    id: 'RS-8924',
    citizenName: 'Sunil Verma',
    citizenPhone: '+91 99010 44219',
    address: 'B-304, Brigade Gateway, Malleshwaram, Bengaluru',
    pincode: '560055',
    ward: 'Ward 4B (Koramangala/Central)',
    distance: '1.4 km away',
    materials: ['Iron Scrap', 'Old Newspapers'],
    estimatedWeight: 28.0,
    estimatedPayout: 512.0,
    timeSlot: 'Today: 3:15 PM - 5:00 PM',
    upiId: 'sunilverma@paytm',
    status: 'collector_assigned',
    createdAt: '1 hour ago',
    adminApprovalTimestamp: '40 mins ago',
    assignedCollector: 'Ramesh Kumar (Ward 4B Partner)',
    bookingType: 'Household'
  },
  {
    id: 'RS-8927',
    citizenName: 'Anita Hegde',
    citizenPhone: '+91 97412 88710',
    address: 'House #44, 4th Cross, 12th Main, Indiranagar',
    pincode: '560038',
    ward: 'Ward 4B (Koramangala/Indiranagar)',
    distance: '2.1 km away',
    materials: ['E-Waste Circuit Boards', 'Bare Copper Wires'],
    estimatedWeight: 7.2,
    estimatedPayout: 940.0,
    timeSlot: 'Today: 4:00 PM - 6:00 PM',
    upiId: 'anita.hegde@icici',
    status: 'collector_assigned',
    createdAt: '2 hours ago',
    adminApprovalTimestamp: '1 hour ago',
    assignedCollector: 'Ramesh Kumar (Ward 4B Partner)',
    bookingType: 'Household'
  },
  {
    id: 'RS-8890',
    citizenName: 'Rahul Mehra',
    citizenPhone: '+91 98860 12345',
    address: '102, Sunrise Apartments, HSR Sector 2',
    pincode: '560102',
    ward: 'Ward 174 (HSR Layout)',
    distance: '3.2 km away',
    materials: ['Newspaper', 'Cardboard', 'Plastics'],
    estimatedWeight: 22.0,
    estimatedPayout: 310.0,
    actualWeight: 23.4,
    actualPayout: 334.8,
    timeSlot: 'Yesterday',
    upiId: 'rmehra@axisbank',
    status: 'weighed_and_paid',
    createdAt: '1 day ago',
    adminApprovalTimestamp: '1 day ago',
    completedTimestamp: 'Yesterday 4:30 PM',
    assignedCollector: 'Ramesh Kumar (Ward 4B Partner)',
    scaleHash: '0x9fa482d8c3b10291e0fae248b991c01e',
    upiRefId: 'UPI-4091829031',
    bookingType: 'Household'
  }
];

export const initialAdminLedger: AdminLedgerItem[] = [
  {
    id: 'AUD-901',
    batchId: 'LOT-9821',
    material: 'Baled Corrugated OCC (4.2 Tons)',
    weight: '4,200 kg',
    destination: 'ITC Paperboards & Specialty Papers Ltd.',
    timestamp: '18 mins ago',
    status: 'In Transit',
    traceabilityHash: '0x7b889a02ce18df2410a5'
  },
  {
    id: 'AUD-902',
    batchId: 'LOT-9820',
    material: 'Crushed PET Flakes Grade-A (1.8 Tons)',
    weight: '1,800 kg',
    destination: 'Ganesha Ecosphere Recycled Yarn Facility',
    timestamp: '1 hour ago',
    status: 'Verified EPR',
    traceabilityHash: '0x4f1288bba90123efd901'
  },
  {
    id: 'AUD-903',
    batchId: 'LOT-9819',
    material: 'Stripped Bare Copper Cables (450 kg)',
    weight: '450 kg',
    destination: 'Hindalco Copper Smelter Yard',
    timestamp: '3 hours ago',
    status: 'Audit Passed',
    traceabilityHash: '0x992810aafe774b9213ef'
  },
  {
    id: 'AUD-904',
    batchId: 'LOT-9818',
    material: 'HDPE Flakes Reprocessed (2.1 Tons)',
    weight: '2,100 kg',
    destination: 'EcoPlast Polymer Granulation Ltd.',
    timestamp: '5 hours ago',
    status: 'Verified EPR',
    traceabilityHash: '0x12a884efbc8901210abb'
  }
];

export const initialRewards: RewardItem[] = [
  {
    id: 'rew-1',
    title: '5% Rebate on Municipal Property Tax',
    hiTitle: 'नगर निगम संपत्ति कर में 5% छूट',
    pointsCost: 350,
    category: 'tax_rebate',
    description: 'Direct deduction voucher valid on BBMP/MCD SAS Property Tax Portal for 1 fiscal year.',
    partner: 'BBMP Revenue Directorate',
    icon: 'building'
  },
  {
    id: 'rew-2',
    title: 'BMTC / DTC Electric Bus 10-Ride Pass',
    hiTitle: 'इलेक्ट्रिक बस 10 निःशुल्क यात्रा पास',
    pointsCost: 180,
    category: 'transit',
    description: 'Digital QR mobility pass for all non-AC & EV feeder feeder routes in metropolitan zone.',
    partner: 'Metropolitan Transport Corp',
    icon: 'bus'
  },
  {
    id: 'rew-3',
    title: '10 kg Organic Urban Compost Bag',
    hiTitle: '10 किग्रा जैविक नगरीय खाद थैला',
    pointsCost: 120,
    category: 'compost',
    description: 'Enriched organic microbial compost processed at Swachh Bharat decentralized wet-waste centers.',
    partner: 'Swachh Bharat Mission',
    icon: 'sprout'
  },
  {
    id: 'rew-4',
    title: 'Zero-Waste Bamboo & Jute Home Kit',
    hiTitle: 'पर्यावरण-अनुकूल बांस व जूट घरेलू किट',
    pointsCost: 240,
    category: 'eco_kit',
    description: 'Handcrafted kit including 4 bamboo toothbrushes, 2 jute grocery totes, and organic neem scrubbers.',
    partner: 'KVIC / Circular Khadi Cluster',
    icon: 'gift'
  }
];

export const initialRouteStops: RouteStop[] = [
  {
    id: 'STOP-1',
    orderId: 'RS-8921',
    name: 'Pooja Sharma',
    address: 'Villa 12, Palm Meadows, Indiranagar',
    weight: 16.5,
    distanceKm: 0.8,
    status: 'en_route',
    sequence: 1,
    coordinates: { x: 35, y: 42 }
  },
  {
    id: 'STOP-2',
    orderId: 'RS-8924',
    name: 'Sunil Verma',
    address: 'B-304, Brigade Gateway, Malleshwaram',
    weight: 28.0,
    distanceKm: 1.4,
    status: 'pending',
    sequence: 2,
    coordinates: { x: 62, y: 28 }
  },
  {
    id: 'STOP-3',
    orderId: 'RS-8927',
    name: 'Anita Hegde',
    address: 'House #44, 4th Cross, Indiranagar',
    weight: 7.2,
    distanceKm: 2.1,
    status: 'pending',
    sequence: 3,
    coordinates: { x: 78, y: 65 }
  },
  {
    id: 'STOP-4',
    orderId: 'RS-9042',
    name: 'Devika Krishnan',
    address: 'Flat 6B, Salarpuria Green Crest, Bellandur',
    weight: 18.5,
    distanceKm: 3.2,
    status: 'pending',
    sequence: 4,
    coordinates: { x: 22, y: 75 }
  }
];

export const presetAiSpecimens = {
  pet_bottle: {
    category: 'PET Plastic Bottle (#1 PETE)',
    specificGrade: 'Clear Post-Consumer Polyethylene Terephthalate',
    confidence: 96.8,
    contamination: 'Low (< 1.5% dust residue)',
    contaminationRisk: 'Low' as const,
    estimatedRate: 18.0,
    code: '#1-PETE Recyclable Polymer',
    calcCategory: 'pet_bottle',
    advice: 'Remove bottle cap and ring for premium Grade-A bale pricing.',
    source: 'edge-simulation' as const
  },
  cardboard: {
    category: 'Corrugated Kraft Board (OCC)',
    specificGrade: 'Double-wall Old Corrugated Container Grade',
    confidence: 98.2,
    contamination: 'Clean / Zero moisture detected',
    contaminationRisk: 'Low' as const,
    estimatedRate: 13.0,
    code: '#PAP-20 Corrugated Kraft Fiber',
    calcCategory: 'cardboard',
    advice: 'Flatten boxes to maximize transport volume efficiency.',
    source: 'edge-simulation' as const
  },
  copper_wire: {
    category: 'Bare Bright Stripped Copper',
    specificGrade: 'IS-Cu-ETP High Purity Red Metal (>99.9%)',
    confidence: 95.4,
    contamination: 'Non-ferrous Pure / Insulator free',
    contaminationRisk: 'Low' as const,
    estimatedRate: 440.0,
    code: 'IS-Cu-ETP Grade Electrical Wire',
    calcCategory: 'copper',
    advice: 'Certified highest value metal in circular municipal logistics.',
    source: 'edge-simulation' as const
  },
  pcb: {
    category: 'Printed Circuit Board (E-Waste)',
    specificGrade: 'Grade-A Telecomm & Motherboard PCB',
    confidence: 97.1,
    contamination: 'Hazardous capacitors intact / Dry',
    contaminationRisk: 'Medium' as const,
    estimatedRate: 48.0,
    code: 'WEEE Category-3 Telecommunications',
    calcCategory: 'ewaste',
    advice: 'Keep in electrostatic dry pouch. Do not break or burn.',
    source: 'edge-simulation' as const
  },
  aluminium_cans: {
    category: 'Aluminium Beverage Cans (UBC)',
    specificGrade: 'Alloy 3004 Sheet Ingot Recyclable',
    confidence: 96.1,
    contamination: 'Minor sugar residue (< 3%)',
    contaminationRisk: 'Low' as const,
    estimatedRate: 115.0,
    code: '#ALU-41 Recycled Aluminium Can',
    calcCategory: 'aluminium',
    advice: 'Rinse with clean water and crush flat for 95% energy savings vs virgin bauxite.',
    source: 'edge-simulation' as const
  }
};

export const initialWards: WardMetric[] = [

  {
    wardId: 'WARD-04B',
    name: 'Koramangala 4th Block',
    zone: 'Zone East',
    dailyCollectedKg: 4820,
    contaminationRate: 1.4,
    segregationGrade: 'A+' as const,
    activePartners: 18,
    status: 'Optimal' as const
  },
  {
    wardId: 'WARD-150',
    name: 'Bellandur Lake Catchment',
    zone: 'Zone East',
    dailyCollectedKg: 6140,
    contaminationRate: 2.1,
    segregationGrade: 'A' as const,
    activePartners: 24,
    status: 'Optimal' as const
  },
  {
    wardId: 'WARD-174',
    name: 'HSR Layout Sectors 1-7',
    zone: 'Zone South',
    dailyCollectedKg: 3920,
    contaminationRate: 1.8,
    segregationGrade: 'A+' as const,
    activePartners: 15,
    status: 'Optimal' as const
  },
  {
    wardId: 'WARD-080',
    name: 'Indiranagar 100ft Corridor',
    zone: 'Zone East',
    dailyCollectedKg: 3450,
    contaminationRate: 3.8,
    segregationGrade: 'B' as const,
    activePartners: 12,
    status: 'Warning' as const
  },
  {
    wardId: 'WARD-112',
    name: 'Whitefield ITPL Enclave',
    zone: 'Zone East',
    dailyCollectedKg: 7200,
    contaminationRate: 5.2,
    segregationGrade: 'C' as const,
    activePartners: 28,
    status: 'Flagged' as const
  },
  {
    wardId: 'WARD-093',
    name: 'Malleshwaram Heritage Zone',
    zone: 'Zone West',
    dailyCollectedKg: 2980,
    contaminationRate: 1.6,
    segregationGrade: 'A' as const,
    activePartners: 11,
    status: 'Optimal' as const
  }
];

export const initialFleetPartners: FleetPartner[] = [

  {
    id: 'PART-01',
    name: 'Ramesh Kumar',
    vehicle: 'Electric Loader #KA-01-EA-4910',
    ward: 'Ward 4B (Koramangala)',
    ayushmanId: 'PMJAY-88192-KA',
    todayKg: 214.2,
    status: 'On Route' as const,
    rating: 4.9,
    payoutsToday: 4320
  },
  {
    id: 'PART-02',
    name: 'Suresh Paswan',
    vehicle: 'Electric Loader #KA-01-EA-3120',
    ward: 'Ward 150 (Bellandur)',
    ayushmanId: 'PMJAY-77210-KA',
    todayKg: 340.5,
    status: 'At Sorting Hub' as const,
    rating: 4.8,
    payoutsToday: 6800
  },
  {
    id: 'PART-03',
    name: 'Sunita Devi',
    vehicle: 'Electric Loader #KA-05-EA-8891',
    ward: 'Ward 174 (HSR Layout)',
    ayushmanId: 'PMJAY-99412-KA',
    todayKg: 185.0,
    status: 'Available' as const,
    rating: 5.0,
    payoutsToday: 3910
  },
  {
    id: 'PART-04',
    name: 'Mohammed Farooq',
    vehicle: 'Electric Loader #KA-03-EA-6412',
    ward: 'Ward 80 (Indiranagar)',
    ayushmanId: 'PMJAY-66319-KA',
    todayKg: 290.0,
    status: 'On Route' as const,
    rating: 4.7,
    payoutsToday: 5400
  }
];

export const initialPartnerDirectory: PartnerEntity[] = [
  // Industrial Recyclers
  {
    id: 'REC-01',
    name: 'ITC Paperboards & Specialty Papers Ltd.',
    type: 'Industrial Recycler',
    categoryBadge: 'Paper & OCC Pulping',
    location: 'Whitefield Industrial Corridor, Bengaluru',
    distanceKm: 4.2,
    licenseId: 'CPCB-REC-2024-ITC-991',
    capacityOrVolume: '5,000 MT / month',
    materials: ['Corrugated Cardboard (OCC)', 'Newspaper (Raddi)', 'Duplex Board'],
    phone: '+91 80 2841 0021',
    rating: 4.9,
    status: 'CPCB Certified'
  },
  {
    id: 'REC-02',
    name: 'Ganesha Ecosphere Recycled Fiber Ltd.',
    type: 'Industrial Recycler',
    categoryBadge: 'rPET Flakes & Yarn',
    location: 'Peenya Industrial Area Stage 2, Bengaluru',
    distanceKm: 8.5,
    licenseId: 'CPCB-REC-2024-GNS-412',
    capacityOrVolume: '3,200 MT / month',
    materials: ['PET Bottles (#1 PETE)', 'Polyester Waste'],
    phone: '+91 80 2839 4410',
    rating: 4.9,
    status: 'CPCB Certified'
  },
  {
    id: 'REC-03',
    name: 'Hindalco Industries Non-Ferrous Smelting Yard',
    type: 'Industrial Recycler',
    categoryBadge: 'Copper & Aluminium Ingot',
    location: 'Bommasandra Industrial Zone, Bengaluru',
    distanceKm: 11.2,
    licenseId: 'CPCB-REC-2024-HND-109',
    capacityOrVolume: '1,800 MT / month',
    materials: ['Bare Bright Copper Wire', 'Aluminium Scrap', 'Brass/Peetal'],
    phone: '+91 80 2783 1192',
    rating: 4.8,
    status: 'CPCB Certified'
  },
  {
    id: 'REC-04',
    name: 'EcoPlast Polymer Granulation Units Ltd.',
    type: 'Industrial Recycler',
    categoryBadge: 'Rigid HDPE/PP Pellets',
    location: 'Electronic City Phase 1, Bengaluru',
    distanceKm: 6.8,
    licenseId: 'CPCB-REC-2024-ECO-882',
    capacityOrVolume: '2,400 MT / month',
    materials: ['HDPE Plastic Cans', 'PP Rigid Polymers'],
    phone: '+91 80 2852 9901',
    rating: 4.9,
    status: 'CPCB Certified'
  },
  {
    id: 'REC-05',
    name: 'Attero Recycling E-Waste Refiners Ltd.',
    type: 'Industrial Recycler',
    categoryBadge: 'Precious Metals Recovery',
    location: 'Harohalli Eco-Tech Park, Bengaluru',
    distanceKm: 14.0,
    licenseId: 'CPCB-WEEE-2024-ATT-501',
    capacityOrVolume: '1,200 MT / month',
    materials: ['PCBs & Motherboards', 'Lithium-Ion Batteries', 'Telecom Gadgets'],
    phone: '+91 80 2977 3340',
    rating: 5.0,
    status: 'CPCB Certified'
  },

  // Certified Kabadiwala Partners
  {
    id: 'KAB-01',
    name: 'Ramesh Kumar (Ward Lead)',
    type: 'Certified Kabadiwala',
    categoryBadge: 'EV Loader #KA-01-EA-4910',
    location: 'Ward 4B: Koramangala 4th Block',
    distanceKm: 0.8,
    licenseId: 'PMJAY-88192-KA',
    capacityOrVolume: '214.2 kg hauled today',
    materials: ['Cardboard', 'Plastics', 'Iron Scrap'],
    phone: '+91 98450 11921',
    rating: 4.9,
    status: 'Active & On Route'
  },
  {
    id: 'KAB-02',
    name: 'Suresh Paswan',
    type: 'Certified Kabadiwala',
    categoryBadge: 'EV Loader #KA-01-EA-3120',
    location: 'Ward 150: Bellandur Hub',
    distanceKm: 1.6,
    licenseId: 'PMJAY-77210-KA',
    capacityOrVolume: '340.5 kg hauled today',
    materials: ['PET Bottles', 'E-Waste', 'Metals'],
    phone: '+91 99010 44219',
    rating: 4.8,
    status: 'Verified Partner'
  },
  {
    id: 'KAB-03',
    name: 'Sunita Devi',
    type: 'Certified Kabadiwala',
    categoryBadge: 'EV Loader #KA-05-EA-8891',
    location: 'Ward 174: HSR Layout Sector 2',
    distanceKm: 2.4,
    licenseId: 'PMJAY-99412-KA',
    capacityOrVolume: '185.0 kg hauled today',
    materials: ['Paper & Books', 'Copper Cables'],
    phone: '+91 97412 88710',
    rating: 5.0,
    status: 'Active & On Route'
  },
  {
    id: 'KAB-04',
    name: 'Mohammed Farooq',
    type: 'Certified Kabadiwala',
    categoryBadge: 'EV Loader #KA-03-EA-6412',
    location: 'Ward 80: Indiranagar 100ft Rd',
    distanceKm: 1.1,
    licenseId: 'PMJAY-66319-KA',
    capacityOrVolume: '290.0 kg hauled today',
    materials: ['Metals', 'Cardboard Bales'],
    phone: '+91 98860 77215',
    rating: 4.7,
    status: 'Active & On Route'
  }
];

