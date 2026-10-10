import React, { useState } from 'react';
import {
  Briefcase,
  UserCheck,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Brain,
  ShieldAlert,
  Target,
  Copy,
  Check,
  MessageSquare,
  FileText,
  Sliders,
} from 'lucide-react';
import {
  InterviewQuestion,
  InterviewerProfile,
  QuestionGenerationResult,
} from '../types';
import { AnswerPracticeModal } from './AnswerPracticeModal';

interface Props {
  interviewerTitle: string;
  setInterviewerTitle: (v: string) => void;
  targetRole: string;
  setTargetRole: (v: string) => void;
  companyContext: string;
  setCompanyContext: (v: string) => void;
  experienceLevel: string;
  setExperienceLevel: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  result: QuestionGenerationResult | null;
  setResult: (res: QuestionGenerationResult | null) => void;
}

const COMMON_TITLES = [
  'VP of Engineering',
  'HR Director / İK Direktörü',
  'Engineering Manager',
  'CTO (Chief Technology Officer)',
  'CPO / Head of Product',
  'Senior Tech Lead / Yazılım Mimarı',
  'Founder / CEO',
  'Peer Senior Engineer (Ekip Arkadaşı)',
  'Scrum Master / Agile Koç',
];

const LOADING_TIPS = [
  'Mülakatçının unvanı, aradığı en kritik yetkinliği ve en çok korktuğu riski belirler...',
  'Bir VP genellikle mimari ve organizasyonel olgunluğa bakarken, HR kültürel ve davranışsal uyumu sorgular...',
  'Soruların arkasındaki gizli niyet analiz ediliyor ve STAR çerçeveleri hazırlanıyor...',
  'Örnek cevaplar ve kaçınılması gereken kırmızı bayraklar derleniyor...',
];

