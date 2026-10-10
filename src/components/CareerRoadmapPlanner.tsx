import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Target,
  Clock,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Brain,
  Copy,
  Check,
  Briefcase,
  FileText,
  Calendar,
  Compass,
} from 'lucide-react';
import { CareerRoadmapResult } from '../types';

interface Props {
  participations: string;
  setParticipations: (v: string) => void;
  currentRole: string;
  setCurrentRole: (v: string) => void;
  targetNextRole: string;
  setTargetNextRole: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  currentStrengths: string;
  setCurrentStrengths: (v: string) => void;
  result: CareerRoadmapResult | null;
  setResult: (res: CareerRoadmapResult | null) => void;
}

const SAMPLE_PARTICIPATION_SNIPPET = `1. Patika.dev & Kodluyoruz İleri Seviye React & Node.js Bootcamp (75 saat)
- React Hooks, Redux Toolkit, REST API tasarımı ve Express.js uygulamaları
2. Udemy: Stephen Grider - Microservices with Node and React (30 saat)
- Docker, Kubernetes temelleri, NATS streaming ve event-driven mimariler
3. AWS Cloud Practitioner Webinarı & Temel Bulut Hizmetleri (12 saat)
4. Şirket içi Agile & Scrum Eğitimi (2 Günlük Atölye)`;

const LOADING_TIPS = [
  'Geçmiş eğitim ve katılımlarınızdan edindiğiniz yetkinlikler filtreleniyor...',
  'Hedeflediğiniz pozisyonun piyasa beklentileri ve eleme eşikleri taranıyor...',
  'Katılımlarınızın derinlik analizi yapılıyor (teorik vs pratik uygulama)...',
  'En prestijli sertifikalar, kitaplar ve bitirme projeleri ile 90 günlük yol haritası çiziliyor...',
];

