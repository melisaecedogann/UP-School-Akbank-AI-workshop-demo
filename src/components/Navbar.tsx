import React from 'react';
import {
  Compass,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { PRESETS, Preset } from '../data/presets';

interface NavbarProps {
  activeTab: 'questions' | 'career' | 'live-mock';
  setActiveTab: (tab: 'questions' | 'career' | 'live-mock') => void;
  onSelectPreset: (preset: Preset) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSelectPreset,
}) => {
  const [isPresetOpen, setIsPresetOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  Kariyer & Mülakat Koçu
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  AI Coach
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Mülakatçı Unvanına Özel Sorular & Geçmiş Katılım Eğitim Rehberi
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'questions'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span className="hidden md:inline">Mülakatçı Soru Üretici</span>
              <span className="md:hidden">Sorular</span>
            </button>

            <button
              onClick={() => setActiveTab('career')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'career'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden md:inline">Katılım & Eğitim Rehberi</span>
              <span className="md:hidden">Eğitim Analizi</span>
            </button>

            <button
              onClick={() => setActiveTab('live-mock')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'live-mock'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline">Canlı Mülakat Simülatörü</span>
              <span className="md:hidden">Simülasyon</span>
            </button>
          </nav>

          {/* Preset scenarios dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPresetOpen(!isPresetOpen)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-all shadow-sm"
              title="Hazır örnek senaryoları yükleyin"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Örnek Senaryo</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isPresetOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Hazır Örnek Senaryo Seçin</span>
                </div>
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPreset(p);
                      setIsPresetOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-indigo-600/20 transition-colors flex flex-col space-y-0.5 border-b border-slate-800/40 last:border-0"
                  >
                    <span className="font-semibold text-slate-100">{p.label}</span>
                    <span className="text-xs text-indigo-400 truncate">
                      Mülakatçı: {p.interviewerTitle}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
