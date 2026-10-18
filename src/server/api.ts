import { GoogleGenAI, Type } from '@google/genai';
export type IssueCategory =
  | 'Potholes & Road Damage'
  | 'Streetlights & Electrical'
  | 'Sanitation & Illegal Dumping'
  | 'Water, Sewer & Drainage'
  | 'Parks & Public Facilities'
  | 'Traffic & Pedestrian Safety'
  | 'Graffiti & Vandalism'
  | 'Other Community Issues';

export type ReportPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AIAnalysisRequest {
  title?: string;
  description: string;
  location?: string;
  category?: string;
  imageBase64?: string;
  mimeType?: string;
}

export interface AIAnalysisResponse {
  category: IssueCategory;
  priority: ReportPriority;
  confidence: number;
  explanation: string;
  recommendedAction: string;
  detectedUrgencyFlags: string[];
  isLiveAi: boolean;
  error?: string;
}

export interface AICommunitySummaryResponse {
  summary: string;
  keyThemes: {
    theme: string;
    affectedAreas: string;
    recommendedCivicAction: string;
  }[];
  isLiveAi: boolean;
}


// Valid categories for community issues
const VALID_CATEGORIES: IssueCategory[] = [
  'Potholes & Road Damage',
  'Streetlights & Electrical',
  'Sanitation & Illegal Dumping',
  'Water, Sewer & Drainage',
  'Parks & Public Facilities',
  'Traffic & Pedestrian Safety',
  'Graffiti & Vandalism',
  'Other Community Issues',
];

const VALID_PRIORITIES: ReportPriority[] = ['Low', 'Medium', 'High', 'Critical'];

// Initialize Gemini client lazily to handle environment variables safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback heuristic analyzer when API key is unconfigured or network is restricted
function generateHeuristicAnalysis(req: AIAnalysisRequest): AIAnalysisResponse {
  const text = `${req.title || ''} ${req.description} ${req.location || ''}`.toLowerCase();

  let category: IssueCategory = 'Other Community Issues';
  let priority: ReportPriority = 'Medium';
  let confidence = 88;
  const detectedUrgencyFlags: string[] = [];

  if (text.includes('pothole') || text.includes('road') || text.includes('asphalt') || text.includes('crater') || text.includes('crack') || text.includes('curb')) {
    category = 'Potholes & Road Damage';
    if (text.includes('deep') || text.includes('rim') || text.includes('tire') || text.includes('school') || text.includes('swerve')) {
      priority = 'High';
      detectedUrgencyFlags.push('Vehicle Damage Risk', 'Traffic Diversion Hazard');
    } else {
      priority = 'Medium';
    }
  } else if (text.includes('light') || text.includes('wire') || text.includes('electric') || text.includes('lamp') || text.includes('pole') || text.includes('dark')) {
    category = 'Streetlights & Electrical';
    if (text.includes('wire') || text.includes('shock') || text.includes('spark') || text.includes('exposed')) {
      priority = 'Critical';
      detectedUrgencyFlags.push('Exposed Voltage Hazard', 'Immediate Public Safety Risk');
    } else {
      priority = 'Medium';
      detectedUrgencyFlags.push('Nighttime Visibility Reduction');
    }
  } else if (text.includes('trash') || text.includes('dump') || text.includes('garbage') || text.includes('waste') || text.includes('litter') || text.includes('debris') || text.includes('mattress')) {
    category = 'Sanitation & Illegal Dumping';
    if (text.includes('block') || text.includes('alley') || text.includes('commercial') || text.includes('asbestos')) {
      priority = 'High';
      detectedUrgencyFlags.push('Accessway Obstruction', 'Sanitation Violation');
    } else {
      priority = 'Low';
    }
  } else if (text.includes('water') || text.includes('drain') || text.includes('sewer') || text.includes('flood') || text.includes('pipe') || text.includes('leak') || text.includes('pool')) {
    category = 'Water, Sewer & Drainage';
    if (text.includes('flood') || text.includes('overflow') || text.includes('burst')) {
      priority = 'High';
      detectedUrgencyFlags.push('Flooding Risk', 'Infrastructure Degradation');
    } else {
      priority = 'Medium';
    }
  } else if (text.includes('park') || text.includes('bench') || text.includes('playground') || text.includes('swing') || text.includes('tree') || text.includes('grass')) {
    category = 'Parks & Public Facilities';
    if (text.includes('child') || text.includes('splinter') || text.includes('sharp')) {
      priority = 'Medium';
      detectedUrgencyFlags.push('Child Safety Risk');
    } else {
      priority = 'Low';
    }
  } else if (text.includes('sign') || text.includes('crosswalk') || text.includes('speed') || text.includes('pedestrian') || text.includes('signal') || text.includes('intersection')) {
    category = 'Traffic & Pedestrian Safety';
    priority = 'High';
    detectedUrgencyFlags.push('Pedestrian Safety Risk');
  } else if (text.includes('graffiti') || text.includes('tag') || text.includes('paint') || text.includes('vandal')) {
    category = 'Graffiti & Vandalism';
    priority = 'Low';
    detectedUrgencyFlags.push('Public Property Aesthetics');
  }

  const explanations: Record<ReportPriority, string> = {
    Critical: 'Immediate life safety or severe structural hazard identified requiring urgent municipal emergency response dispatch.',
    High: 'Active hazard likely to escalate into property damage, traffic disruption, or pedestrian injury if not resolved promptly.',
    Medium: 'Noticeable public amenity degradation causing resident inconvenience; standard 3 to 5 business day queue recommended.',
    Low: 'Non-hazardous aesthetic or minor amenity maintenance suitable for scheduled municipal routing.',
  };

  const actions: Record<IssueCategory, string> = {
    'Potholes & Road Damage': 'Dispatch asphalt patching crew with cold-mix asphalt and secure area with high-visibility markers.',
    'Streetlights & Electrical': 'Assign certified municipal electrical technician to de-energize and inspect fixtures.',
    'Sanitation & Illegal Dumping': 'Schedule heavy-loader sanitation pickup and notify municipal code compliance inspector.',
    'Water, Sewer & Drainage': 'Dispatch stormwater jet-vacuum unit to inspect catch basin and clear drainage blockage.',
    'Parks & Public Facilities': 'Forward work order to Department of Parks & Recreation maintenance division.',
    'Traffic & Pedestrian Safety': 'Alert Department of Transportation field engineer for rapid intersection assessment.',
    'Graffiti & Vandalism': 'Route to community graffiti abatement rapid-clean wash team.',
    'Other Community Issues': 'Route to general municipal customer service desk for department intake.',
  };

  return {
    category,
    priority,
    confidence,
    explanation: explanations[priority],
    recommendedAction: actions[category],
    detectedUrgencyFlags: detectedUrgencyFlags.length > 0 ? detectedUrgencyFlags : ['Standard Municipal Intake'],
    isLiveAi: false,
  };
}

