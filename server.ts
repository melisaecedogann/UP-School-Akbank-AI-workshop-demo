import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client as per guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to safely parse JSON from Gemini text response
function parseGeminiJson<T>(rawText: string, fallback: T): T {
  try {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean) as T;
  } catch (err) {
    console.error('Failed to parse JSON from Gemini response:', err, rawText);
    return fallback;
  }
}

// 1. GENERATE INTERVIEW QUESTIONS BASED ON INTERVIEWER TITLE
app.post('/api/interview/generate-questions', async (req, res) => {
  try {
    const {
      interviewerTitle,
      targetRole,
      companyContext,
      experienceLevel = 'Mid-Level',
      jobDescription = '',
      language = 'tr',
    } = req.body;

    if (!interviewerTitle || !targetRole) {
      return res.status(400).json({ error: 'Mülakatçı unvanı ve hedeflenen pozisyon gereklidir.' });
    }

    const systemInstruction = `You are an elite Executive Interview Coach and Hiring Committee Advisor.
You specialize in decoding what specific interviewer titles (e.g. HR Manager, Tech Lead, Engineering Manager, VP, CTO, Product Director, Founder/CEO, Peer, Cross-functional Stakeholder) REALLY look for.
Every interviewer evaluates candidates from their unique perspective, KPIs, worries, and organizational goals.

Analyze the given interviewer title: "${interviewerTitle}", for the candidate target role: "${targetRole}".
Experience Level: "${experienceLevel}".
Company/Industry Context: "${companyContext || 'Genel / Teknoloji & Kurumsal'}".
Job description / specifics: "${jobDescription || 'Belirtilmedi'}".

Language of output: Turkish (Türkçe). Keep terms industry-standard.
Return a comprehensive, highly realistic JSON response matching the schema.`;

    const prompt = `Generate 6-8 tailored, realistic, high-impact interview questions that this specific interviewer ("${interviewerTitle}") will likely ask the candidate applying for "${targetRole}".
Explain:
1. The psychological mindset & evaluation angle of this interviewer.
2. For each question: category, why THIS interviewer asks it, what red flags they look for, key winning points, recommended answering framework (STAR/CAR), and an exemplar answer.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interviewerProfile: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                mindsetSummary: { type: Type.STRING, description: 'Bu unvandaki kişinin mülakata yaklaşımı ve psikolojisi' },
                primaryPriorities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'En çok önemsediği 3-4 kriter'
                },
                biggestRedFlags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Bu kişinin hemen eleyeceği kritik kırmızı bayraklar'
                },
                winningImpression: { type: Type.STRING, description: 'Bu mülakatçıyı derinden etkileyecek aday profili ve tavrı' }
              },
              required: ['title', 'mindsetSummary', 'primaryPriorities', 'biggestRedFlags', 'winningImpression']
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING, description: 'Örn: Teknik & Mimari, Davranışsal (STAR), Liderlik, Kültür & Uyum, Stratejik / Çeldirici' },
                  question: { type: Type.STRING, description: 'Mülakatçının soracağı net soru' },
                  difficulty: { type: Type.STRING, description: 'Kolay, Orta, Zor, Kritik' },
                  interviewerIntent: { type: Type.STRING, description: 'Neden özellikle BU kişi bu soruyu soruyor? Aradığı gizli sinyal ne?' },
                  recommendedFramework: { type: Type.STRING, description: 'Örn: STAR (Durum-Görev-Eylem-Sonuç) veya Rule of 3' },
                  keyPointsToMention: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Cevapta mutlaka değinilmesi gereken altın noktalar'
                  },
                  pitfallsToAvoid: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Asla söylenmemesi gereken veya puan kıran tuzaklar'
                  },
                  modelAnswer: { type: Type.STRING, description: 'Örnek güçlü, ikna edici ve profesyonel cevap taslağı' }
                },
                required: ['id', 'category', 'question', 'difficulty', 'interviewerIntent', 'recommendedFramework', 'keyPointsToMention', 'pitfallsToAvoid', 'modelAnswer']
              }
            }
          },
          required: ['interviewerProfile', 'questions']
        }
      }
    });

    const parsed = parseGeminiJson(response.text || '{}', null);
    if (!parsed) {
      return res.status(500).json({ error: 'Yapay zeka yanıtı ayrıştırılamadı. Lütfen tekrar deneyin.' });
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating questions:', error);
    return res.status(500).json({ error: error.message || 'Soru üretimi sırasında bir hata oluştu.' });
  }
});

// 2. EVALUATE USER'S ANSWER TO A SPECIFIC QUESTION
app.post('/api/interview/evaluate-answer', async (req, res) => {
  try {
    const {
      interviewerTitle,
      targetRole,
      question,
      userAnswer,
      category = 'Genel',
    } = req.body;

    if (!question || !userAnswer) {
      return res.status(400).json({ error: 'Soru ve aday cevabı gereklidir.' });
    }

    const systemInstruction = `You are a high-level Interview Assessor and Senior Executive Coach.
Evaluate the candidate's answer through the lens of the specific interviewer: "${interviewerTitle}".
Target Role: "${targetRole}".
Question: "${question}" (${category}).
Language: Turkish (Türkçe).

Give direct, constructive, high-value coaching feedback.
Be honest: if the answer is vague or lacks metrics/STAR structure, note it down clearly with a practical way to improve it.`;

    const prompt = `Candidate's Answer:
"""
${userAnswer}
"""

Evaluate this answer in depth according to what a "${interviewerTitle}" expects from a "${targetRole}".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: '100 üzerinden puan' },
            verdict: { type: Type.STRING, description: 'Örn: Güçlü ve İkna Edici, Geliştirilmeli, Yetersiz Somutluk, Üst Düzey Başarı' },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Cevabın güçlü yönleri'
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Eksik veya geliştirilmesi gereken noktalar'
            },
            interviewerPerspective: {
              type: Type.STRING,
              description: 'Bu unvandaki mülakatçının bu cevabı duyduğunda içinden geçirdiği gerçek düşünce'
            },
            coachingTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Cevabı 10/10 yapmak için 2-3 somut taktik'
            },
            polishedAnswer: {
              type: Type.STRING,
              description: 'Kullanıcının verdiği cevabın STAR metodolojisi ve profesyonel dil ile yeniden yazılmış mükemmel versiyonu'
            }
          },
          required: ['score', 'verdict', 'strengths', 'weaknesses', 'interviewerPerspective', 'coachingTips', 'polishedAnswer']
        }
      }
    });

    const parsed = parseGeminiJson(response.text || '{}', null);
    if (!parsed) {
      return res.status(500).json({ error: 'Değerlendirme oluşturulamadı.' });
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    return res.status(500).json({ error: error.message || 'Cevap değerlendirilirken hata oluştu.' });
  }
});

