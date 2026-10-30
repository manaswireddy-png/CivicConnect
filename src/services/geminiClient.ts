import { ChatMessage, GrievanceSuggestion, Language, SourceReference } from '../types';

export interface ChatResponse {
  text: string;
  sources: SourceReference[];
  grievanceSuggestion?: GrievanceSuggestion;
}

export async function askGeminiAssistant(
  query: string,
  history: ChatMessage[],
  language: Language
): Promise<ChatResponse> {
  try {
    const formattedHistory = history.map(h => ({
      sender: h.sender,
      text: h.text,
    }));

    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        history: formattedHistory,
        language,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.text || 'No response generated.',
      sources: data.sources || [],
      grievanceSuggestion: data.grievanceSuggestion,
    };
  } catch (error: any) {
    console.error('Error contacting Gemini backend:', error);
    return {
      text: `Unable to connect to AI assistant service: ${error?.message || 'Network error'}. Please check your connection.`,
      sources: [],
    };
  }
}

export async function suggestGrievanceCategory(
  description: string,
  location: string
): Promise<GrievanceSuggestion> {
  try {
    const response = await fetch('/api/gemini/suggest-grievance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        location,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return {
      category: data.category || 'General Civic Amenities',
      department: data.department || 'Greater Hyderabad Municipal Corporation (GHMC)',
      title: data.title || 'Civic Issue in Locality',
      priority: data.priority || 'Medium',
      rationale: data.rationale || 'Suggested according to civic jurisdiction in Hyderabad.',
    };
  } catch (error) {
    console.warn('Fallback grievance suggestion:', error);
    return {
      category: 'Roads & Infrastructure',
      department: 'Greater Hyderabad Municipal Corporation (GHMC)',
      title: 'Civic Complaint',
      priority: 'Medium',
      rationale: 'Default municipal jurisdiction under GHMC.',
    };
  }
}