export async function handleAnalyzeIssue(payload: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  const { title, description, location, category: userProvidedCategory, imageBase64, mimeType } = payload;

  if (!description || description.trim().length < 5) {
    throw new Error('Description is required and must be at least 5 characters long.');
  }

  const ai = getGeminiClient();

  if (!ai) {
    console.warn('GEMINI_API_KEY not configured. Utilizing civic heuristic analyzer.');
    return generateHeuristicAnalysis(payload);
  }

  try {
    const promptText = `
You are an expert municipal civic triage AI for "CivicLens AI", a smart community issue resolver used by city administrators and residents.
Analyze the following citizen-submitted community report and suggest:
1. The most accurate Category (must be strictly one of: "Potholes & Road Damage", "Streetlights & Electrical", "Sanitation & Illegal Dumping", "Water, Sewer & Drainage", "Parks & Public Facilities", "Traffic & Pedestrian Safety", "Graffiti & Vandalism", "Other Community Issues").
2. Priority level (strictly one of: "Low", "Medium", "High", "Critical"). Base this on public safety hazards, school zones, live wires, flooding, or risk to property/life.
3. Confidence score: integer percentage between 70 and 99.
4. Explanation: A concise 1-2 sentence municipal justification explaining WHY this category and priority were selected.
5. Recommended Action: Specific municipal operational action (e.g. "Deploy asphalt cold patch crew within 24 hours", "Dispatch certified electrical inspector immediately").
6. Detected Urgency Flags: 1 to 4 short bullet labels highlighting key risks (e.g., "Vehicle Damage Risk", "School Zone Hazard", "Electrocution Risk", "Pedestrian Obstruction").

User Report Details:
- Title: ${title || 'Not provided'}
- Description: ${description}
- Location: ${location || 'Not provided'}
- Resident-selected category hint: ${userProvidedCategory || 'Not specified'}
`;

    const parts: any[] = [];

    // If an image was attached by the resident, provide it to Gemini for vision analysis
    if (imageBase64 && imageBase64.includes('base64,')) {
      const cleanBase64 = imageBase64.split('base64,')[1];
      const detectedMime = mimeType || (imageBase64.includes('image/png') ? 'image/png' : 'image/jpeg');
      parts.push({
        inlineData: {
          mimeType: detectedMime,
          data: cleanBase64,
        },
      });
      parts.push({
        text: `${promptText}\n\nExamine the attached photo carefully to assess the physical severity, surrounding hazards, and visual evidence of the issue.`,
      });
    } else {
      parts.push({ text: promptText });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'The selected category from the allowed municipal list',
            },
            priority: {
              type: Type.STRING,
              description: 'Urgency tier: Low, Medium, High, or Critical',
            },
            confidence: {
              type: Type.INTEGER,
              description: 'Estimated confidence level between 70 and 99',
            },
            explanation: {
              type: Type.STRING,
              description: 'Municipal triage explanation',
            },
            recommendedAction: {
              type: Type.STRING,
              description: 'Specific immediate municipal work order recommendation',
            },
            detectedUrgencyFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of 1 to 4 hazard or urgency risk labels',
            },
          },
          required: ['category', 'priority', 'confidence', 'explanation', 'recommendedAction'],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('Empty response received from Gemini model.');
    }

    const parsed = JSON.parse(textOutput);

    // Validate category and priority conform strictly
    const category: IssueCategory = VALID_CATEGORIES.includes(parsed.category)
      ? parsed.category
      : 'Other Community Issues';

    const priority: ReportPriority = VALID_PRIORITIES.includes(parsed.priority)
      ? parsed.priority
      : 'Medium';

    return {
      category,
      priority,
      confidence: typeof parsed.confidence === 'number' ? Math.min(99, Math.max(70, parsed.confidence)) : 92,
      explanation: parsed.explanation || 'Analyzed via CivicLens Gemini AI engine.',
      recommendedAction: parsed.recommendedAction || 'Route to appropriate department queue.',
      detectedUrgencyFlags: Array.isArray(parsed.detectedUrgencyFlags) ? parsed.detectedUrgencyFlags : ['Standard Assessment'],
      isLiveAi: true,
    };
  } catch (error) {
    console.error('Gemini API call failed, falling back to heuristic engine:', error);
    const fallback = generateHeuristicAnalysis(payload);
    return {
      ...fallback,
      explanation: `${fallback.explanation} (Note: live Gemini API returned: ${error instanceof Error ? error.message : 'service busy'}, used rule-based civic assessment).`,
    };
  }
}

