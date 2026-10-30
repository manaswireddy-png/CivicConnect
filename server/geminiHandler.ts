import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { VERIFIED_SERVICES } from '../src/data/servicesData';

dotenv.config();

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Grounding prompt with verified knowledge base
const GROUNDING_KNOWLEDGE = VERIFIED_SERVICES.map(s => `
Service ID: ${s.serviceId}
Service Name: ${s.name} (Telugu: ${s.teluguName || 'N/A'}, Hindi: ${s.hindiName || 'N/A'})
Category: ${s.category}
Department: ${s.department}
Description: ${s.description}
Eligibility: ${s.eligibility}
Required Documents: ${s.requiredDocuments.join('; ')}
Procedure: ${s.procedure}
Official Portal: ${s.officialSource}
Last Verified Date: ${s.lastReviewed}
Helpline: ${s.helpline}
Official Fee: ${s.fee}
Timeline: ${s.turnaroundTime}
---`).join('\n');

async function callGeminiWithRetry(contents: any, config?: any, attempts = 2) {
  const ai = getAI();
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

  for (let i = 0; i < attempts; i++) {
    const modelToUse = models[i % models.length];
    try {
      const response = await ai.models.generateContent({
        model: modelToUse,
        contents,
        config,
      });
      return response;
    } catch (err: any) {
      console.warn(`Gemini attempt ${i + 1} (${modelToUse}) failed:`, err?.message);
      if (i < attempts - 1) {
        await new Promise(r => setTimeout(r, 600 * (i + 1)));
      } else {
        throw err;
      }
    }
  }
}

export async function handleChatQuery(
  userQuery: string,
  history: Array<{ sender: string; text: string }>,
  language: 'en' | 'te' | 'hi' = 'en'
) {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    return {
      text: "Gemini API key is not configured on the server. Please check your project settings in the Secrets panel.",
      sources: [],
    };
  }

  const langInstruction =
    language === 'te'
      ? 'Respond completely in authentic Telugu (తెలుగు script). Maintain official department names in recognizable Telugu/English transliteration.'
      : language === 'hi'
      ? 'Respond completely in authentic Hindi (हिन्दी / Devanagari script). Maintain official department names in recognizable Hindi/English transliteration.'
      : 'Respond in clear, professional English.';

  const systemInstruction = `You are CivicConnect AI, an intelligent, authoritative public grievance and government service assistant for citizens of Telangana and Hyderabad, India.

Your knowledge base consists of official, verified Telangana Government, GHMC, HMWSSB, TSSPDCL, and MeeSeva services:
${GROUNDING_KNOWLEDGE}

CRITICAL RULES:
1. Always base service information, procedures, documents, fees, and helplines on the verified knowledge base entries above.
2. If reliable or verified information is unavailable for a requested specific scheme or department, state clearly: "This information could not be verified in our current verified Telangana government directory. Please consult the official MeeSeva or GHMC office."
3. NEVER invent government schemes, eligibility rules, deadlines, fees, or contact details.
4. ${langInstruction}
5. If the citizen describes a civic issue, civic complaint, or emergency problem (e.g. water pipeline break, power outage, pothole, overflowing garbage, broken street light, fallen tree, drainage overflow):
   - Categorize the issue accurately (e.g., Water Supply, Roads & Infrastructure, Electricity, Sanitation, Street Lights, Public Health).
   - Identify the exact responsible department (GHMC, HMWSSB, TSSPDCL, MeeSeva/Revenue, etc.).
   - Suggest a concise complaint title.
   - Suggest urgency Priority: Low, Medium, High, or Urgent.
   - Explain why this department is responsible.
   - In addition to your helpful conversational answer, append this exact structured JSON block at the very end of your response so the citizen can click to pre-fill the official grievance form:
   <<<GRIEVANCE_DATA: {"category": "...", "department": "...", "title": "...", "priority": "Low|Medium|High|Urgent", "rationale": "..."}>>>

Keep responses clear, citizen-friendly, empathetic, and structured with bullet points.`;

  try {
    const formattedHistory = (history || []).slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    // Add current user query
    formattedHistory.push({
      role: 'user',
      parts: [{ text: userQuery }],
    });

    const response = await callGeminiWithRetry(formattedHistory, {
      systemInstruction,
    });

    const rawText = response?.text || '';

    // Extract structured grievance data if present
    let text = rawText;
    let grievanceSuggestion = undefined;
    const grievanceMatch = rawText.match(/<<<GRIEVANCE_DATA:\s*(\{.*?\})>>>/s);
    if (grievanceMatch) {
      try {
        grievanceSuggestion = JSON.parse(grievanceMatch[1]);
        text = rawText.replace(/<<<GRIEVANCE_DATA:\s*\{.*?\}>>>/s, '').trim();
      } catch (e) {
        console.warn('Could not parse grievance data JSON:', e);
      }
    }

    // Identify which verified services were referenced
    const lowerQuery = (userQuery + ' ' + text).toLowerCase();
    const matchedSources = VERIFIED_SERVICES.filter(s => {
      const matchName = lowerQuery.includes(s.name.toLowerCase().split(' ')[0]);
      const matchDept = lowerQuery.includes(s.department.toLowerCase().split(' ')[0]);
      const matchCat = lowerQuery.includes(s.category.toLowerCase().split(' ')[0]);
      return matchName || matchDept || matchCat;
    }).slice(0, 3).map(s => ({
      name: s.name,
      url: s.officialSource,
      department: s.department,
      lastReviewed: s.lastReviewed,
    }));

    return {
      text,
      sources: matchedSources,
      grievanceSuggestion,
    };
  } catch (error: any) {
    console.error('Gemini chat error, generating grounded fallback response:', error);
    // Find closest verified service to provide immediate helpful assistance
    const lower = userQuery.toLowerCase();
    const matched = VERIFIED_SERVICES.find(s =>
      lower.includes(s.category.toLowerCase().split(' ')[0]) ||
      lower.includes(s.name.toLowerCase().split(' ')[0]) ||
      lower.includes(s.department.toLowerCase().split(' ')[0])
    ) || VERIFIED_SERVICES[0];

    return {
      text: `Here is the verified government information regarding ${matched.name}:\n\n` +
            `• **Department**: ${matched.department}\n` +
            `• **Procedure**: ${matched.procedure}\n` +
            `• **Required Documents**: ${matched.requiredDocuments.join(', ')}\n` +
            `• **Official Helpline**: ${matched.helpline}\n` +
            `• **Fee**: ${matched.fee}\n\n` +
            `You can lodge an official grievance directly through the "Submit Grievance" tab.`,
      sources: [{
        name: matched.name,
        url: matched.officialSource,
        department: matched.department,
        lastReviewed: matched.lastReviewed,
      }],
    };
  }
}

