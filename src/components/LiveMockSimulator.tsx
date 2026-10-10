import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  UserCheck,
  Brain,
  Sparkles,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Lightbulb,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { MockChatMessage } from '../types';

interface Props {
  interviewerTitle: string;
  targetRole: string;
}

const TONES = [
  'Gerçekçi & Profesyonel',
  'Destekleyici & İpuçlu',
  'Zorlayıcı & Sorgulayıcı VP (Tough Mode)',
];

const SUGGESTED_STARTS = [
  'Merhaba, mülakat için hazırım. İlk sorunuz nedir?',
  'STAR metodunu kullanarak en zorlandığım teknik krizi anlatmak istiyorum.',
  'Mimari karar alma süreçlerine nasıl yaklaştığımı paylaşabilirim.',
  'Geçmiş eğitim ve projelerimden bahsetmek istiyorum.',
];

export const LiveMockSimulator: React.FC<Props> = ({
  interviewerTitle,
  targetRole,
}) => {
  const [messages, setMessages] = useState<MockChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Merhaba! Ben ${interviewerTitle || 'Mülakat Yöneticisi'}. ${
        targetRole || 'Pozisyon'
      } rolü için bir araya geldik. Hazırsanız başlayalım. Lütfen bana kendinizi ve bu role neden en uygun aday olduğunuzu kısaca özetleyin.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      coachWhisper:
        'İlk soruda asla tüm CV’nizi kronolojik olarak saymayın. 2 dakikalık "Elevator Pitch": Mevcut uzmanlığınız + en büyük 1-2 başarınız + bu şirkete katacağınız değer.',
      suggestedNextMove: 'Girişi yaparken şirketin problemine çözüm olacağınızı vurgulayın.',
      sentiment: 'Meraklı',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [personaTone, setPersonaTone] = useState('Gerçekçi & Profesyonel');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: MockChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/interview/chat-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewerTitle: interviewerTitle || 'Hiring Manager',
          targetRole: targetRole || 'Aday',
          personaTone,
          history: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userMessage: textToSend.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Simülasyon yanıt veremedi.');
      }

      const assistantMsg: MockChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.interviewerReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        coachWhisper: data.coachWhisper,
        suggestedNextMove: data.suggestedNextMove,
        sentiment: data.sentiment,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: MockChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Bağlantı sırasında bir aksaklık oldu. Lütfen tekrar deneyin.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Mülakat oturumunu yeniden başlattık. Ben ${
          interviewerTitle || 'Mülakat Yöneticisi'
        }. ${targetRole || 'pozisyon'} mülakatına hazır olduğunuzda başlayalım!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        coachWhisper: 'Rahat bir nefes alın. Cevaplarınızda somut metrikler ve rakamlar kullanmaya özen gösterin.',
        suggestedNextMove: 'Giriş konuşmanızı yapın.',
        sentiment: 'Meraklı',
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Canlı Mülakat Odası</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ● Aktif
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Mülakatçı: <strong className="text-indigo-300">{interviewerTitle || 'Unvan Belirtilmedi'}</strong>{' '}
              | Hedef: <strong className="text-slate-300">{targetRole || 'Rol Belirtilmedi'}</strong>
            </p>
          </div>
        </div>

        {/* Tone Selector & Reset */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <Sliders className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <select
              value={personaTone}
              onChange={(e) => setPersonaTone(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none pr-2 py-1"
            >
              {TONES.map((t) => (
                <option key={t} value={t} className="bg-slate-900 text-slate-100">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            title="Mülakatı Sıfırla"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[600px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
              >
                {/* Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-md ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-tr-none'
                      : 'bg-slate-800 border border-slate-700/80 text-slate-100 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs opacity-75 mb-1.5 gap-4">
                    <span className="font-bold flex items-center space-x-1">
                      {isUser ? <span>Sen (Aday)</span> : <span>{interviewerTitle || 'Mülakatçı'}</span>}
                      {!isUser && msg.sentiment && (
                        <span className="ml-2 text-2xs px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                          {msg.sentiment}
                        </span>
                      )}
                    </span>
                    <span className="text-2xs">{msg.timestamp}</span>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {msg.content}
                  </p>
                </div>

                {/* Secret Coach Whisper (Only for assistant turns) */}
                {!isUser && msg.coachWhisper && (
                  <div className="max-w-[85%] sm:max-w-[75%] p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 space-y-1 animate-fadeIn">
                    <div className="flex items-center space-x-1.5 font-bold text-amber-400">
                      <Brain className="w-3.5 h-3.5" />
                      <span>Gizli Koç İpucu (Arka Plan Analizi):</span>
                    </div>
                    <p className="leading-relaxed text-amber-100/90">{msg.coachWhisper}</p>
                    {msg.suggestedNextMove && (
                      <div className="pt-1 text-2xs text-amber-300 font-semibold flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Sıradaki Hamleniz: {msg.suggestedNextMove}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 p-3 rounded-xl bg-slate-800/50 w-fit">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span>{interviewerTitle || 'Mülakatçı'} cevabınızı dinliyor ve düşünüyor...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto">
          <span className="text-2xs uppercase tracking-wider text-slate-500 font-bold shrink-0">
            Hızlı Yanıt:
          </span>
          {SUGGESTED_STARTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-200 border border-slate-700/60 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Cevabınızı yazın (Enter ile gönder, Shift+Enter ile alt satır)..."
            className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none max-h-32"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
