export interface InterviewerProfile {
  title: string;
  mindsetSummary: string;
  primaryPriorities: string[];
  biggestRedFlags: string[];
  winningImpression: string;
}

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  difficulty: string;
  interviewerIntent: string;
  recommendedFramework: string;
  keyPointsToMention: string[];
  pitfallsToAvoid: string[];
  modelAnswer: string;
}

export interface QuestionGenerationResult {
  interviewerProfile: InterviewerProfile;
  questions: InterviewQuestion[];
}

export interface AnswerEvaluation {
  score: number;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  interviewerPerspective: string;
  coachingTips: string[];
  polishedAnswer: string;
}

export interface CapabilityAuditItem {
  participationItem: string;
  validatedSkills: string[];
  masteryLevel: string;
  assessment: string;
}

export interface CompetencyGap {
  gapName: string;
  severity: string;
  whyItMatters: string;
  howToBridge: string;
}

export interface RecommendedTraining {
  title: string;
  type: string;
  providerOrSource: string;
  focusTopics: string[];
  expectedOutcome: string;
  estimatedDuration: string;
  priority: string;
}

export interface CapstoneProject {
  projectName: string;
  description: string;
  provenSkills: string[];
}

export interface RoadmapPhase {
  title: string;
  actions: string[];
  milestone: string;
}

export interface CareerRoadmapResult {
  executiveSummary: string;
  currentCapabilitiesAudit: CapabilityAuditItem[];
  competencyGaps: CompetencyGap[];
  recommendedTrainings: RecommendedTraining[];
  capstoneProjects: CapstoneProject[];
  roadmap90Days: {
    phase1: RoadmapPhase;
    phase2: RoadmapPhase;
    phase3: RoadmapPhase;
  };
  interviewAndPositioningStrategy: {
    howToPitchPastTrainings: string;
    keyPhrasesToUse: string[];
    salaryAndLevelingAdvantage: string;
  };
}

export interface MockChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  coachWhisper?: string;
  suggestedNextMove?: string;
  sentiment?: string;
}
