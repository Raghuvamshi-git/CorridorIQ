import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Terminal,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { api } from '../services/api';

export default function AgentStudioPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello Controller. I am the **CorridorIQ Operations Agent** for the Hyderabad Metropolitan Region.

I am grounded in live database operational tools and can investigate corridor delays, detect bus bunching, inspect passenger overcrowding around Metro hubs (Ameerpet, Miyapur, Hitech City), and prescribe evidence-backed dispatch interventions.

How can I assist you with the Hyderabad transit network today?`,
      toolsExecuted: [],
      geminiActive: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [openToolIndex, setOpenToolIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "Which Hyderabad corridor has the highest average delay?",
    "Are buses bunching between Secunderabad and Hitech City on Route 101?",
    "What is the passenger demand around Ameerpet during peak hours?",
    "Compare Route 101 and Route 102 operational performance.",
    "Recommend dispatch actions for Route 105 around Tolichowki."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      // Build conversation history for API
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await api.chatWithAgent(text, history);

      const assistantMsg = {
        role: 'assistant',
        content: response.reply,
        toolsExecuted: response.tools_executed || [],
        evidence: response.evidence || [],
        geminiActive: response.gemini_active,
        notice: response.notice
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Operational Query Failed**: ${err.message || 'Unable to contact backend agent service.'}`,
          toolsExecuted: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleToolView = (idx) => {
    setOpenToolIndex(openToolIndex === idx ? null : idx);
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Studio Header */}
      <div className="p-4 border-b border-slate-800 bg-[#0c1222] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              CorridorIQ Autonomous Transport Controller
              <Badge variant="info">
                <Sparkles className="w-3 h-3 text-indigo-300" />
                Gemini 2.5 Flash
              </Badge>
            </h2>
            <p className="text-[11px] text-slate-400">
              Native function calling with 7 database-backed transit tools • Region: Hyderabad (IST)
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Read-Only Analytics Grounding
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-5">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-3xl ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 border border-slate-700 text-indigo-400'
              }`}
            >
              {m.role === 'user' ? 'ME' : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`rounded-xl p-4 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-sm'
              }`}
            >
              {/* Notice pill if fallback or Gemini notice */}
              {m.notice && (
                <div className="mb-2.5 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  {m.notice}
                </div>
              )}

              {/* Message text with basic markdown formatting */}
              <div className="space-y-1.5 whitespace-pre-wrap font-sans">
                {m.content}
              </div>

              {/* Tool Execution Trace Accordion */}
              {m.toolsExecuted && m.toolsExecuted.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div
                    onClick={() => toggleToolView(idx)}
                    className="flex items-center justify-between cursor-pointer py-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      Executed {m.toolsExecuted.length} Operational Tool{m.toolsExecuted.length > 1 ? 's' : ''} against Hyderabad Database
                    </span>
                    {openToolIndex === idx ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </div>

                  {openToolIndex === idx && (
                    <div className="mt-2 space-y-2">
                      {m.toolsExecuted.map((t, tIdx) => (
                        <div key={tIdx} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono">
                          <div className="flex items-center justify-between text-indigo-300 font-bold mb-1">
                            <span>🛠️ {t.tool_name}()</span>
                            <span className="text-[10px] text-emerald-400">STATUS: OK</span>
                          </div>
                          <div className="text-slate-400 text-[10px] mb-1">
                            Args: {JSON.stringify(t.arguments)}
                          </div>
                          <pre className="max-h-36 overflow-y-auto bg-black/40 p-2 rounded text-[10px] text-slate-300 border border-slate-900">
                            {JSON.stringify(t.result, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>Analyzing Hyderabad telemetry and executing operational database tools...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      <div className="px-5 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 shrink-0">
          <HelpCircle className="w-3 h-3" /> Prompts:
        </span>
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-300 text-[11px] whitespace-nowrap transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-800 bg-[#0c1222] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about Hyderabad delays, bus bunching, Ameerpet demand, or dispatch actions..."
            disabled={loading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

