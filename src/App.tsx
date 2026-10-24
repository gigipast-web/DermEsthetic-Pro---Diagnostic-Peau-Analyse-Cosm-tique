import React, { useState, useEffect } from 'react';
import { Navbar, MainTab } from './components/Navbar';
import { ProductScannerView } from './components/ProductScannerView';
import { SkinDiagnosticView } from './components/SkinDiagnosticView';
import { ActivesAndToxicGuideView } from './components/ActivesAndToxicGuideView';
import { ClientsView } from './components/ClientsView';
import { ClientProfile, DiagnosticReport, ProductAnalysisResult, PractitionerUser, PurchasedProductRecord, Appointment } from './types';
import { SAMPLE_CLIENTS, VERIFIED_PRODUCTS_CATALOG, SAMPLE_APPOINTMENTS } from './data/cosmeticsDatabase';
import { Award } from 'lucide-react';
import { getCurrentUser, logoutUser } from './services/authService';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { LanguageSelector } from './components/LanguageSelector';

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
          action: 'Démaquillage avec lait relipidant doux aux esters de jojoba et brumisation eau florale camomille matricaire.',
        },
        {
          stepNumber: 2,
          phase: 'Exfoliation Enzymatique sans grains',
          action: 'Application gelée enzymatique grenade / papaye 5 minutes, rinçage tiède à l’éponge végétale douce.',
        },
        {
          stepNumber: 3,
          phase: 'Infusion Céramides & Acide Hyaluronique',
          action: 'Massage drainant dermo-liftant avec sérum 3 céramides purs (NP, AP, EOP) + phytosphingosine.',
        },
        {
          stepNumber: 4,
          phase: 'Masque Seconde Peau Biocellulose',
          action: 'Pose masque imprégné bêta-glucane et centella asiatica sous lampe LED rouge (630nm) 15 minutes.',
        },
        {
          stepNumber: 5,
          phase: 'Protection finale & Scellement',
          action: 'Émulsion barrière cica-apaisante SPF30 sans parfum et baume lèvres nourrissant bio.',
        },
      ],
    },
    homePrescription: {
      morning: [
        {
          step: 'Nettoyage Dermo-Physiologique',
          category: 'Nettoyant',
          keyActives: 'Lait relipidant jojoba',
          usageTip: 'Rincer à l’eau tiède, tamponner délicatement sans frotter',
        },
        {
          step: 'Sérum Barrière & Hydratation',
          category: 'Sérum',
          keyActives: 'Niacinamide 4% + Acide Hyaluronique',
          usageTip: '3 gouttes sur peau légèrement humide',
        },
        {
          step: 'Protection UV Minérale',
          category: 'Crème de jour',
          keyActives: 'Céramides + SPF 50 sans parfum',
          usageTip: 'Appliquer quotidiennement avant le maquillage',
        },
      ],
      evening: [
        {
          step: 'Double Nettoyage Relipidant',
          category: 'Nettoyant soir',
          keyActives: 'Huile pure puis gelée sans sulfate',
          usageTip: 'Émulsionner à l’eau tiède',
        },
        {
          step: 'Soin Réparateur Cutané Nuit',
          category: 'Soin de nuit',
          keyActives: 'Panthénol B5 + Oméga 3/6 végétal',
          usageTip: 'En couche fine régénérante sur tout le visage',
        },
      ],
      weeklyCare: 'Masque crème apaisant biocellulose 1 fois par semaine. Proscrire tout gommage mécanique abrasif.',
      lifestyleAdvice: [
        'Humidifier l’atmosphère de la chambre en période hivernale',
        'Privilégier une eau faiblement minéralisée (1.5L / jour)',
        'Remplacer les cotons par des lingettes en microfibres ultra-douces',
      ],
    },
    recommendedActiveIngredients: [
      'Céramides (NP, AP, EOP)',
      'Acide Hyaluronique Multi-Moléculaire',
      'Niacinamide (Vitamine B3 à 4-5%)',
      'Centella Asiatica (Madécassoside)',
      'Squalane Végétal Pur',
      'Panthénol (Pro-vitamine B5)',
    ],
    activesToAvoid: [
      'Alcool dénaturé (Alcohol Denat)',
      'Sulfates agressifs (SLS / SLES)',
      'Acide Salicylique > 1% en phase aiguë',
      'Parfum / Fragrance synthétique',
      'Gommages mécaniques à grains durs',
    ],
    practitionerNotes:
      'Cliente très réceptive aux explications dermo-analytiques. Recommandation d’un arrêt strict des gels nettoyants moussants conventionnels achetés en grande surface.',
  },
  {
    id: 'diag-demo-02',
    date: '2026-10-18',
    clientId: 'cli-01',
    clientName: 'Élodie Laurent',
    clientAge: 34,
    treatmentArea: 'visage',
    specificZone: 'Joues & Pommettes',
    diagnosticSummary:
      'Bilan d’évaluation post-cure (Séance de suivi n°2). Restauration remarquable du film hydrolipidique suite à la cure aux céramides et à la luminothérapie LED. Disparition complète des tiraillements cutanés et diminution drastique des rougeurs réactives.',
    metrics: {
      hydrationScore: 68,
      sebumScore: 50,
      wrinklesScore: 22,
      pigmentSpotsScore: 30,
      rednessSensitivityScore: 28,
      elasticityFirmnessScore: 90,
      poresTextureScore: 40,
    },
    skinTypeAssessment: {
      mainType: 'Mixte équilibrée et apaisée',
      phototypeFitzpatrick: 'Phototype II (Peau claire)',
      hydrationLevel: 'équilibrée',
      lipidLevel: 'normale',
    },
    priorityIssues: [
      {
        issue: 'Consolidation de la fonction barrière',
        severity: 'faible',
        affectedArea: 'Joues et pommettes',
        scientificExplanation: 'Le taux de céramides intercellulaires est stabilisé, la perte en eau est freinée.',
      },
    ],
    cabinProtocol: {
      title: 'Protocole Maintien Éclat & Protection Anti-Oxydante',
      targetGoal: 'Entretenir l’hydratation biomimétique et stimuler la longévité cellulaire',
      duration: '45 minutes',
      steps: [
        {
          stepNumber: 1,
          phase: 'Nettoyage doux dermo-protecteur',
          action: 'Émulsion lactée aux prébiotiques et rinçage à l’eau florale de rose.',
        },
        {
          stepNumber: 2,
          phase: 'Massage décongestionnant Kobido',
          action: 'Manœuvres liftantes profondes avec squalane végétal et champignons de quartz.',
        },
        {
          stepNumber: 3,
          phase: 'Infusion antioxydante',
          action: 'Sérum vitamine C stabilisée et acide hyaluronique pur sous LED jaune (590nm).',
        },
      ],
    },
    homePrescription: {
      morning: [
        {
          step: 'Nettoyage doux',
          category: 'Nettoyant',
          keyActives: 'Eau thermale & lait prébiotique',
          usageTip: 'Tamponner sans frotter',
        },
        {
          step: 'Soin éclat protecteur',
          category: 'Crème jour',
          keyActives: 'Vitamine C 10% + SPF 50',
          usageTip: 'Chaque matin',
        },
      ],
      evening: [
        {
          step: 'Soin nuit réparateur',
          category: 'Crème nuit',
          keyActives: 'Céramides NP & Acide hyaluronique',
          usageTip: 'Sur l’ensemble du visage et du cou',
        },
      ],
      weeklyCare: 'Masque crème hydratant en couche épaisse 1 fois par semaine.',
      lifestyleAdvice: [
        'Continuer l’hydratation interne (1.5L eau/jour)',
        'Conserver la protection solaire minérale quotidienne',
      ],
    },
    recommendedActiveIngredients: [
      'Céramides biomimétiques',
      'Acide Hyaluronique 4D',
      'Niacinamide 5%',
      'Squalane végétal',
    ],
    activesToAvoid: [
      'Alcool dénaturé',
      'Nettoyants sulfatés moussants',
    ],
    practitionerNotes:
      'Progression spectaculaire des scores biométriques : hydratation passée de 32% à 68%, rougeurs réduites de 78% à 28%. La cliente se dit ravie du confort retrouvé.',
  },
];

