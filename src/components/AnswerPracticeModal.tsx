import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  Send,
  Brain,
  MessageSquare,
} from 'lucide-react';
import { InterviewQuestion, AnswerEvaluation } from '../types';

interface AnswerPracticeModalProps {
  question: InterviewQuestion;
  interviewerTitle: string;
  targetRole: string;
  onClose: () => void;
}

export const AnswerPracticeModal: React.FC<AnswerPracticeModalProps> = ({
  question,
  interviewerTitle,
  targetRole,
  onClose,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) {
      setError('Lütfen önce bu soruya vereceğiniz cevabı yazın.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/interview/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewerTitle,
          targetRole,
          question: question.question,
          category: question.category,
          userAnswer,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Cevap değerlendirilemedi.');
      }
      setEvaluation(data);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseModelAnswerAsTemplate = () => {
    setUserAnswer(question.modelAnswer);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Cevabını Test Et & Mülakatçı Gözüyle Puanla
              </h3>
              <p className="text-xs text-slate-400">
                Değerlendiren Unvan:{' '}
                <span className="text-indigo-300 font-semibold">{interviewerTitle}</span> |
                Pozisyon: <span className="text-slate-300 font-semibold">{targetRole}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Question Box */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 mb-1.5">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                {question.category}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Önerilen Metot: {question.recommendedFramework}</span>
            </div>
            <p className="text-base font-bold text-white mb-2">{question.question}</p>
            <p className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <strong className="text-indigo-300">Bu Mülakatçının Niyeti:</strong>{' '}
              {question.interviewerIntent}
            </p>
          </div>

          {/* User Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Senin Vereceğin Cevap:</span>
              </label>
              <button
                type="button"
                onClick={handleUseModelAnswerAsTemplate}
                className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Örnek Taslağı Yükle & Düzenle</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Örn: Bu duruma STAR metodolojisiyle yaklaştım. Geçtiğimiz projede sistemimizde yüksek gecikme süresi yaşanıyordu (Situation)... Görevim mimariyi optimize etmekti (Task)... Şunları uyguladım (Action)... Sonuç olarak %42 performans artışı sağladık (Result)..."
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />

            {error && (
              <p className="text-xs text-rose-400 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}

            <div className="flex justify-end pt-1">
              <button
                onClick={handleEvaluate}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mülakatçı Gözüyle İnceleniyor...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Cevabımı Değerlendir</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Evaluation Results */}
          {evaluation && (
            <div className="space-y-5 pt-4 border-t border-slate-800 animate-fadeIn">
              {/* Score Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 gap-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg ${
                      evaluation.score >= 85
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : evaluation.score >= 65
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {evaluation.score}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Koç Puanı / 100
                    </span>
                    <h4 className="text-base font-bold text-white">{evaluation.verdict}</h4>
                  </div>
                </div>

                <div className="text-xs text-slate-400 sm:text-right max-w-xs">
                  <span className="text-indigo-400 font-semibold">{interviewerTitle}</span> gözüyle
                  yapılan titiz analiz.
                </div>
              </div>

              {/* Interviewer Reaction Box */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs sm:text-sm">
                <div className="flex items-center space-x-2 text-indigo-300 font-semibold mb-1">
                  <Brain className="w-4 h-4" />
                  <span>Mülakatçının Kafasından Geçen Gerçek Düşünce:</span>
                </div>
                <p className="text-indigo-100 italic leading-relaxed">
                  "{evaluation.interviewerPerspective}"
                </p>
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30">
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Güçlü Yönler</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-emerald-200">
                    {evaluation.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/30">
                  <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Geliştirilmesi Gerekenler</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-rose-200">
                    {evaluation.weaknesses.map((w, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Coaching Tips */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/30">
                <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Lightbulb className="w-4 h-4" />
                  <span>Cevabı 10/10 Yapacak Koç Taktikleri</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-amber-100">
                  {evaluation.coachingTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-amber-400 font-bold">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Polished Exemplar Answer */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Cevabınızın Profesyonelce Yeniden Yazılmış Hali (Exemplar)</span>
                  </h5>
                  <button
                    onClick={() => copyToClipboard(evaluation.polishedAnswer)}
                    className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/90 p-3 rounded-lg border border-slate-800 whitespace-pre-line">
                  {evaluation.polishedAnswer}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
