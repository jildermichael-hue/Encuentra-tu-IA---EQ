export interface AIRecommendation {
  name: string;
  description: string;
  capabilities: string[];
  pricing: 'Gratis' | 'Pago' | 'Freemium';
  bestFor: string;
  pros: string[];
  cons: string[];
  url: string;
  logoUrl?: string;
}

export interface AIAnalysisResponse {
  topRecommendation: AIRecommendation;
  alternatives: AIRecommendation[];
  reasoning: string;
}
