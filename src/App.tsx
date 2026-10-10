import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InterviewerQuestionGenerator } from './components/InterviewerQuestionGenerator';
import { CareerRoadmapPlanner } from './components/CareerRoadmapPlanner';
import { LiveMockSimulator } from './components/LiveMockSimulator';
import { QuestionGenerationResult, CareerRoadmapResult } from './types';
import { PRESETS, Preset } from './data/presets';
import { Sparkles, Shield, Compass, BookOpen, UserCheck, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'questions' | 'career' | 'live-mock'>('questions');

  // Interview Questions State
  const [interviewerTitle, setInterviewerTitle] = useState('VP of Engineering');
  const [targetRole, setTargetRole] = useState('Lead Software Engineer');
  const [companyContext, setCompanyContext] = useState('B2B SaaS Scale-up (Mikroservis, Kubernetes, 50+ Mühendis)');
  const [experienceLevel, setExperienceLevel] = useState('Senior (5+ Yıl)');
  const [jobDescription, setJobDescription] = useState(
    'Dağıtık sistemlerin mimarisini yönetecek, 6 kişilik cross-functional ekibe teknik mentorluk yapacak Lead aranıyor.'
  );
  const [questionResult, setQuestionResult] = useState<QuestionGenerationResult | null>(null);

  // Career Roadmap State
  const [participations, setParticipations] = useState(
    `1. Kodluyoruz & Patika İleri Seviye React & TypeScript Bootcamp (60 saat) - Katılım & Bitirme Projesi
2. Udemy: Maximilian Schwarzmüller - Clean Code & Microservices Architecture with Node & Docker (24 saat)
3. AWS Cloud Practitioner Essentials Webinar ve AWS Summit İstanbul 2024 Katılımı
4. Agile Turkey Summit: Scrum Master & Kanban Takım Yönetimi 2 Günlük Atölyesi
5. Şirket İçi "Junior Mentorluk & Kod İnceleme Kültürü" Çalışma Grubu kolaylaştırıcı rolü
6. O'Reilly "Designing Data-Intensive Applications" Kitap Kulübü (Bölüm 1-6 okundu)`
  );
  const [currentRole, setCurrentRole] = useState('Senior Frontend Developer (5 yıl deneyim)');
  const [targetNextRole, setTargetNextRole] = useState('Engineering Manager & Tech Lead');
  const [industry, setIndustry] = useState('Bulut Bilişim ve SaaS');
  const [currentStrengths, setCurrentStrengths] = useState(
    'Modern web mimarileri, React/Node ekosistemi, takım içi iletişim, kod inceleme disiplini.'
  );
  const [careerResult, setCareerResult] = useState<CareerRoadmapResult | null>(null);

  // Preset Selection Handler
  const handleSelectPreset = (preset: Preset) => {
    // Fill interview questions
    setInterviewerTitle(preset.interviewerTitle);
    setTargetRole(preset.targetRole);
    setCompanyContext(preset.companyContext);
    setExperienceLevel(preset.experienceLevel);
    setJobDescription(preset.jobDescription);

    // Fill career roadmap
    setCurrentRole(preset.currentRole);
    setTargetNextRole(preset.targetNextRole);
    setIndustry(preset.industry);
    setParticipations(preset.participations);
    setCurrentStrengths(preset.currentStrengths);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectPreset={handleSelectPreset}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'questions' && (
          <InterviewerQuestionGenerator
            interviewerTitle={interviewerTitle}
            setInterviewerTitle={setInterviewerTitle}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            companyContext={companyContext}
            setCompanyContext={setCompanyContext}
            experienceLevel={experienceLevel}
            setExperienceLevel={setExperienceLevel}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            result={questionResult}
            setResult={setQuestionResult}
          />
        )}

        {activeTab === 'career' && (
          <CareerRoadmapPlanner
            participations={participations}
            setParticipations={setParticipations}
            currentRole={currentRole}
            setCurrentRole={setCurrentRole}
            targetNextRole={targetNextRole}
            setTargetNextRole={setTargetNextRole}
            industry={industry}
            setIndustry={setIndustry}
            currentStrengths={currentStrengths}
            setCurrentStrengths={setCurrentStrengths}
            result={careerResult}
            setResult={setCareerResult}
          />
        )}

        {activeTab === 'live-mock' && (
          <LiveMockSimulator
            interviewerTitle={interviewerTitle}
            targetRole={targetRole}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-400">
              Kariyer & Mülakat Koçu (Career & Interview AI Coach)
            </span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <span>Mülakatçı Unvanına Özel Sorular</span>
            <span>•</span>
            <span>Katılım Yetkinlik Denetimi</span>
            <span>•</span>
            <span>90 Günlük Eğitim Yol Haritası</span>
          </div>

          <p className="text-slate-600">
            STAR & CAR Metodolojisi Destekli Yapay Zeka Kariyer Mimarisi
          </p>
        </div>
      </footer>
    </div>
  );
}