function AppContent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<MainTab>('scanner');

  // Practitioner user state & auth modals
  const [currentUser, setCurrentUser] = useState<PractitionerUser | null>(() => {
    return getCurrentUser();
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(() => !getCurrentUser());
  const [authCanDismiss, setAuthCanDismiss] = useState<boolean>(() => !!getCurrentUser());
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

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

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('dermesthetic_appointments');
      return saved ? JSON.parse(saved) : SAMPLE_APPOINTMENTS;
    } catch {
      return SAMPLE_APPOINTMENTS;
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

  useEffect(() => {
    try {
      localStorage.setItem('dermesthetic_appointments', JSON.stringify(appointments));
    } catch (e) {
      console.warn(e);
    }
  }, [appointments]);

  const handleAddClient = (newClient: ClientProfile) => {
    setClients((prev) => [newClient, ...prev]);
  };

  const handleDeleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateClient = (updatedClient: ClientProfile) => {
    setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
  };

  const handleAddAppointment = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
    // Synchronize client nextAppointment
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === newApt.clientId || c.fullName.toLowerCase() === newApt.clientName.toLowerCase()) {
          return {
            ...c,
            nextAppointment: `${newApt.date} à ${newApt.startTime}`,
          };
        }
        return c;
      })
    );
  };

  const handleUpdateAppointment = (updatedApt: Appointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === updatedApt.id ? updatedApt : a)));
    if (updatedApt.status === 'confirme' || updatedApt.status === 'en_attente') {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === updatedApt.clientId || c.fullName.toLowerCase() === updatedApt.clientName.toLowerCase()) {
            return {
              ...c,
              nextAppointment: `${updatedApt.date} à ${updatedApt.startTime}`,
            };
          }
          return c;
        })
      );
    }
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
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
            treatmentSessions: [autoSession, ...(c.treatmentSessions || [])],
          };
        }
        return c;
      })
    );
  };

  const handleAddProductToClient = (clientId: string, product: ProductAnalysisResult) => {
    setClientProducts((prev) => {
      const existing = prev[clientId] || [];
      return {
        ...prev,
        [clientId]: [product, ...existing.filter((p) => p.productName !== product.productName)],
      };
    });

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const newRecord: PurchasedProductRecord = {
            id: 'pur-' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            productName: product.productName,
            brand: product.brand,
            category: product.category,
            safetyScore: product.safetyScore,
            repurchaseStatus: product.safetyScore >= 70 ? 'actif' : 'déconseillé',
          };
          return {
            ...c,
            purchasedProducts: [newRecord, ...(c.purchasedProducts || [])],
          };
        }
        return c;
      })
    );
  };

  const handleOpenDiagnosticWithClient = () => {
    setActiveTab('diagnostic');
  };

  const handleAuthSuccess = (user: PractitionerUser) => {
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setShowProfileModal(false);
    setAuthCanDismiss(false);
    setShowAuthModal(true);
  };

  const handleOpenRegisterNew = () => {
    setAuthCanDismiss(true);
    setShowAuthModal(true);
  };

  const handleSwitchAccount = (user: PractitionerUser) => {
    setCurrentUser(user);
    setShowProfileModal(false);
  };

  const handleUserUpdated = (updated: PractitionerUser) => {
    setCurrentUser(updated);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-rose-200 selection:text-rose-950">
      {/* Top Professional Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        instituteName={currentUser ? currentUser.instituteName : undefined}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenAuth={() => {
          setAuthCanDismiss(true);
          setShowAuthModal(true);
        }}
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
            instituteName={currentUser ? currentUser.instituteName : undefined}
            estheticianName={currentUser ? `${currentUser.fullName} (${currentUser.role})` : undefined}
          />
        )}

        {activeTab === 'actives' && <ActivesAndToxicGuideView />}

        {activeTab === 'clients' && (
          <ClientsView
            clients={clients}
            diagnostics={diagnostics}
            appointments={appointments}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointment={handleUpdateAppointment}
            onDeleteAppointment={handleDeleteAppointment}
            onOpenDiagnosticWithClient={handleOpenDiagnosticWithClient}
            instituteName={currentUser ? currentUser.instituteName : undefined}
            estheticianName={currentUser ? `${currentUser.fullName} (${currentUser.role})` : undefined}
          />
        )}
      </main>

      {/* Professional Multilingual Footer */}
      <footer className="no-print bg-white border-t border-stone-200/80 py-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-stone-700">
            <Award className="w-5 h-5 text-rose-800 shrink-0" />
            <div>
              <span className="font-semibold text-stone-900 block">
                {t.footer.tagline}
              </span>
              <span className="text-[11px] text-stone-500">
                {t.footer.compliance}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-stone-500 text-[11px]">
            <span>{t.footer.openBeautyFacts}</span>
            <span>·</span>
            <span>{t.footer.diagnosticModal}</span>
            <span>·</span>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-800 hover:text-rose-950 underline font-medium"
            >
              {t.footer.privacy}
            </a>
            <span>·</span>
            <a
              href="/telecharger-icones"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-800 hover:text-amber-950 underline font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
            >
              {t.footer.playStoreIcons}
            </a>
            <span>·</span>
            {/* Quick Language Selector in Footer */}
            <LanguageSelector variant="modal" showLabel={true} />
          </div>
        </div>
      </footer>

      {/* Authentication & Registration Gate Modal */}
      {(showAuthModal || !currentUser) && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          canDismiss={!!currentUser && authCanDismiss}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Practitioner & Institute Profile Modal */}
      {showProfileModal && currentUser && (
        <UserProfileModal
          currentUser={currentUser}
          clients={clients}
          diagnostics={diagnostics}
          onClose={() => setShowProfileModal(false)}
          onUserUpdated={handleUserUpdated}
          onLogout={handleLogout}
          onSwitchAccount={handleSwitchAccount}
          onOpenNewAccountModal={handleOpenRegisterNew}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