export const CareerRoadmapPlanner: React.FC<Props> = ({
  participations,
  setParticipations,
  currentRole,
  setCurrentRole,
  targetNextRole,
  setTargetNextRole,
  industry,
  setIndustry,
  currentStrengths,
  setCurrentStrengths,
  result,
  setResult,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [learningStylePreference, setLearningStylePreference] = useState(
    'Kapsamlı (Online Kurs + Resmi Sertifika + Bitirme Projesi)'
  );

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!participations.trim()) {
      setError('Lütfen katıldığınız eğitim, sertifika ve içerik detaylarını yazın.');
      return;
    }

    setError(null);
    setLoading(true);

    const interval = setInterval(() => {
      setLoadingTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 2800);

    try {
      const res = await fetch('/api/career/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participations,
          currentRole,
          targetNextRole,
          industry,
          currentStrengths,
          learningStylePreference,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Yol haritası analizi başarısız oldu.');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Analiz sırasında bir hata meydana geldi.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const copyRoadmap = () => {
    if (!result) return;
    const text = `# Kariyer & Sonraki Adım Eğitim Yol Haritası
Mevcut: ${currentRole} ➔ Hedef: ${targetNextRole}
Sektör: ${industry}

## Yönetici Özeti
${result.executiveSummary}

## 1. Geçmiş Katılımların Yetkinlik Denetimi
${result.currentCapabilitiesAudit
  .map(
    (a) => `### ${a.participationItem} (${a.masteryLevel})
- Kazanılan Yetkinlikler: ${a.validatedSkills.join(', ')}
- Değerlendirme: ${a.assessment}`
  )
  .join('\n\n')}

## 2. Hedef Rol İçin Kritik Yetkinlik Açıkları
${result.competencyGaps
  .map(
    (g) => `### [${g.severity}] ${g.gapName}
- Neden Kritik?: ${g.whyItMatters}
- Nasıl Kapatılmalı?: ${g.howToBridge}`
  )
  .join('\n\n')}

## 3. Alınması Gereken Öncelikli Eğitimler & Sertifikalar
${result.recommendedTrainings
  .map(
    (t) => `### [${t.priority}] ${t.title} (${t.type} - ${t.providerOrSource})
- Süre: ${t.estimatedDuration}
- Kilit Konular: ${t.focusTopics.join(', ')}
- Sağlayacağı Katkı: ${t.expectedOutcome}`
  )
  .join('\n\n')}

## 4. Tavsiye Edilen Portfolyo / Bitirme Projeleri
${result.capstoneProjects
  .map(
    (p) => `### ${p.projectName}
- Kapsam: ${p.description}
- Kanıtlanan Yetkinlikler: ${p.provenSkills.join(', ')}`
  )
  .join('\n\n')}

## 5. 90 Günlük Eylem Planı
### ${result.roadmap90Days.phase1.title}
- Hedef: ${result.roadmap90Days.phase1.milestone}
${result.roadmap90Days.phase1.actions.map((a) => `- ${a}`).join('\n')}

### ${result.roadmap90Days.phase2.title}
- Hedef: ${result.roadmap90Days.phase2.milestone}
${result.roadmap90Days.phase2.actions.map((a) => `- ${a}`).join('\n')}

### ${result.roadmap90Days.phase3.title}
- Hedef: ${result.roadmap90Days.phase3.milestone}
${result.roadmap90Days.phase3.actions.map((a) => `- ${a}`).join('\n')}

## 6. Mülakat ve Terfi Stratejisi
${result.interviewAndPositioningStrategy.howToPitchPastTrainings}
- Önemli İfadeler: ${result.interviewAndPositioningStrategy.keyPhrasesToUse.join(' | ')}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 border border-emerald-900/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Kariyer Yetkinlik Denetimi & Sonraki Adım Eğitim Rehberi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Katıldığınız Eğitimlerin İçeriklerini Verin, Bir Sonraki Seviye İçin Ne Öğrenmeniz
            Gerektiğini Söyleyelim
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Katıldığınız bootcamp'ler, kurslar, atölyeler ve sertifikalar size belli bir temel kazandırdı.
            Peki bir sonraki hedef pozisyona geçebilmek için hangi derinlikler eksik?
            Somut sertifika, kitap, proje ve 90 günlük gelişim yol haritanızı hemen oluşturun.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleAnalyze} className="space-y-6">
          {/* Participations Input Area */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Katıldığınız Eğitimlerin / Kursların / Etkinliklerin İçerikleri *</span>
              </label>
              <button
                type="button"
                onClick={() => setParticipations(SAMPLE_PARTICIPATION_SNIPPET)}
                className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Örnek Katılım Listesi Yükle</span>
              </button>
            </div>
            <textarea
              rows={6}
              value={participations}
              onChange={(e) => setParticipations(e.target.value)}
              placeholder="Örn: 
1. Kodluyoruz React Bootcamp (60 saat) - Hooks, Context API, Redux Toolkit
2. Udemy: Maximilian Schwarzmüller Clean Architecture (18 saat)
3. AWS Cloud Practitioner Webinarı (Temel bulut servisleri)
4. Şirket içi Agile / Scrum 2 Günlük Atölye Çalışması..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              required
            />
            <p className="text-xs text-slate-500">
              İpucu: Kursların konularını, katıldığınız seminerleri veya şirket içi atölyeleri madde
              madde yazabilirsiniz.
            </p>
          </div>

          {/* Current Role & Target Role Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Şu Anki Rolünüz / Mevcut Durumunuz</span>
              </label>
              <input
                type="text"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                placeholder="Örn: Senior Frontend Developer, Mid Veri Analisti, İşe Alım Uzmanı..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Hedeflediğiniz Bir Sonraki Adım / Rol *</span>
              </label>
              <input
                type="text"
                value={targetNextRole}
                onChange={(e) => setTargetNextRole(e.target.value)}
                placeholder="Örn: Tech Lead / Yazılım Mimarı, Senior Data Scientist, Group Product Manager..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Industry & Learning Preference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Sektör / Çalışma Alanı</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Örn: FinTech, B2B SaaS, E-Ticaret, Sağlık Teknolojisi..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Tercih Edilen Eğitim Modeli</label>
              <select
                value={learningStylePreference}
                onChange={(e) => setLearningStylePreference(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Kapsamlı (Online Kurs + Resmi Sertifika + Bitirme Projesi)">
                  Kapsamlı (Online Kurs + Resmi Sertifika + Bitirme Projesi)
                </option>
                <option value="Uluslararası Resmi Sertifikasyon Odaklı (AWS, Scrum.org vb.)">
                  Uluslararası Resmi Sertifikasyon Odaklı (AWS, Scrum.org vb.)
                </option>
                <option value="Hands-on / Portfolyo ve Capstone Proje Ağırlıklı">
                  Hands-on / Portfolyo ve Capstone Proje Ağırlıklı
                </option>
                <option value="İleri Teori, Mimari & O'Reilly Kitapları Odaklı">
                  İleri Teori, Mimari & O'Reilly Kitapları Odaklı
                </option>
              </select>
            </div>
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
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-xl shadow-emerald-600/30 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Katılımlar Analiz Ediliyor & Yol Haritası Çıkarılıyor...</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  <span>Katılımları Analiz Et & Sonraki Adım Eğitimlerini Belirle</span>
                </>
              )}
            </button>
          </div>
        </form>

        {loading && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-center animate-pulse">
            <p className="text-xs sm:text-sm text-emerald-200 font-medium flex items-center justify-center space-x-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>{LOADING_TIPS[loadingTipIndex]}</span>
            </p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-8 animate-fadeIn">
          {/* Executive Summary Card */}
          <div className="bg-slate-900 border border-emerald-900/50 rounded-2xl p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                    Baş Koç Değerlendirmesi
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    {targetNextRole} İçin Kariyer Yol Haritası Özeti
                  </h3>
                </div>
              </div>

              <button
                onClick={copyRoadmap}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Rapor Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Yol Haritasını Kopyala (Markdown)</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              {result.executiveSummary}
            </p>
          </div>

          {/* 1. Audit of Past Participations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Geçmiş Katılımlarınızın Yetkinlik Denetimi
                </h3>
                <p className="text-xs text-slate-400">
                  Verdiğiniz içeriklerden hangi somut yetkinlikler doğrulandı, derinlik nerede duruyor?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.currentCapabilitiesAudit.map((audit, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      {audit.participationItem}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                      {audit.masteryLevel}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Kazanılan Yetkinlikler:</span>
                    <div className="flex flex-wrap gap-1">
                      {audit.validatedSkills.map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-800/80">
                    <strong className="text-slate-300 not-italic">Değerlendirme:</strong>{' '}
                    {audit.assessment}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Competency Gaps for Next Role */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {targetNextRole} İçin Kritik Yetkinlik Boşlukları (Gaps)
                </h3>
                <p className="text-xs text-slate-400">
                  Geçmiş eğitimlerin kapsamadığı, mülakatta veya terfi kurulunda elenme riski yaratan eksikler
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.competencyGaps.map((gap, gIdx) => (
                <div
                  key={gIdx}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>{gap.gapName}</span>
                    </h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        gap.severity.includes('Kritik')
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {gap.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-rose-300">Neden Kritik?:</strong> {gap.whyItMatters}
                  </p>

                  <p className="text-xs text-emerald-300 leading-relaxed bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/30">
                    <strong className="text-emerald-400">Kapatma Yolu:</strong> {gap.howToBridge}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Recommended Education & Certifications */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Almanız Gereken Öncelikli Eğitimler & Sertifikalar
                </h3>
                <p className="text-xs text-slate-400">
                  Boşlukları kapatacak en prestijli resmi sertifikasyonlar, kurslar ve kaynaklar
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {result.recommendedTrainings.map((train, tIdx) => (
                <div
                  key={tIdx}
                  className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-emerald-700/60 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          {train.priority}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {train.type} • {train.providerOrSource}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white mt-1">
                        {train.title}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tahmini Süre: {train.estimatedDuration}</span>
                    </div>
                  </div>

                  {/* Focus Topics */}
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                      Kapsanan Kritik Konular:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {train.focusTopics.map((topic, topIdx) => (
                        <span
                          key={topIdx}
                          className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expected Outcome */}
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-xs text-emerald-200 flex items-start space-x-2">
                    <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-300">CV & Mülakatta Sağlayacağı Kanıt:</strong>{' '}
                      {train.expectedOutcome}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Capstone Portfolio Projects */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Tavsiye Edilen Bitirme & Portfolyo Projeleri (Proof of Work)
                </h3>
                <p className="text-xs text-slate-400">
                  Sadece sertifika yetmez; işe alım yöneticilerine doğrudan gösterebileceğiniz somut projeler
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.capstoneProjects.map((proj, pIdx) => (
                <div
                  key={pIdx}
                  className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5"
                >
                  <h4 className="text-base font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{proj.projectName}</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Kanıtlanan Beceriler:</span>
                    <div className="flex flex-wrap gap-1">
                      {proj.provenSkills.map((ps, psIdx) => (
                        <span
                          key={psIdx}
                          className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700"
                        >
                          {ps}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. 90-Day Action Roadmap */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
                5
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  90 Günlük Adım Adım Eylem Planı (0 - 30 - 60 - 90 Gün)
                </h3>
                <p className="text-xs text-slate-400">
                  Haftalık disiplinle tamamlayacağınız üç aşamalı büyüme takvimi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Phase 1 */}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 relative overflow-hidden">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Aşama 1</span>
                </div>
                <h4 className="text-sm font-bold text-white">{result.roadmap90Days.phase1.title}</h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.roadmap90Days.phase1.actions.map((act, aIdx) => (
                    <li key={aIdx} className="flex items-start space-x-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-slate-800/80 text-xs text-indigo-300 font-semibold">
                  🎯 Hedef Çıktı: {result.roadmap90Days.phase1.milestone}
                </div>
              </div>

              {/* Phase 2 */}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 relative overflow-hidden">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Aşama 2</span>
                </div>
                <h4 className="text-sm font-bold text-white">{result.roadmap90Days.phase2.title}</h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.roadmap90Days.phase2.actions.map((act, aIdx) => (
                    <li key={aIdx} className="flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-slate-800/80 text-xs text-emerald-300 font-semibold">
                  🎯 Hedef Çıktı: {result.roadmap90Days.phase2.milestone}
                </div>
              </div>

              {/* Phase 3 */}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 relative overflow-hidden">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Aşama 3</span>
                </div>
                <h4 className="text-sm font-bold text-white">{result.roadmap90Days.phase3.title}</h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.roadmap90Days.phase3.actions.map((act, aIdx) => (
                    <li key={aIdx} className="flex items-start space-x-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-slate-800/80 text-xs text-amber-300 font-semibold">
                  🎯 Hedef Çıktı: {result.roadmap90Days.phase3.milestone}
                </div>
              </div>
            </div>
          </div>

          {/* 6. Interview & Promotion Positioning Strategy */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-sm">
                6
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Mülakat ve Terfi Hikayeleştirme Stratejisi
                </h3>
                <p className="text-xs text-slate-400">
                  Geçmiş eğitimlerinizi ve bu yeni yetkinlikleri mülakatta nasıl sunacaksınız?
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-950/70 p-5 rounded-xl border border-slate-800">
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                <strong className="text-purple-300">Hikayeleştirme (Pitch):</strong>{' '}
                {result.interviewAndPositioningStrategy.howToPitchPastTrainings}
              </p>

              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Mülakatta Kullanabileceğiniz Altın Kalıplar:
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.interviewAndPositioningStrategy.keyPhrasesToUse.map((phrase, phIdx) => (
                    <span
                      key={phIdx}
                      className="text-xs px-3 py-1.5 rounded-lg bg-purple-950/30 text-purple-200 border border-purple-800/40 italic"
                    >
                      "{phrase}"
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs text-emerald-300 font-medium">
                💎 <strong>Maaş & Seviye (Leveling) Kozu:</strong>{' '}
                {result.interviewAndPositioningStrategy.salaryAndLevelingAdvantage}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