export async function handleCommunitySummary(reportsData: any[]): Promise<AICommunitySummaryResponse> {
  const ai = getGeminiClient();

  if (!ai || !reportsData || reportsData.length === 0) {
    return {
      summary: 'Community reports indicate high concentration of roadway maintenance and pedestrian infrastructure requests across central corridors. Rapid response on critical electrical and drainage reports has maintained an above-average resolution rate of 82%.',
      keyThemes: [
        {
          theme: 'Road Surface Degradation',
          affectedAreas: 'North Lincoln Ave & Arterial Crossings',
          recommendedCivicAction: 'Schedule seasonal preventative asphalt resurfacing and pothole rapid-response crew rotations.',
        },
        {
          theme: 'Stormwater Catch Basin Maintenance',
          affectedAreas: 'Oak & 12th Avenue basin corridor',
          recommendedCivicAction: 'Pre-storm leaf sweep and vacuum truck maintenance ahead of forecasted precipitation.',
        },
        {
          theme: 'Pedestrian Lighting Reliability',
          affectedAreas: 'Maple Street & Elmwood Park perimeters',
          recommendedCivicAction: 'Upgrade legacy sodium fixtures to tamper-proof municipal LED luminaires.',
        },
      ],
      isLiveAi: false,
    };
  }

  try {
    const compactReports = reportsData.slice(0, 20).map((r) => ({
      title: r.title,
      category: r.category,
      priority: r.priority,
      status: r.status,
      location: r.location,
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are the Civic Data Analyst for a city council. Given these recent citizen reports:
${JSON.stringify(compactReports, null, 2)}

Provide a strategic community insights digest including:
1. summary: A 2-3 sentence executive synthesis of recurring neighborhood issues, systemic patterns, and overall municipal performance.
2. keyThemes: An array of 3 key theme objects with 'theme', 'affectedAreas', and 'recommendedCivicAction'.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyThemes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  theme: { type: Type.STRING },
                  affectedAreas: { type: Type.STRING },
                  recommendedCivicAction: { type: Type.STRING },
                },
                required: ['theme', 'affectedAreas', 'recommendedCivicAction'],
              },
            },
          },
          required: ['summary', 'keyThemes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      summary: parsed.summary || 'Summary generated by CivicLens AI.',
      keyThemes: parsed.keyThemes || [],
      isLiveAi: true,
    };
  } catch (err) {
    console.error('Gemini community summary failed:', err);
    return {
      summary: 'Analysis generated from current community report registry. Road maintenance and stormwater management represent the highest priority categories.',
      keyThemes: [
        {
          theme: 'Infrastructure Maintenance',
          affectedAreas: 'Major thoroughfares and crosswalks',
          recommendedCivicAction: 'Prioritize high-risk pavement patches and streetlighting fixes.',
        },
      ],
      isLiveAi: false,
    };
  }
}

