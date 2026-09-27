import type { ScrapCategory, AiInferenceResult } from '../types';
import { initialScrapRates, presetAiSpecimens } from '../data/mockData';

const GROQ_STORAGE_KEY = 'recyclesetu_groq_api_key';

export function getStoredGroqApiKey(): string {
  try {
    return localStorage.getItem(GROQ_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredGroqApiKey(key: string): void {
  try {
    localStorage.setItem(GROQ_STORAGE_KEY, key.trim());
  } catch (e) {
    console.error('Failed to save Groq API key:', e);
  }
}

export interface GroqPriceResponse {
  mandi: string;
  timestamp: string;
  marketSummary: string;
  source: 'groq' | 'simulation';
  updatedRates: ScrapCategory[];
}

/**
 * Auto-fetch daily scrap mandi prices using Groq LLM (llama-3.3-70b-versatile or llama-3.1-8b-instant)
 * with robust fallback simulation if no API key is provided or if network fails.
 */
export async function fetchDailyScrapPricesFromGroq(
  customKey?: string,
  region: string = 'Bengaluru & Delhi NCR Hub'
): Promise<GroqPriceResponse> {
  const apiKey = (customKey || getStoredGroqApiKey()).trim();

  if (apiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `You are the National Scrap Mandi & Circular Dry Waste Pricing Index API for India.
You provide realistic, verified wholesale and doorstep scrap prices in INR (₹) per kg (or per piece) for major Indian recycling clusters.
Respond ONLY with a valid JSON object matching this schema:
{
  "mandi": "${region}",
  "timestamp": "Today",
  "marketSummary": "1-2 concise sentences on today's Indian scrap market demand trends and paper/metal/polymer indices.",
  "rates": [
    { "id": "newspaper", "rate": 15.0, "trend": "up", "changePercent": 3.4, "rationale": "High domestic kraft pulp demand" },
    { "id": "cardboard", "rate": 13.5, "trend": "up", "changePercent": 3.8, "rationale": "E-commerce packing consumption" },
    { "id": "pet_bottle", "rate": 18.5, "trend": "up", "changePercent": 2.8, "rationale": "Recycled polyester textile yarn pull" },
    { "id": "hdpe_plastic", "rate": 22.5, "trend": "stable", "changePercent": 0.5, "rationale": "Reprocessing blow-moulding standard" },
    { "id": "iron", "rate": 31.5, "trend": "down", "changePercent": -1.5, "rationale": "Secondary steel re-bar re-rollers ample scrap" },
    { "id": "copper", "rate": 445.0, "trend": "up", "changePercent": 4.1, "rationale": "Global LME cathode spot price rally" },
    { "id": "brass", "rate": 325.0, "trend": "stable", "changePercent": 0.8, "rationale": "Handicraft cluster steady demand" },
    { "id": "aluminium", "rate": 118.0, "trend": "up", "changePercent": 2.6, "rationale": "Foundry automotive cast intake" },
    { "id": "ewaste", "rate": 50.0, "trend": "up", "changePercent": 4.2, "rationale": "Authorized e-waste refiner quotas" },
    { "id": "beer_bottle", "rate": 3.5, "trend": "stable", "changePercent": 0.0, "rationale": "Standard bottle return logistics" }
  ]
}`
            },
            {
              role: 'user',
              content: `Fetch current live scrap rate cards for ${region}. Include price changes and market trend analysis.`
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Groq API responded with status ${response.status}: ${errorText}`);
        throw new Error(`Groq HTTP error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.rates && Array.isArray(parsed.rates)) {
          // Merge with initial categories to preserve icons, translations, and units
          const updatedRates = initialScrapRates.map(baseItem => {
            const fetched = parsed.rates.find((r: { id: string }) => r.id === baseItem.id);
            if (fetched) {
              return {
                ...baseItem,
                rate: typeof fetched.rate === 'number' ? fetched.rate : baseItem.rate,
                trend: (fetched.trend === 'up' || fetched.trend === 'down' ? fetched.trend : 'stable') as 'up' | 'down' | 'stable',
                changePercent: typeof fetched.changePercent === 'number' ? fetched.changePercent : 0,
                rationale: fetched.rationale || baseItem.rationale
              };
            }
            return baseItem;
          });

          return {
            mandi: parsed.mandi || region,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' Today',
            marketSummary: parsed.marketSummary || 'Real-time scrap prices updated via Groq Llama 3.3 Mandi Index.',
            source: 'groq',
            updatedRates
          };
        }
      }
    } catch (err) {
      console.warn('Groq API call failed, switching to realistic dynamic simulation fallback:', err);
    }
  }

  // Fallback Dynamic Simulation: Generates realistic fluctuating rates with rationale
  await new Promise(res => setTimeout(res, 800)); // slight latency to feel authentic
  const variations: Record<string, { delta: number; trend: 'up' | 'down' | 'stable'; rationale: string }> = {
    newspaper: { delta: +(Math.random() * 0.8 - 0.2).toFixed(2), trend: 'up', rationale: 'Newsprint paper mill demand uptick in domestic hub' },
    cardboard: { delta: +(Math.random() * 1.0 + 0.2).toFixed(2), trend: 'up', rationale: 'High corrugated box packaging volumes for retail shipments' },
    pet_bottle: { delta: +(Math.random() * 0.9 + 0.3).toFixed(2), trend: 'up', rationale: 'Recycled polyester rPET pellet demand firming across India' },
    hdpe_plastic: { delta: +(Math.random() * 0.5 - 0.2).toFixed(2), trend: 'stable', rationale: 'Steady pipe and blow-molding extrusion recycling index' },
    iron: { delta: -(Math.random() * 0.8 + 0.2).toFixed(2), trend: 'down', rationale: 'Secondary furnace re-melt inventory well stocked' },
    copper: { delta: +(Math.random() * 12 + 5).toFixed(2), trend: 'up', rationale: 'LME global spot copper and wiring cable shortage' },
    brass: { delta: +(Math.random() * 4 - 2).toFixed(2), trend: 'stable', rationale: 'Export brassware handicraft steady procurement' },
    aluminium: { delta: +(Math.random() * 3 + 1).toFixed(2), trend: 'up', rationale: 'Automotive cylinder and ingot die-casting appetite' },
    ewaste: { delta: +(Math.random() * 2 + 1).toFixed(2), trend: 'up', rationale: 'CPCB EPR credit compliance deadline approaching' },
    beer_bottle: { delta: 0, trend: 'stable', rationale: 'Fixed brewery deposit scheme standard return rate' }
  };

  const updatedRates = initialScrapRates.map(baseItem => {
    const v = variations[baseItem.id] || { delta: 0, trend: 'stable', rationale: 'Market stable' };
    const newRate = Math.max(1, +(baseItem.rate + v.delta).toFixed(2));
    const pct = +(((newRate - baseItem.rate) / baseItem.rate) * 100).toFixed(1);
    return {
      ...baseItem,
      rate: newRate,
      trend: v.trend,
      changePercent: pct,
      rationale: v.rationale
    };
  });

  return {
    mandi: `${region} (Live Smart Mandi Index)`,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' (Simulated Auto-Sync)',
    marketSummary: 'Paper and non-ferrous metals are trending upward due to industrial recycler demand; iron scrap remains range-bound.',
    source: 'simulation',
    updatedRates
  };
}

