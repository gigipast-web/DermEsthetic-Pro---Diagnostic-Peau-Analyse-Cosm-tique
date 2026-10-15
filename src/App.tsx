import React, { useState, useEffect } from 'react';
import { Navbar, MainTab } from './components/Navbar';
import { ProductScannerView } from './components/ProductScannerView';
import { SkinDiagnosticView } from './components/SkinDiagnosticView';
import { ActivesAndToxicGuideView } from './components/ActivesAndToxicGuideView';
import { ClientsView } from './components/ClientsView';
import { ClientProfile, DiagnosticReport, ProductAnalysisResult } from './types';
import { SAMPLE_CLIENTS, VERIFIED_PRODUCTS_CATALOG } from './data/cosmeticsDatabase';
import { Sparkles, ShieldCheck, HeartHandshake, Award } from 'lucide-react';

const INITIAL_DIAGNOSTICS: DiagnosticReport[] = [
  {
    id: 'diag-demo-01',
    date: '2026-10-02',
    clientName: 'Élodie Laurent',
    clientAge: 34,
    treatmentArea: 'visage',
    specificZone: 'Joues & Pommettes',
    diagnosticSummary:
      'Film hydrolipidique altéré avec réactivité vasomotrice accrue lors des variations de température. Tiraillements prononcés après la douche associés à de fines squames de surface. Nécessite une cure relipidante biomimétique et un renforcement de la barrière épidermique.',
    metrics: {
      hydrationScore: 32,
      sebumScore: 48,
      wrinklesScore: 28,
      pigmentSpotsScore: 35,
      rednessSensitivityScore: 78,
      elasticityFirmnessScore: 82,
      poresTextureScore: 54,
    },
    skinTypeAssessment: {
      mainType: 'Mixte déshydratée réactive',
      phototypeFitzpatrick: 'Phototype II (Peau claire)',
      hydrationLevel: 'déshydratée',
      lipidLevel: 'alipidique',
    },
    priorityIssues: [
      {
        issue: 'Altération du ciment intercellulaire',
        severity: 'modérée',
        affectedArea: 'Pommettes et tempes',
        scientificExplanation: 'Perte insensible en eau (PIE) accélérée en raison d’une baisse des céramides endogènes.',
      },
      {
        issue: 'Micro-rougeurs diffuses',
        severity: 'faible',
        affectedArea: 'Joues',
        scientificExplanation: 'Hyper-réactivité capillaire de surface stimulée par le stress oxydatif et les nettoyages trop agressifs.',
      },
    ],
    cabinProtocol: {
      title: 'Protocole Barrière Cutanée & Hydratation Biomimétique',
      targetGoal: 'Restaurer le ciment lipidique, désensibiliser l’épiderme et raviver l’éclat naturel',
      duration: '50 minutes',
      steps: [
        {
          stepNumber: 1,
          phase: 'Nettoyage Dermo-Biologique',
          actionName: 'Double nettoyage au baume fondant végétal puis émulsion lactée douce',
          equipmentOrTechnique: 'Manœuvres douces enveloppantes et rinçage aux serviettes tièdes oshibori',
          activeIngredients: ['Prébiotiques', 'Huile d’amande douce bio'],
          cautions: 'Éviter l’eau calcaire; brumiser eau florale de bleuet.',
        },
        {
          stepNumber: 2,
          phase: 'Exfoliation Douce',
          actionName: 'Peeling enzymatique à la papaïne et bromélaïne (sans grains abrasifs)',
          equipmentOrTechnique: 'Pose au pinceau 7 minutes sous vapeur tiède ozone légère',
          activeIngredients: ['Papaïne', 'Bromélaïne', 'Acide lactique 2%'],
          cautions: 'Neutraliser immédiatement en cas d’échauffement vif.',
        },
        {
          stepNumber: 3,
          phase: 'Modelage Dermo-Actif',
          actionName: 'Modelage apaisant et drainage lymphatique facial aux champignons de quartz rose',
          equipmentOrTechnique: 'Pressions douces et effleurages rythmés vers les ganglions rétro-auriculaires',
          activeIngredients: ['Squalane végétal pur', 'Extrait de Camomille matricaire'],
          cautions: 'Respecter le sens du drainage lymphatique.',
        },
        {
          stepNumber: 4,
          phase: 'Masque Haute Imbibition',
          actionName: 'Masque seconde peau biocellulose aux céramides et acide hyaluronique',
          equipmentOrTechnique: 'Pose occlusive 15 minutes avec luminothérapie LED jaune & rouge (630nm)',
          activeIngredients: ['Acide Hyaluronique bas poids', 'Céramides NP', 'Bêta-glucane'],
          cautions: 'Protection oculaire sous la lampe LED.',
        },
        {
          stepNumber: 5,
          phase: 'Finition & Protection',
          actionName: 'Infusion du sérum fortifiant et crème bouclier barrière SPF 50',
          equipmentOrTechnique: 'Effleurages légers visage, cou et décolleté',
          activeIngredients: ['Niacinamide 3%', 'Oxyde de Zinc non nano'],
          cautions: 'Ne pas laver le visage avant le soir pour préserver l’infusion.',
        },
      ],
    },
    homePrescription: {
      morning: [
        {
          step: '1. Nettoyage',
          category: 'Gelée nettoyante sans sulfates',
          keyActives: 'Coco-Glucoside, Glycérine végétale',
          usageTip: 'Rincer à l’eau tiède sans frotter la peau.',
        },
        {
          step: '2. Sérum Hydratant',
          category: 'Sérum d’hydratation profonde',
          keyActives: 'Acide Hyaluronique multi-poids & Niacinamide 3%',
          usageTip: '3 à 4 gouttes sur peau légèrement humide.',
        },
        {
          step: '3. Protection UV',
          category: 'Crème fluide relipidante SPF 50',
          keyActives: 'Céramides NP, Filtres UV propres',
          usageTip: 'Visage, cou et décolleté chaque matin.',
        },
      ],
      evening: [
        {
          step: '1. Démaquillage',
          category: 'Huile démaquillante végétale pure',
          keyActives: 'Huile de Jojoba vierge, Vitamine E',
          usageTip: 'Masser délicatement sur peau sèche puis émulsionner.',
        },
        {
          step: '2. Nutrition Nuit',
          category: 'Crème riche barrière dermo-protectrice',
          keyActives: 'Bakuchiol 1%, Squalane végétal, Karité brut',
          usageTip: 'Pressions douces des paumes de mains sans étirer les tissus.',
        },
      ],
      weeklyCare: 'Masque crème relipidant en couche épaisse 1 à 2 fois par semaine après un gommage enzymatique doux.',
      lifestyleAdvice: [
        'Consommer 1.5L d’eau faiblement minéralisée tout au long de la journée.',
        'Éviter l’eau de douche trop chaude sur le visage (>37°C).',
        'Consommer des huiles riches en oméga-3 (noix, colza, lin) pour nourrir la peau de l’intérieur.',
      ],
    },
    recommendedActiveIngredients: ['Acide Hyaluronique', 'Niacinamide', 'Céramides NP', 'Bakuchiol', 'Allantoïne'],
    activesToAvoid: ['Sodium Lauryl Sulfate (SLS)', 'Alcool dénaturé', 'Parfums synthétiques lourds', 'Gommages mécaniques à gros grains'],
    practitionerNotes: 'Excellente réponse au modelage quartz rose. Proscrire impérativement la boîte bleue Nivea qu’elle utilisait jusqu’ici (trop occlusive).',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('scanner');

  // Client states with local storage persistence
  const [clients, setClients] = useState<ClientProfile[]>(() => {
    try {
      const saved = localStorage.getItem('dermesthetic_clients');
      return saved ? JSON.parse(saved) : SAMPLE_CLIENTS;
    } catch {
      return SAMPLE_CLIENTS;
    }
  });

  const [diagnostics, setDiagnostics] = useState<DiagnosticReport[]>(() => {
    try {
      const saved = localStorage.getItem('dermesthetic_diagnostics');
      return saved ? JSON.parse(saved) : INITIAL_DIAGNOSTICS;
    } catch {
      return INITIAL_DIAGNOSTICS;
    }
  });

  const [clientProducts, setClientProducts] = useState<Record<string, ProductAnalysisResult[]>>(() => {
    try {
      const saved = localStorage.getItem('dermesthetic_client_products');
      return saved
        ? JSON.parse(saved)
        : {
            'cli-01': [VERIFIED_PRODUCTS_CATALOG[0], VERIFIED_PRODUCTS_CATALOG[2]],
            'cli-02': [VERIFIED_PRODUCTS_CATALOG[1]],
          };
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dermesthetic_clients', JSON.stringify(clients));
    } catch (e) {
      console.warn(e);
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('dermesthetic_diagnostics', JSON.stringify(diagnostics));
    } catch (e) {
      console.warn(e);
    }
  }, [diagnostics]);

  useEffect(() => {
    try {
      localStorage.setItem('dermesthetic_client_products', JSON.stringify(clientProducts));
    } catch (e) {
      console.warn(e);
    }
  }, [clientProducts]);

  const handleAddClient = (newClient: ClientProfile) => {
    setClients((prev) => [newClient, ...prev]);
  };

  const handleDeleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateClient = (updatedClient: ClientProfile) => {
    setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
  };

  const handleSaveDiagnosticReport = (report: DiagnosticReport, clientId?: string) => {
    setDiagnostics((prev) => [report, ...prev]);

    // Update client profile & add session automatically
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId || c.fullName === report.clientName) {
          const autoSession = {
            id: 'sess-' + Date.now(),
            date: report.date,
            careType: report.treatmentArea,
            title: report.cabinProtocol.title,
            protocolSummary: report.cabinProtocol.targetGoal,
            durationMinutes: parseInt(report.cabinProtocol.duration) || 50,
            productsUsedCabin: report.recommendedActiveIngredients || [],
            skinReaction: 'Bilan et protocole cabine réalisés avec succès.',
            notes: report.practitionerNotes,
          };

          return {
            ...c,
            lastVisit: report.date,
            diagnosticsCount: (c.diagnosticsCount || 0) + 1,
            skinType: report.skinTypeAssessment.mainType || c.skinType,
            treatmentSessions: [autoSession, ...(c.treatmentSessions || [])],
          };
        }
        return c;
      })
    );
  };

  const handleAddProductToClient = (clientId: string, product: ProductAnalysisResult) => {
    setClientProducts((prev) => ({
      ...prev,
      [clientId]: [product, ...(prev[clientId] || [])],
    }));

    // Also add to client's purchased products history
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const record = {
            id: 'purch-' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            productName: product.productName,
            brand: product.brand,
            category: product.category,
            barcode: product.barcode,
            safetyScore: product.safetyScore,
            repurchaseStatus: (product.isControversialOrDangerous ? 'déconseillé' : 'actif') as any,
            clientFeedback: product.isControversialOrDangerous
              ? 'Alerte : produit déconseillé par la praticienne en raison d’ingrédients controversés.'
              : 'Produit scanné et validé par l’institut.',
          };
          return {
            ...c,
            purchasedProducts: [record, ...(c.purchasedProducts || [])],
          };
        }
        return c;
      })
    );
  };

  const handleOpenDiagnosticWithClient = (client: ClientProfile) => {
    setActiveTab('diagnostic');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-rose-200 selection:text-rose-950">
      {/* Top Professional Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 pb-16">
        {activeTab === 'scanner' && (
          <ProductScannerView
            clients={clients}
            onAddProductToClient={handleAddProductToClient}
          />
        )}

        {activeTab === 'diagnostic' && (
          <SkinDiagnosticView
            clients={clients}
            onSaveReport={handleSaveDiagnosticReport}
          />
        )}

        {activeTab === 'actives' && <ActivesAndToxicGuideView />}

        {activeTab === 'clients' && (
          <ClientsView
            clients={clients}
            diagnostics={diagnostics}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
            onOpenDiagnosticWithClient={handleOpenDiagnosticWithClient}
          />
        )}
      </main>

      {/* Professional Footer */}
      <footer className="no-print bg-white border-t border-stone-200/80 py-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-stone-700">
            <Award className="w-5 h-5 text-rose-800" />
            <div>
              <span className="font-semibold text-stone-900 block">
                DermEsthetic Pro · Outil Dédié aux Praticiennes en Esthétique & Cosmétique
              </span>
              <span className="text-[11px] text-stone-500">
                Conforme aux directives européennes cosmétiques CE 1223/2009 & CosIng.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-stone-500 text-[11px]">
            <span>Base Open Beauty Facts connectée</span>
            <span>·</span>
            <span>Diagnostic Multimodal Visage & Corps</span>
            <span>·</span>
            <span>Ordonnances imprimables A4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