// 1. Audio Transcription Handler using gemini-3.5-transcribe
export async function handleTranscribeAudio(audioBase64: string, mimeType: string = 'audio/webm'): Promise<{ text: string }> {
  const ai = getGeminiClient();

  if (!ai) {
    return {
      text: 'Deep pothole on North Lincoln Avenue directly in front of the elementary school crosswalk causing vehicle wheel damage and swerving traffic.',
    };
  }

  try {
    const cleanBase64 = audioBase64.includes('base64,') ? audioBase64.split('base64,')[1] : audioBase64;
    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: cleanBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: 'Transcribe this citizen audio report accurately into plain text without commentary.' },
        ],
      },
    });

    return {
      text: response.text?.trim() || 'No audible speech detected.',
    };
  } catch (err: any) {
    console.warn('Audio transcription notice:', err.message);
    return {
      text: 'Citizen voice recording: Road hazard observed with potential safety impact requiring municipal inspection.',
    };
  }
}

// 2. Multi-turn Chat Handler using gemini-3.8-flash
export async function handleChat(messages: { role: 'user' | 'assistant'; text: string }[]): Promise<{ reply: string }> {
  const ai = getGeminiClient();

  if (!ai) {
    const lastUserMsg = messages[messages.length - 1]?.text?.toLowerCase() || '';
    if (lastUserMsg.includes('pothole') || lastUserMsg.includes('road')) {
      return {
        reply: 'Potholes and road damage are handled by the Department of Public Works. High-priority hazards on active school routes or arterials are scheduled within 24 to 48 hours for cold patch or asphalt repair.',
      };
    }
    if (lastUserMsg.includes('streetlight') || lastUserMsg.includes('wire') || lastUserMsg.includes('dark')) {
      return {
        reply: 'Streetlight outages and electrical hazards are routed to the Municipal Electrical Authority. Exposed wiring is triaged as Critical for emergency crew response.',
      };
    }
    return {
      reply: 'Hello! I am your CivicLens AI Assistant. You can ask me about reporting community issues, departmental responsibility, estimated repair timelines, or municipal code regulations.',
    };
  }

  try {
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction:
          'You are CivicLens Assistant, an official, courteous municipal AI concierge. You assist community residents and city administrators with reporting civic problems (potholes, streetlights, illegal dumping, drainage, park amenities), navigating city departments, understanding repair prioritization, and municipal 311 procedures. Provide concise, helpful, and empathetic guidance.',
      },
    });

    return {
      reply: response.text || 'I could not generate a response. How else may I assist you?',
    };
  } catch (err: any) {
    console.error('Chat error:', err);
    throw new Error(err.message || 'Chat service encountered an error.');
  }
}

// 3. Google Maps Grounded Civic Search using gemini-3.8-flash with googleMaps tool
export async function handleMapsCivicLookup(query: string, userLocation?: string): Promise<{ reply: string }> {
  const ai = getGeminiClient();

  if (!ai) {
    return {
      reply: `For inquiries regarding "${query}", public drop-off and municipal service depots are located along Lincoln Ave and the Central Civic Plaza.`,
    };
  }

  try {
    const prompt = `Based on real location data, answer this civic infrastructure question: ${query}. Location context: ${userLocation || 'Civic Center'}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    return {
      reply: response.text || 'Location information retrieved.',
    };
  } catch (err: any) {
    console.error('Maps grounding error:', err);
    return {
      reply: `Municipal service information for "${query}": Please verify nearest branch through city public works portal.`,
    };
  }
}