/**
 * Analyze scrap image using Groq Vision API (llama-3.2-11b-vision-preview)
 * or fallback to intelligent edge-simulation if offline or using sample buttons.
 */
export async function analyzeScrapImageWithGroq(
  imageBase64: string,
  sampleKey?: string,
  customKey?: string
): Promise<AiInferenceResult> {
  const apiKey = (customKey || getStoredGroqApiKey()).trim();

  // If a preset key is provided and no custom photo or no apiKey, return preset directly
  if (sampleKey && presetAiSpecimens[sampleKey as keyof typeof presetAiSpecimens] && !imageBase64.startsWith('data:image/')) {
    await new Promise(res => setTimeout(res, 600));
    return presetAiSpecimens[sampleKey as keyof typeof presetAiSpecimens];
  }

  // Attempt real Groq Vision API if API key is provided and we have an image
  if (apiKey && imageBase64 && imageBase64.startsWith('data:image/')) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.2-11b-vision-preview',
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `You are an expert computer vision dry waste classifier and recycling engineer for India's Swachh Bharat / Circular Economy.
Analyze the provided waste or scrap photo.
Identify:
1. Category name (e.g., PET Plastic Bottles, Corrugated Cardboard, Bare Copper Wire, Iron Scrap, E-Waste PCB, Aluminium Can)
2. Specific polymer or metal grade (e.g. Polyethylene Terephthalate Post-Consumer, OCC Kraft Double Wall, IS-Cu-ETP Red Metal, WEEE Cat-3, Alloy 3004)
3. Confidence score between 75 and 99
4. Contamination assessment (e.g. 'Low (< 2% dust/liquid)', 'Clean & Dry', 'Medium (food residue)')
5. Contamination risk: must be 'Low', 'Medium', or 'High'
6. Estimated fair Indian scrap mandi price in INR per kg (or piece for bottles)
7. Circular recyclability code (e.g. '#1-PETE', '#PAP-20', 'IS-Cu-ETP', 'WEEE-3')
8. Closest calculator category id from: ['pet_bottle', 'cardboard', 'hdpe_plastic', 'iron', 'copper', 'brass', 'aluminium', 'ewaste', 'newspaper', 'beer_bottle']
9. Brief recycling advice for maximum cash payout

Return strictly JSON matching:
{
  "category": "...",
  "specificGrade": "...",
  "confidence": 96.5,
  "contamination": "...",
  "contaminationRisk": "Low",
  "estimatedRate": 18.0,
  "code": "...",
  "calcCategory": "pet_bottle",
  "advice": "..."
}`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this scrap or dry waste image for circular recycling segregation and estimate fair market price in India.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageBase64
                  }
                }
              ]
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            category: parsed.category || 'Classified Dry Waste Item',
            specificGrade: parsed.specificGrade || 'Industrial Recyclable Specimen',
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 94.2,
            contamination: parsed.contamination || 'Low contamination (< 2%)',
            contaminationRisk: (parsed.contaminationRisk === 'Medium' || parsed.contaminationRisk === 'High' ? parsed.contaminationRisk : 'Low') as 'Low' | 'Medium' | 'High',
            estimatedRate: typeof parsed.estimatedRate === 'number' ? parsed.estimatedRate : 20.0,
            code: parsed.code || '#REC-CIRCULAR',
            calcCategory: parsed.calcCategory || 'pet_bottle',
            advice: parsed.advice || 'Segregate at source and keep clean/dry for fair digital scale weighing.',
            source: 'groq'
          };
        }
      } else {
        console.warn('Groq Vision API returned non-OK status:', response.status);
      }
    } catch (err) {
      console.warn('Groq Vision API inference error, falling back to simulated analysis:', err);
    }
  }

  // Simulation fallback for custom uploaded images
  await new Promise(res => setTimeout(res, 900));
  return {
    category: 'Mixed Dry Polymer / Packaging Waste',
    specificGrade: 'Polyethylene / Post-Industrial Flexible & Rigid Blend',
    confidence: 94.6,
    contamination: 'Dry / Minor surface dust (< 2.5%)',
    contaminationRisk: 'Low',
    estimatedRate: 18.5,
    code: '#1/#2-Polymer Blend',
    calcCategory: 'pet_bottle',
    advice: 'Rinse any liquid residue to ensure zero tare deduction during Kabadiwala weighing.',
    source: 'edge-simulation'
  };
}