// 3. CAREER AUDIT & EDUCATION ROADMAP (KATILIMLARIN İÇERİĞİ ANALİZİ & SONRAKİ ADIM EĞİTİM REHBERİ)
app.post('/api/career/roadmap', async (req, res) => {
  try {
    const {
      participations,
      currentRole = '',
      targetNextRole = '',
      industry = '',
      currentStrengths = '',
      learningStylePreference = 'Kapsamlı (Online Kurs + Sertifika + Proje)',
    } = req.body;

    if (!participations) {
      return res.status(400).json({ error: 'Katılım sağladığınız eğitim, sertifika ve içerik bilgileri gereklidir.' });
    }

    const systemInstruction = `You are a Principal Career Architect and Executive Talent Development Strategist.
A professional has provided their past learning participations, workshops, certifications, bootcamps, and career content:
"""
${participations}
"""
Current status/role: "${currentRole || 'Mevcut pozisyon belirtilmedi'}"
Desired Next Step / Target Role: "${targetNextRole || 'Bir sonraki kariyer aşaması / Terfi'}"
Industry: "${industry || 'Genel Teknoloji ve İş Dünyası'}"
Additional context: "${currentStrengths || 'Belirtilmedi'}"
Learning preference: "${learningStylePreference}"

Your task is to:
1. Conduct a "Katılım ve Yetkinlik Denetimi" (Participation Competency Audit):
   - What real skills, mental models, and capabilities did they actually gain from these past events/trainings?
   - What level of depth do these represent (surface vs practical vs deep mastery)?
2. Perform a "Hedef Rol Açık Analizi" (Gap Analysis):
   - For the desired next step ("${targetNextRole}"), what are the CRITICAL missing competencies, theoretical depth, or business impact capabilities that past participations DID NOT cover?
3. Generate a concrete, non-generic "Gelecek Adım Eğitim ve Gelişim Planı" (Next-Step Education & Certification Blueprint):
   - Specifically what courses, deep dive certifications (e.g. AWS, Kubernetes, Scrum, System Design, Data, Management, etc.), authoritative books, and hands-on capstone projects they MUST pursue.
4. Provide a structured 30-60-90 day Action Roadmap.
5. Provide actionable coaching advice on how to showcase this past learning + future education story in CV and interviews.

Language: Turkish (Türkçe). Professional, empowering, realistic, and highly concrete.`;

    const prompt = `Lütfen kullanıcının sağladığı eğitim/katılım içeriklerini analiz et ve sonraki kariyer adımı için eksiksiz bir eğitim ve gelişim yol haritası çıkar.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: {
              type: Type.STRING,
              description: 'Mevcut durum ve sonraki adım potansiyelinin 2-3 cümlelik özeti'
            },
            currentCapabilitiesAudit: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  participationItem: { type: Type.STRING, description: 'Bahsedilen eğitim / etkinlik / sertifika' },
                  validatedSkills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Bu katılımdan kazanılan somut yetkinlikler'
                  },
                  masteryLevel: { type: Type.STRING, description: 'Giriş / Temel Kavramlar, Uygulamalı Orta, İleri Düzey, vb.' },
                  assessment: { type: Type.STRING, description: 'Kısa değerlendirme' }
                },
                required: ['participationItem', 'validatedSkills', 'masteryLevel', 'assessment']
              }
            },
            competencyGaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  gapName: { type: Type.STRING, description: 'Eksik olan yetkinlik alanı' },
                  severity: { type: Type.STRING, description: 'Kritik / Zorunlu, Önemli Avantaj, Tamamlayıcı' },
                  whyItMatters: { type: Type.STRING, description: 'Hedeflenen pozisyonda bu neden elenme veya terfi alamama sebebi olur?' },
                  howToBridge: { type: Type.STRING, description: 'Nasıl kapatılacağı özeti' }
                },
                required: ['gapName', 'severity', 'whyItMatters', 'howToBridge']
              }
            },
            recommendedTrainings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Önerilen eğitim, sertifika veya müfredat adı' },
                  type: { type: Type.STRING, description: 'Resmi Sertifikasyon, İleri Düzey Kurs, Kitap & Teori, Uygulamalı Bootcamp / Kohort' },
                  providerOrSource: { type: Type.STRING, description: 'Örn: AWS / Google Cloud, Coursera / DeepLearning.AI, Harvard / O’Reilly, vb.' },
                  focusTopics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Öğrenilecek kritik anahtar başlıklar'
                  },
                  expectedOutcome: { type: Type.STRING, description: 'Bu eğitimi tamamlayınca CV ve mülakatta nasıl bir kanıt oluşur?' },
                  estimatedDuration: { type: Type.STRING, description: 'Örn: 4-6 hafta, 40 saat' },
                  priority: { type: Type.STRING, description: '1. Öncelik (Acil), 2. Öncelik, 3. Öncelik' }
                },
                required: ['title', 'type', 'providerOrSource', 'focusTopics', 'expectedOutcome', 'estimatedDuration', 'priority']
              }
            },
            capstoneProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  projectName: { type: Type.STRING, description: 'Yapılması önerilen somut proje / portfolyo işi' },
                  description: { type: Type.STRING, description: 'Projenin kapsamı ve mimarisi' },
                  provenSkills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'İşe alım yöneticisine kanıtlayacağı yetenekler'
                  }
                },
                required: ['projectName', 'description', 'provenSkills']
              }
            },
            roadmap90Days: {
              type: Type.OBJECT,
              properties: {
                phase1: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: '0-30 Gün: Temel Açıkları Kapatma' },
                    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    milestone: { type: Type.STRING }
                  },
                  required: ['title', 'actions', 'milestone']
                },
                phase2: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: '30-60 Gün: İleri Düzey Uzmanlaşma & Proje' },
                    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    milestone: { type: Type.STRING }
                  },
                  required: ['title', 'actions', 'milestone']
                },
                phase3: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: '60-90+ Gün: Konumlandırma, Sertifikasyon & Mülakat' },
                    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    milestone: { type: Type.STRING }
                  },
                  required: ['title', 'actions', 'milestone']
                }
              },
              required: ['phase1', 'phase2', 'phase3']
            },
            interviewAndPositioningStrategy: {
              type: Type.OBJECT,
              properties: {
                howToPitchPastTrainings: { type: Type.STRING, description: 'Geçmiş eğitimleri mülakatta hikayeleştirme stratejisi' },
                keyPhrasesToUse: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Kullanılması gereken güçlü profesyonel kalıplar'
                },
                salaryAndLevelingAdvantage: { type: Type.STRING, description: 'Bu yeni eğitim seviyesi ile talep edilecek unvan/maaş kozu' }
              },
              required: ['howToPitchPastTrainings', 'keyPhrasesToUse', 'salaryAndLevelingAdvantage']
            }
          },
          required: [
            'executiveSummary',
            'currentCapabilitiesAudit',
            'competencyGaps',
            'recommendedTrainings',
            'capstoneProjects',
            'roadmap90Days',
            'interviewAndPositioningStrategy'
          ]
        }
      }
    });

    const parsed = parseGeminiJson(response.text || '{}', null);
    if (!parsed) {
      return res.status(500).json({ error: 'Kariyer analizi yanıtı oluşturulamadı.' });
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error creating career roadmap:', error);
    return res.status(500).json({ error: error.message || 'Kariyer analizi sırasında hata oluştu.' });
  }
});

// 4. INTERACTIVE LIVE MOCK SIMULATION TURN
app.post('/api/interview/chat-mock', async (req, res) => {
  try {
    const {
      interviewerTitle,
      targetRole,
      history = [],
      userMessage,
      personaTone = 'Gerçekçi & Profesyonel', // 'Destekleyici & İpuçlu', 'Gerçekçi & Profesyonel', 'Zorlayıcı & Sorgulayıcı VP'
    } = req.body;

    const systemInstruction = `You are playing the role of "${interviewerTitle}" conducting a job interview for the position of "${targetRole}".
Persona Tone: "${personaTone}".
Language: Turkish (Türkçe).

Rules of interaction:
1. Stay in character! Respond naturally as the interviewer.
2. If the user answered a question, briefly react (e.g. acknowledge a good point, or probe deeper if it was vague), and then ask a sharp follow-up or move to the next logical question.
3. IN ADDITION to your in-character interviewer speech, provide a secret "Koç İpucu" (whispered coach feedback) analyzing how the candidate performed in their last turn and what tactical move they should make next.
4. Keep the in-character dialogue concise, engaging, and authentic (not a robot text wall).`;

    const conversationContext = history
      .slice(-6)
      .map((m: any) => `${m.role === 'user' ? 'Aday' : 'Mülakatçı'}: ${m.content}`)
      .join('\n');

    const prompt = `Geçmiş Konuşma:
${conversationContext}

Adayın Son Mesajı: "${userMessage || 'Merhaba, mülakata hazırım.'}"

Lütfen mülakatçı unvanına uygun cevabını ve koç ipucunu üret.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interviewerReply: { type: Type.STRING, description: 'Mülakatçının doğrudan adaya söylediği replik/soru' },
            coachWhisper: { type: Type.STRING, description: 'Koçun arka plandaki gizli değerlendirmesi ve adaya taktiği' },
            suggestedNextMove: { type: Type.STRING, description: 'Adayın cevabında odaklanması gereken 1 kilit öneri' },
            sentiment: { type: Type.STRING, description: 'Olumlu, Meraklı, Şüpheci, Etkilenmiş, Zorlayıcı' }
          },
          required: ['interviewerReply', 'coachWhisper', 'suggestedNextMove', 'sentiment']
        }
      }
    });

    const parsed = parseGeminiJson(response.text || '{}', null);
    if (!parsed) {
      return res.status(500).json({ error: 'Mülakat simülasyonu yanıtı oluşturulamadı.' });
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in mock chat:', error);
    return res.status(500).json({ error: error.message || 'Mülakat simülasyonunda hata oluştu.' });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
