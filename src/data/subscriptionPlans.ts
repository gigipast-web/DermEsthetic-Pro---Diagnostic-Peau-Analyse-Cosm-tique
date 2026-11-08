import { SubscriptionPlanId, UserSubscription, SubscriptionInvoice } from '../types';

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface SubscriptionPlanDefinition {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearlyPerMonth: number;
  badge?: string;
  isPopular?: boolean;
  limits: {
    maxClients: number | 'unlimited';
    maxScansPerMonth: number | 'unlimited';
    aiDiagnostics: 'basic' | 'unlimited';
    multiCabin: boolean;
    multiPractitioner: boolean;
    whiteLabelPdf: boolean;
  };
  features: PlanFeature[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanDefinition[] = [
  {
    id: 'starter',
    name: 'Essentiel Cabine',
    tagline: 'Pour démarrer sereinement son activité en institut ou à domicile.',
    priceMonthly: 0,
    priceYearlyPerMonth: 0,
    badge: 'Gratuit',
    limits: {
      maxClients: 15,
      maxScansPerMonth: 10,
      aiDiagnostics: 'basic',
      multiCabin: false,
      multiPractitioner: false,
      whiteLabelPdf: false,
    },
    features: [
      { text: 'Jusqu’à 15 fiches clientes actives', included: true },
      { text: '10 scans INCI / codes-barres par mois', included: true },
      { text: 'Diagnostics cutanés manuels (Visage)', included: true },
      { text: 'Ordonnance beauté imprimable standard', included: true },
      { text: 'Agenda & planning cabine complet', included: false },
      { text: 'Analyses photo IA haute précision (Gemini)', included: false },
      { text: 'Suivi comparatif des progrès de cure', included: false },
      { text: 'Export PDF personnalisé avec logo institut', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro Esthéticienne',
    tagline: 'La formule plébiscitée par les praticiennes indépendantes et cornéothérapeutes.',
    priceMonthly: 29,
    priceYearlyPerMonth: 24,
    badge: 'Le plus populaire',
    isPopular: true,
    limits: {
      maxClients: 'unlimited',
      maxScansPerMonth: 'unlimited',
      aiDiagnostics: 'unlimited',
      multiCabin: false,
      multiPractitioner: false,
      whiteLabelPdf: true,
    },
    features: [
      { text: 'Dossiers clientes & historiques illimités', included: true, highlight: true },
      { text: 'Scanner de code-barres & base INCI illimités', included: true },
      { text: 'Diagnostics Visage & Corps IA illimités avec photos HD', included: true, highlight: true },
      { text: 'Agenda & calendrier complet de planification des visites', included: true, highlight: true },
      { text: 'Export PDF dermo-analytique avec nom & logo de l’institut', included: true },
      { text: 'Évolution cutanée & comparateur de progrès avant/après', included: true },
      { text: 'Alertes toxicologiques (perturbateurs endocriniens, silicones)', included: true },
      { text: 'Support prioritaire par email & chat dédié', included: true },
    ],
  },
  {
    id: 'prestige',
    name: 'Institut & Spa Prestige',
    tagline: 'Conçu pour les instituts établis, centres dermo-esthétiques et spas multi-cabines.',
    priceMonthly: 69,
    priceYearlyPerMonth: 59,
    badge: 'Équipe & Multi-cabines',
    limits: {
      maxClients: 'unlimited',
      maxScansPerMonth: 'unlimited',
      aiDiagnostics: 'unlimited',
      multiCabin: true,
      multiPractitioner: true,
      whiteLabelPdf: true,
    },
    features: [
      { text: 'Toutes les fonctionnalités du forfait Pro Esthéticienne', included: true },
      { text: 'Accès multi-praticiennes (jusqu’à 5 esthéticiennes)', included: true, highlight: true },
      { text: 'Gestion multi-cabines en simultané (Cabine 1, 2, 3...)', included: true, highlight: true },
      { text: 'Base de données produits privée et sur-mesure de l’institut', included: true },
      { text: 'Exports PDF 100% marque blanche avec signature de l’institut', included: true },
      { text: 'Sauvegarde automatique cloud & synchronisation multi-postes', included: true },
      { text: 'Formation personnalisée à l’intégration en cabine', included: true },
      { text: 'Assistance téléphonique dédiée 7j/7', included: true },
    ],
  },
];

export function createDefaultSubscription(planId: SubscriptionPlanId = 'pro'): UserSubscription {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId) || SUBSCRIPTION_PLANS[1];
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const prevMonth = new Date(now);
  prevMonth.setMonth(prevMonth.getMonth() - 1);

  const prevPrevMonth = new Date(now);
  prevPrevMonth.setMonth(prevPrevMonth.getMonth() - 2);

  const initialInvoices: SubscriptionInvoice[] =
    plan.priceMonthly > 0
      ? [
          {
            id: 'inv-' + Date.now(),
            invoiceNumber: `FAC-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-082`,
            date: now.toISOString().split('T')[0],
            amount: plan.priceMonthly,
            taxAmount: Math.round(plan.priceMonthly * 0.2 * 100) / 100,
            planName: plan.name,
            billingCycle: 'monthly',
            status: 'paid',
            pdfDownloadName: `facture-dermesthetic-${now.toISOString().split('T')[0]}.pdf`,
          },
          {
            id: 'inv-' + (Date.now() - 1000),
            invoiceNumber: `FAC-${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}-047`,
            date: prevMonth.toISOString().split('T')[0],
            amount: plan.priceMonthly,
            taxAmount: Math.round(plan.priceMonthly * 0.2 * 100) / 100,
            planName: plan.name,
            billingCycle: 'monthly',
            status: 'paid',
            pdfDownloadName: `facture-dermesthetic-${prevMonth.toISOString().split('T')[0]}.pdf`,
          },
        ]
      : [];

  return {
    planId: plan.id,
    planName: plan.name,
    priceMonthly: plan.priceMonthly,
    billingCycle: 'monthly',
    status: 'active',
    startedAt: prevPrevMonth.toISOString().split('T')[0],
    renewsAt: nextMonth.toISOString().split('T')[0],
    paymentMethodBrand: 'visa',
    paymentMethodLast4: '4242',
    autoRenew: true,
    invoices: initialInvoices,
  };
}