export const InterviewerQuestionGenerator: React.FC<Props> = ({
  interviewerTitle,
  setInterviewerTitle,
  targetRole,
  setTargetRole,
  companyContext,
  setCompanyContext,
  experienceLevel,
  setExperienceLevel,
  jobDescription,
  setJobDescription,
  result,
  setResult,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});
  const [practiceQuestion, setPracticeQuestion] = useState<InterviewQuestion | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!interviewerTitle.trim() || !targetRole.trim()) {
      setError('Lütfen mülakatçı unvanı ve hedeflenen pozisyon alanlarını doldurun.');
      return;
    }

    setError(null);
    setLoading(true);

    const interval = setInterval(() => {
      setLoadingTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 2800);

    try {
      const res = await fetch('/api/interview/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewerTitle,
          targetRole,
          companyContext,
          experienceLevel,
          jobDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Soru üretimi başarısız oldu.');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Bir hata meydana geldi.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const toggleAnswerExpand = (id: string) => {
    setExpandedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = ['Tümü', ...(result ? Array.from(new Set(result.questions.map((q) => q.category))) : [])];

  const filteredQuestions = result
    ? result.questions.filter((q) => {
        const matchesCat = selectedCategory === 'Tümü' || q.category === selectedCategory;
        const matchesSearch =
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.interviewerIntent.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCat && matchesSearch;
      })
    : [];

  const handleCopyAllQuestions = () => {
    if (!result) return;
    const text = `# ${result.interviewerProfile.title} Mülakat Soruları & Hazırlık Rehberi
Pozisyon: ${targetRole}
Şirket/Bağlam: ${companyContext}

## Mülakatçı Psikolojisi ve Yaklaşımı
${result.interviewerProfile.mindsetSummary}

### En Önemli Öncelikleri:
${result.interviewerProfile.primaryPriorities.map((p) => `- ${p}`).join('\n')}

### Kırmızı Bayraklar (Kaçınılması Gerekenler):
${result.interviewerProfile.biggestRedFlags.map((r) => `- ${r}`).join('\n')}

---

## Sorular ve Çözüm Stratejileri
${result.questions
  .map(
    (q, i) => `### ${i + 1}. [${q.category}] ${q.question}
- Neden Soruyor?: ${q.interviewerIntent}
- Önerilen Metot: ${q.recommendedFramework}
- Kilit Noktalar: ${q.keyPointsToMention.join(', ')}
- Kaçınılacaklar: ${q.pitfallsToAvoid.join(', ')}
- Örnek Model Cevap: ${q.modelAnswer}
`
  )
  .join('\n\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-900/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Mülakatçı Unvanına Özel Psikolojik Hazırlık Motoru</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Mülakatçının Unvanını Verin, Potansiyel Soruları ve Gizli Beklentilerini Keşfedin
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Mülakatta karşınızdaki kişinin unvanı (HR, Tech Lead, VP, CPO, CEO), soracağı soruların
            türünü ve eleme kriterlerini baştan belirler. Unvanı yazın; yapay zeka mülakatçının
            bakış açısını, potansiyel tuzak sorularını ve kazanma stratejisini çıkarsın.
          </p>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interviewer Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <span>Mülakata Katılacak Kişinin Unvanı (Title) *</span>
                </span>
                <span className="text-xs text-indigo-400 font-normal">Kritik Parametre</span>
              </label>
              <input
                type="text"
                value={interviewerTitle}
                onChange={(e) => setInterviewerTitle(e.target.value)}
                placeholder="Örn: VP of Engineering, HR Director, Senior Tech Lead, CTO..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                required
              />

              {/* Quick suggestions pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_TITLES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setInterviewerTitle(t)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-slate-700/60 transition-all"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Role */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>Hedeflediğiniz Pozisyon / Rol *</span>
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Örn: Senior Frontend Developer, Tech Lead, Product Manager, Data Scientist..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                required
              />

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Deneyim Seviyesi</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Junior (0-2 Yıl)">Junior (0-2 Yıl)</option>
                    <option value="Mid-Level (2-5 Yıl)">Mid-Level (2-5 Yıl)</option>
                    <option value="Senior (5+ Yıl)">Senior (5+ Yıl)</option>
                    <option value="Lead / Principal / Müdür">Lead / Principal / Müdür</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Şirket Türü / Bağlam</label>
                  <input
                    type="text"
                    value={companyContext}
                    onChange={(e) => setCompanyContext(e.target.value)}
                    placeholder="Örn: B2B SaaS, FinTech, E-ticaret..."
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Optional Job Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>İlan Açıklaması veya Özel Odak (Opsiyonel)</span>
              </label>
              <span className="text-xs text-slate-500">Mülakatı daha da özelleştirmek için ekleyin</span>
            </div>
            <textarea
              rows={2}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Varsa ilandaki gereksinimleri veya mülakatta öne çıkarmak istediğiniz detayları buraya yapıştırabilirsiniz..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs sm:text-sm text-rose-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sorular ve Mülakatçı Analizi Üretiliyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Bu Unvan İçin Soruları & Stratejiyi Üret</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading Banner */}
        {loading && (
          <div className="mt-6 p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-center animate-pulse">
            <p className="text-xs sm:text-sm text-indigo-200 font-medium flex items-center justify-center space-x-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>{LOADING_TIPS[loadingTipIndex]}</span>
            </p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-8 animate-fadeIn">
          {/* Interviewer Psychological Profile Card */}
          <div className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                    Mülakatçı Zihin Haritası
                  </span>
                  <h3 className="text-xl font-extrabold text-white">
                    {result.interviewerProfile.title} Nasıl Düşünür?
                  </h3>
                </div>
              </div>

              <button
                onClick={handleCopyAllQuestions}
                className="self-start md:self-auto flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tümü Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Tüm Soruları & Stratejiyi Kopyala (Markdown)</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <strong className="text-white">Genel Zihniyet & Bakış Açısı:</strong>{' '}
              {result.interviewerProfile.mindsetSummary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Primary Priorities */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                  <Target className="w-4 h-4" />
                  <span>En Kritik Öncelikleri</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.interviewerProfile.primaryPriorities.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Biggest Red Flags */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Kritik Kırmızı Bayraklar</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.interviewerProfile.biggestRedFlags.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Winning Impression */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                  <Lightbulb className="w-4 h-4" />
                  <span>Onu En Çok Etkileyecek Aday</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.interviewerProfile.winningImpression}
                </p>
              </div>
            </div>
          </div>

          {/* Question Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                <span>Kategori:</span>
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Sorularda ara..."
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Questions Grid / List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Özel Soru Havuzu</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {filteredQuestions.length} Soru
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Her sorunun altında örnek cevabı ve tuzakları inceleyebilirsiniz.
              </p>
            </div>

            {filteredQuestions.map((q, index) => {
              const isExpanded = !!expandedAnswers[q.id];

              return (
                <div
                  key={q.id || index}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg transition-all hover:border-indigo-800/60 space-y-4"
                >
                  {/* Top Badges & Difficulty */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                        {q.category}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        Zorluk: {q.difficulty}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400 font-medium">
                      Çerçeve: <strong className="text-slate-200">{q.recommendedFramework}</strong>
                    </span>
                  </div>

                  {/* Question Text */}
                  <div className="flex items-start space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                        {q.question}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <strong className="text-indigo-400">Mülakatçının Gizli Niyeti:</strong>{' '}
                        {q.interviewerIntent}
                      </p>
                    </div>
                  </div>

                  {/* Key Points vs Pitfalls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30">
                      <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Cevapta Mutlaka Olması Gerekenler</span>
                      </h5>
                      <ul className="space-y-1 text-xs text-emerald-200">
                        {q.keyPointsToMention.map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start space-x-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/30">
                      <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Kaçınılması Gereken Hatalar & Tuzaklar</span>
                      </h5>
                      <ul className="space-y-1 text-xs text-rose-200">
                        {q.pitfallsToAvoid.map((pf, pfIdx) => (
                          <li key={pfIdx} className="flex items-start space-x-1.5">
                            <span className="text-rose-400 font-bold">•</span>
                            <span>{pf}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Model Answer Toggle & Test Button */}
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => toggleAnswerExpand(q.id)}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 py-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          <span>Örnek Model Cevabı Gizle</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span>Örnek Model Cevabı Gör</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPracticeQuestion(q)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Bu Soruyu Cevapla & Puan Al</span>
                    </button>
                  </div>

                  {/* Expanded Model Answer */}
                  {isExpanded && (
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-200 animate-fadeIn">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Örnek Güçlü Cevap Taslağı</span>
                      </div>
                      <p className="leading-relaxed text-slate-300 whitespace-pre-line">
                        {q.modelAnswer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Answer Practice Modal */}
      {practiceQuestion && (
        <AnswerPracticeModal
          question={practiceQuestion}
          interviewerTitle={interviewerTitle}
          targetRole={targetRole}
          onClose={() => setPracticeQuestion(null)}
        />
      )}
    </div>
  );
};