export async function handleGrievanceSuggestion(description: string, location: string) {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    return getHeuristicGrievanceSuggestion(description, location);
  }

  try {
    const prompt = `Analyze this civic complaint described by a citizen in Hyderabad/Telangana:
Description: "${description}"
Location: "${location}"

Grounding Categories and Departments:
- "Water Supply" -> "Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB)"
- "Water Supply & Drainage" -> "Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB)"
- "Roads & Infrastructure" -> "Greater Hyderabad Municipal Corporation (GHMC) / Engineering Wing"
- "Electricity" -> "Southern Power Distribution Company of Telangana Limited (TSSPDCL)"
- "Sanitation" -> "Greater Hyderabad Municipal Corporation (GHMC) / Health & Sanitation"
- "Street Lights & Infrastructure" -> "Greater Hyderabad Municipal Corporation (GHMC) / Electrical Wing"
- "Public Health & Fogging" -> "GHMC Entomology Wing"
- "Birth & Death Certificates" -> "GHMC Health Wing / MeeSeva"
- "Revenue & Certificates" -> "Revenue Department / MeeSeva"
- "Welfare & Ration" -> "Civil Supplies Department, Telangana"
- "Welfare & Pensions" -> "Panchayat Raj & Rural Development / Municipal Administration"
- "Municipal Services" -> "Greater Hyderabad Municipal Corporation (GHMC)"

Suggest:
1. Exact category from above
2. Exact department
3. Concise 4-7 word title
4. Priority: Low, Medium, High, or Urgent
5. Brief 1-2 sentence explanation of why this department is assigned.`;

    const response = await callGeminiWithRetry(prompt, {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          department: { type: Type.STRING },
          title: { type: Type.STRING },
          priority: {
            type: Type.STRING,
            enum: ['Low', 'Medium', 'High', 'Urgent'],
          },
          rationale: { type: Type.STRING },
        },
        required: ['category', 'department', 'title', 'priority', 'rationale'],
      },
    });

    const parsed = JSON.parse(response?.text || '{}');
    if (parsed.category && parsed.department) {
      return parsed;
    }
    return getHeuristicGrievanceSuggestion(description, location);
  } catch (error) {
    console.warn('Using grounded heuristic suggestion:', error);
    return getHeuristicGrievanceSuggestion(description, location);
  }
}

