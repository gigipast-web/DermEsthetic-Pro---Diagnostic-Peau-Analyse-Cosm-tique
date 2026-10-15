export type TreatmentArea = 'visage' | 'corps';

export type RiskLevel = 'très sûr' | 'sûr' | 'modéré' | 'à risque' | 'dangereux / déconseillé';

export type HazardCategory =
  | 'perturbateur_endocrinien'
  | 'cancérogène_suspecté'
  | 'irritant_sulfate'
  | 'polluant_silicone_peg'
  | 'allergène_parfum'
  | 'huile_minérale_occlusive'
  | 'comédogène'
  | 'autre';

export interface DangerousIngredient {
  name: string;
  category: HazardCategory;
  severity: 'haute' | 'moyenne' | 'faible';
  dangerDescription: string;
  scientificContext?: string;
  comedogenicScore?: number; // 0 to 5
}

export interface BeneficialActive {
  name: string;
  benefit: string;
  efficacyLevel?: 'majeur' | 'secondaire';
}

export interface CleanAlternative {
  productType: string;
  keyActiveAlternative: string;
  professionalAdvice: string;
}

export interface UserReview {
  author: string;
  rating: number; // 1 to 5
  comment: string;
  skinTypeTested?: string;
  date?: string;
}

export interface ProductReviewsData {
  averageRating: number;
  totalReviews: number;
  satisfactionPercentage: number;
  positiveHighlights: string[];
  negativeHighlights: string[];
  reviewsSample: UserReview[];
}

export interface ProductAnalysisResult {
  barcode?: string;
  productName: string;
  brand: string;
  category: string;
  imageUrl?: string;
  safetyScore: number; // 0 to 100
  riskLevel: RiskLevel;
  isControversialOrDangerous: boolean;
  summary: string;
  extractedInci?: string[];
  dangerousOrControversialIngredients: DangerousIngredient[];
  beneficialActives: BeneficialActive[];
  comedogenicRating: number; // 0 to 5
  isSafeForPregnancy: boolean;
  isSafeForSensitiveSkin: boolean;
  suitableForPostCare?: boolean;
  professionalVerdict: string;
  recommendedCleanAlternatives: CleanAlternative[];
  analyzedAt: string;
  source?: 'openbeautyfacts' | 'gemini_ia' | 'local_verified' | 'institut_catalog';
  reviews?: ProductReviewsData;
  retailPrice?: string;
}

export interface CabinStep {
  stepNumber: number;
  phase: string;
  actionName: string;
  equipmentOrTechnique: string;
  activeIngredients: string[];
  cautions: string;
}

export interface RoutineStep {
  step: string;
  category: string;
  keyActives: string;
  usageTip: string;
  specificProductRecommendation?: string;
}

export interface SkinMetrics {
  hydrationScore: number; // 0-100%
  sebumScore: number; // 0-100%
  wrinklesScore: number; // 0-100% (faible = lisse)
  pigmentSpotsScore: number; // 0-100% (faible = uniforme)
  rednessSensitivityScore: number; // 0-100%
  elasticityFirmnessScore: number; // 0-100% (élevé = très ferme)
  poresTextureScore: number; // 0-100%
  // Métriques corporelles optionnelles
  celluliteGrade?: 'aucune' | 'stade_1_aqueuse' | 'stade_2_adipeuse' | 'stade_3_fibreuse';
  stretchMarksSeverity?: 'aucune' | 'légère' | 'modérée' | 'prononcée';
  lymphaticRetention?: 'faible' | 'modérée' | 'sévère';
}

export interface DiagnosticReport {
  id: string;
  date: string;
  clientId?: string;
  clientName: string;
  clientAge?: number;
  treatmentArea: TreatmentArea;
  specificZone: string;
  photoUrl?: string;
  photoAfterUrl?: string;
  diagnosticSummary: string;
  metrics: SkinMetrics;
  skinTypeAssessment: {
    mainType: string;
    phototypeFitzpatrick?: string;
    hydrationLevel: 'déshydratée' | 'équilibrée' | 'sèche';
    lipidLevel: 'alipidique' | 'normale' | 'hyperséborrhéique';
  };
  priorityIssues: Array<{
    issue: string;
    severity: 'faible' | 'modérée' | 'forte';
    affectedArea: string;
    scientificExplanation: string;
  }>;
  cabinProtocol: {
    title: string;
    targetGoal: string;
    duration: string;
    steps: CabinStep[];
  };
  homePrescription: {
    morning: RoutineStep[];
    evening: RoutineStep[];
    weeklyCare: string;
    lifestyleAdvice: string[];
  };
  recommendedActiveIngredients: string[];
  activesToAvoid: string[];
  practitionerNotes?: string;
}

export interface TreatmentSession {
  id: string;
  date: string;
  careType: 'visage' | 'corps';
  title: string;
  protocolSummary: string;
  durationMinutes: number;
  productsUsedCabin: string[];
  technologiesUsed?: string[]; // LED, ultrasons, vapeur ozone, palper-rouler...
  skinReaction?: string;
  notes?: string;
  price?: number;
}

export interface PurchasedProductRecord {
  id: string;
  date: string;
  productName: string;
  brand: string;
  category: string;
  barcode?: string;
  safetyScore?: number;
  price?: number;
  repurchaseStatus: 'actif' | 'renouvelé' | 'terminé' | 'déconseillé';
  clientFeedback?: string;
  rating?: number; // 1-5
}

export interface PrivateClientNote {
  id: string;
  date: string;
  content: string;
  author: string;
  category: 'observation_cutanee' | 'preference_cliente' | 'reaction_produit' | 'objectif_suivi';
  isImportant?: boolean;
}

export interface SkinProgressPhoto {
  id: string;
  date: string;
  photoUrl: string;
  stage: 'avant' | 'apres' | 'suivi_intermediaire';
  zone: string;
  notes?: string;
}

export interface ClientProfile {
  id: string;
  fullName: string;
  age?: number;
  birthDate?: string;
  phone?: string;
  email?: string;
  address?: string;
  skinType?: string;
  fitzpatrickScale?: string;
  knownAllergies?: string[];
  medicalHistory?: string[];
  isPregnant?: boolean;
  sensitivities?: string;
  contraindications?: string[];
  createdAt: string;
  lastVisit?: string;
  nextAppointment?: string;
  diagnosticsCount: number;
  // Historiques complets de suivi client
  treatmentSessions: TreatmentSession[];
  purchasedProducts: PurchasedProductRecord[];
  privateNotes: PrivateClientNote[];
  progressPhotos?: SkinProgressPhoto[];
}
