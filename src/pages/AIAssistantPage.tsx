import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { askGeminiAssistant } from '../services/geminiClient';
import { ChatMessage, Language, GrievanceSuggestion } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Globe,
  RotateCcw,
  User,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface AIAssistantPageProps {
  onOpenGrievanceFormWithData: (data: GrievanceSuggestion & { descriptionText?: string }) => void;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({
  onOpenGrievanceFormWithData,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text:
          language === 'te'
            ? 'నమస్కారం! నేను సివిక్ కనెక్ట్ AI అసిస్టెంట్. తెలంగాణ ప్రభుత్వ సేవలు, ధ్రువీకరణ పత్రాలు, రేషన్ కార్డులు లేదా ప్రజా సమస్యల పరిష్కారం కోసం నన్ను అడగండి.'
            : language === 'hi'
            ? 'नमस्ते! मैं सिविक कनेक्ट AI सहायक हूँ। तेलंगाना सरकार की योजनाओं, प्रमाण पत्रों, राशन कार्ड या नागरिक समस्याओं के समाधान के लिए मुझसे पूछें।'
            : 'Namaste! I am the CivicConnect AI Public Assistant. I can assist you with verified Telangana government services, application procedures, or help file a civic grievance.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const suggestedQuestions: Record<Language, string[]> = {
    en: [
      'There has been no water supply in our area for three days.',
      'How do I apply for a new domestic water connection in Hyderabad?',
      'How to obtain an Income Certificate through MeeSeva in Telangana?',
      'What documents are needed for GHMC Birth Certificate?',
      'Dangerous deep pothole on KPHB Main Road near Metro pillar.',
      'Frequent power outages and sparking transformer in Madhapur.',
      'What is the eligibility for Aasara Senior Citizen Pension?'
    ],
    te: [
      'మా ప్రాంతంలో మూడు రోజుల నుండి మంచి నీటి సరఫరా లేదు.',
      'హైదరాబాద్‌లో కొత్త గృహ నీటి కనెక్షన్ ఎలా పొందాలి?',
      'మీసేవా ద్వారా ఆదాయ ధ్రువీకరణ పత్రం ఎలా పొందాలి?',
      'జిహెచ్‌ఎంసి జనన ధ్రువీకరణ పత్రానికి ఏ పత్రాలు అవసరం?',
      'కూకట్‌పల్లి రోడ్డుపై ప్రమాదకరమైన గుంత ఉంది.',
      'ఆసరా పింఛన్ పథకానికి అర్హతలు ఏమిటి?'
    ],
    hi: [
      'हमारे इलाके में पिछले तीन दिनों से पानी की आपूर्ति नहीं हो रही है।',
      'हैदराबाद में नए घरेलू जल आपूर्ति कनेक्शन के लिए आवेदन कैसे करें?',
      'मीसेवा के माध्यम से आय प्रमाण पत्र कैसे प्राप्त करें?',
      'जीएचएमसी जन्म प्रमाण पत्र के लिए कौन से दस्तावेज आवश्यक हैं?',
      'सड़क पर खतरनाक गड्ढे की शिकायत कैसे दर्ज करें?',
      'आसरा पेंशन योजना के लिए क्या पात्रता है?'
    ]
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    try {
      const response = await askGeminiAssistant(query, [...messages, userMessage], language);

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
        grievanceSuggestion: response.grievanceSuggestion,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Sorry, I encountered an issue processing your request. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text:
          language === 'te'
            ? 'సంభాషణ రీసెట్ చేయబడింది. మీరు ఏ సమాచారం కోరుకుంటున్నారు?'
            : language === 'hi'
            ? 'बातचीत रीसेट कर दी गई है। आप क्या जानकारी चाहते हैं?'
            : 'Conversation reset. How can I assist you with Telangana government services today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('aiAssistantTitle')}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('aiAssistantSubtitle')}
          </p>
        </div>

        {/* Language Tabs & Clear Button */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-md transition ${
                language === 'en' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-3 py-1 rounded-md transition ${
                language === 'te' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1 rounded-md transition ${
                language === 'hi' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिन्दी
            </button>
          </div>

          <button
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Questions Pills */}
      <div className="mb-6">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
          {t('suggestedQueries')}
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions[language].map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs text-left px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 transition shadow-2xl shadow-slate-100"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-blue-900 text-white'
                    : 'bg-gradient-to-br from-blue-700 to-indigo-800 text-amber-300 shadow-sm'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-blue-900 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Grievance Intelligence Action Card */}
                {msg.grievanceSuggestion && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 shadow-sm space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      Grievance Intelligence Detected
                    </div>
                    <div className="text-xs text-slate-800 space-y-1">
                      <div>
                        <span className="font-semibold text-slate-600">Category:</span>{' '}
                        <span className="font-bold text-blue-900">{msg.grievanceSuggestion.category}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600">Suggested Authority:</span>{' '}
                        <span className="font-bold text-slate-900">{msg.grievanceSuggestion.department}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600">Priority:</span>{' '}
                        <span className="font-bold text-amber-700">{msg.grievanceSuggestion.priority}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 italic">
                        "{msg.grievanceSuggestion.rationale}"
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        onOpenGrievanceFormWithData({
                          ...msg.grievanceSuggestion!,
                          descriptionText: msg.text,
                        })
                      }
                      className="mt-2 w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {t('openGrievanceForm')}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Grounded Sources References */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 text-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {t('sourcesHeader')}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 text-[11px] text-blue-800 border border-slate-200 transition"
                        >
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                          <span>{src.name}</span>
                          <span className="text-[10px] text-slate-400">({src.lastReviewed})</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`text-[10px] text-slate-400 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-indigo-800 text-amber-300 flex items-center justify-center text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-white border border-slate-200 shadow-sm flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 font-medium">CivicConnect AI is retrieving verified records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={t('chatPlaceholder')}
              disabled={isTyping}
              className="flex-1 px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold p-3 rounded-xl transition shadow-sm flex items-center justify-center shrink-0"
              aria-label="Send Message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>Official Telangana & Hyderabad Services AI Grounding</span>
            <span>Does not store confidential passwords or OTPs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