function getHeuristicGrievanceSuggestion(description: string, location: string) {
  const lower = (description + ' ' + location).toLowerCase();
  if (lower.includes('water') || lower.includes('pipeline') || lower.includes('tanker') || lower.includes('tap') || lower.includes('leak')) {
    return {
      category: 'Water Supply',
      department: 'Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB)',
      title: 'Water Supply Interruption or Pipeline Leak',
      priority: 'High' as const,
      rationale: 'Pertains to drinking water distribution network managed by HMWSSB.',
    };
  }
  if (lower.includes('drain') || lower.includes('sewer') || lower.includes('manhole') || lower.includes('gutter')) {
    return {
      category: 'Water Supply & Drainage',
      department: 'Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB)',
      title: 'Drainage Overflow and Sewer Blockage',
      priority: 'High' as const,
      rationale: 'Underground sewerage and manhole desiltation under HMWSSB operations.',
    };
  }
  if (lower.includes('power') || lower.includes('electric') || lower.includes('transformer') || lower.includes('voltage') || lower.includes('meter') || lower.includes('spark')) {
    return {
      category: 'Electricity',
      department: 'Southern Power Distribution Company of Telangana Limited (TSSPDCL)',
      title: 'Power Outage or Electrical Hazard',
      priority: 'High' as const,
      rationale: 'Distribution infrastructure and transformer maintenance falls under TSSPDCL jurisdiction.',
    };
  }
  if (lower.includes('garbage') || lower.includes('waste') || lower.includes('trash') || lower.includes('sweeping') || lower.includes('dustbin') || lower.includes('clean')) {
    return {
      category: 'Sanitation',
      department: 'Greater Hyderabad Municipal Corporation (GHMC) / Health & Sanitation',
      title: 'Solid Waste and Sanitation Clearance',
      priority: 'Medium' as const,
      rationale: 'Municipal solid waste management and SAT auto collection under GHMC Health Wing.',
    };
  }
  if (lower.includes('light') || lower.includes('lamp') || lower.includes('pole') || lower.includes('dark')) {
    return {
      category: 'Street Lights & Infrastructure',
      department: 'Greater Hyderabad Municipal Corporation (GHMC) / Electrical Wing',
      title: 'Non-functional Street Lighting Hazard',
      priority: 'Medium' as const,
      rationale: 'Municipal public lighting maintenance falls under GHMC Electrical Wing.',
    };
  }
  if (lower.includes('mosquito') || lower.includes('dengue') || lower.includes('malaria') || lower.includes('spray') || lower.includes('fog')) {
    return {
      category: 'Public Health & Fogging',
      department: 'GHMC Entomology Wing',
      title: 'Mosquito Menace and Vector Fogging Request',
      priority: 'Medium' as const,
      rationale: 'Vector control and thermal fogging operations managed by GHMC Entomology Wing.',
    };
  }
  if (lower.includes('pothole') || lower.includes('road') || lower.includes('tar') || lower.includes('crater') || lower.includes('asphalt')) {
    return {
      category: 'Roads & Infrastructure',
      department: 'Greater Hyderabad Municipal Corporation (GHMC) / Engineering Wing',
      title: 'Damaged Road and Pothole Repair',
      priority: 'Urgent' as const,
      rationale: 'Municipal road corridor resurfacing and pothole squad under GHMC Engineering Wing.',
    };
  }
  return {
    category: 'General Civic Amenities',
    department: 'Greater Hyderabad Municipal Corporation (GHMC)',
    title: 'Civic Complaint in Locality',
    priority: 'Medium' as const,
    rationale: 'General municipal jurisdiction under Greater Hyderabad Municipal Corporation.',
  };
}
