export interface Preset {
  id: string;
  label: string;
  interviewerTitle: string;
  targetRole: string;
  companyContext: string;
  experienceLevel: string;
  jobDescription: string;
  // Career training analysis preset data:
  currentRole: string;
  targetNextRole: string;
  industry: string;
  participations: string;
  currentStrengths: string;
}

export const PRESETS: Preset[] = [
  {
    id: 'tech-lead-vp',
    label: 'Yazılım Geliştirici ➔ Tech Lead (Mülakatçı: VP of Engineering)',
    interviewerTitle: 'VP of Engineering',
    targetRole: 'Lead Software Engineer / Tech Lead',
    companyContext: 'Hızlı büyüyen B2B SaaS Scale-up (Mikroservis, Kubernetes, 50+ mühendis)',
    experienceLevel: 'Senior (5+ Yıl)',
    jobDescription: 'Dağıtık sistemlerin mimarisini yönlendirecek, 6 kişilik cross-functional ekibe teknik mentorluk yapacak, ürün yöneticileriyle mimari yol haritası çıkaracak Lead aranıyor.',
    currentRole: 'Senior Frontend / Fullstack Developer (5 yıl deneyim)',
    targetNextRole: 'Engineering Manager & Tech Lead',
    industry: 'Bulut Bilişim ve SaaS',
    participations: `1. Kodluyoruz & Patika İleri Seviye React & TypeScript Bootcamp (60 saat) - Katılım & Bitirme Projesi
2. Udemy: Maximilian Schwarzmüller - Clean Code & Microservices Architecture with Node & Docker (24 saat)
3. AWS Cloud Practitioner Essentials Webinar ve AWS Summit İstanbul 2024 Katılımı
4. Agile Turkey Summit: Scrum Master & Kanban Takım Yönetimi 2 Günlük Atölyesi
5. Şirket İçi "Junior Mentorluk & Kod İnceleme Kültürü" Çalışma Grubu kolaylaştırıcılığı
6. O'Reilly "Designing Data-Intensive Applications" Kitap Kulübü (Bölüm 1-6 okundu)`,
    currentStrengths: 'Modern web mimarileri, React/Node ekosistemi, takım içi iletişim, kod inceleme disiplini.',
  },
  {
    id: 'data-ai-head',
    label: 'Veri Analisti ➔ Data Scientist (Mülakatçı: Head of Analytics & AI)',
    interviewerTitle: 'Head of Data Science & AI',
    targetRole: 'Data Scientist / ML Engineer',
    companyContext: 'E-Ticaret ve Fintech Platformu (Milyonlarca günlük işlem, churn & recommendation modelleri)',
    experienceLevel: 'Mid-Level (2-3 Yıl)',
    jobDescription: 'Müşteri segmentasyonu, CLV tahmini ve makine öğrenmesi modellerini üretime (production) alabilecek, Python ve SQL uzmanı veri bilimci.',
    currentRole: 'Junior/Mid Data Analyst (SQL, Tableau, temel Python)',
    targetNextRole: 'Senior Data Scientist / AI Product Specialist',
    industry: 'E-Ticaret / FinTech',
    participations: `1. Miuul Veri Bilimi ve Makine Öğrenmesi Bootcamp (3 ay, 100 saat) - Katılım Sertifikası
2. DataCamp: Data Analyst with Python Kariyer Yolu (Pandas, NumPy, Seaborn, Matplotlib)
3. Google Cloud Skills Boost: BigQuery for Data Analysts Rozeti (15 saat)
4. Bilgi Üniversitesi Veri Görselleştirme ve İleri SQL Seminer Dizisi (4 hafta)
5. Kaggle Titanic & Housing Price Predictor yarışmalarında ilk notebook paylaşımları`,
    currentStrengths: 'Karmaşık SQL sorguları, veri temizleme, Tableau dashboard tasarımı, iş birimleriyle etkili iletişim.',
  },
  {
    id: 'product-cpo',
    label: 'Product Owner ➔ Group Product Manager (Mülakatçı: Chief Product Officer - CPO)',
    interviewerTitle: 'Chief Product Officer (CPO)',
    targetRole: 'Senior / Group Product Manager',
    companyContext: 'Global Ödeme Çözümleri FinTech Şirketi',
    experienceLevel: 'Senior (4+ Yıl)',
    jobDescription: 'Çoklu ürün hatlarını (Multi-product squad) yönetecek, P&L sorumluluğu alabilecek, OKR bazlı stratejik ürün vizyonu oluşturacak deneyimli PM.',
    currentRole: 'Product Owner (2.5 yıl)',
    targetNextRole: 'Director of Product / Group PM',
    industry: 'FinTech / Dijital Bankacılık',
    participations: `1. Scrum.org Professional Scrum Product Owner (PSPO I) Sertifikası
2. Reforge: Product Strategy & Growth Series (Executive Online Workshop)
3. Product Academy: A/B Test Tasarımı ve Veri Odaklı Karar Alma 3 Günlük Sertifika Programı
4. Şirket içi Liderlik ve Çatışma Yönetimi Eğitimi (2 gün)
5. UX Alive 2024 Konferansı Katılımı ve Tasarım Odaklı Düşünme (Design Thinking) Atölyesi`,
    currentStrengths: 'Sprint yönetimi, kullanıcı hikayeleri yazımı, tasarım ekibiyle uyum, temel büyüme metrikleri.',
  },
  {
    id: 'hr-talent-director',
    label: 'İK Uzmanı ➔ İK / Yetenek Yöneticisi (Mülakatçı: People & Culture VP)',
    interviewerTitle: 'VP of People & Culture / İK Direktörü',
    targetRole: 'Talent Acquisition & Employee Experience Lead',
    companyContext: 'Hızlı ölçeklenen teknoloji şirketi (150 çalışan, 500 kişiye büyüme hedefi)',
    experienceLevel: 'Mid-Senior (3-4 Yıl)',
    jobDescription: 'Uçtan uca teknik işe alım, yetenek kazanımı stratejisi ve çalışan bağlılığı programlarını kurgulayacak lider İK profesyoneli.',
    currentRole: 'İşe Alım Uzmanı (2 yıl)',
    targetNextRole: 'Head of People / People Operations Lead',
    industry: 'Teknoloji / Kurumsal',
    participations: `1. SHRM Essentials of Human Resources Sertifika Eğitimi (30 saat)
2. LinkedIn Talent Solutions: Tech Recruiting & Boolean Search İleri Seviye Webinarı
3. PERYÖN İnsan Yönetimi Kongresi 2024 Katılımı (Oturum: Hibrit Çağda Çalışan Bağlılığı)
4. Koç Üniversitesi Yönetici Geliştirme Programı: Yetenek Yönetimi ve Performans Kurgusu (16 saat)
5. DISC Kişilik Envanteri Uygulayıcı Eğitimi`,
    currentStrengths: 'Mülakat organizasyonu, aday iletişimi, LinkedIn sourcing, işveren markası içerik üretimi.',
  },
];
