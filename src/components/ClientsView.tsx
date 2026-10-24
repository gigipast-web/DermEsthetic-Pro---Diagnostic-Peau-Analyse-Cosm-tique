import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Baby,
  FileText,
  ShieldAlert,
  CheckCircle,
  Clock,
  Sparkles,
  Printer,
  FileDown,
  ChevronRight,
  TrendingUp,
  Trash2,
  Plus,
  ShoppingBag,
  Heart,
  Edit,
  Pin,
  Camera,
  Star,
  Activity,
  Droplets,
  DollarSign,
  Send,
  Sliders,
  Check
} from 'lucide-react';
import {
  ClientProfile,
  DiagnosticReport,
  TreatmentSession,
  PurchasedProductRecord,
  PrivateClientNote,
  SkinProgressPhoto,
  Appointment,
  AppointmentStatus,
  AppointmentCareType,
} from '../types';
import { PrintablePrescriptionModal } from './PrintablePrescriptionModal';
import { AppointmentModal } from './AppointmentModal';
import { AppointmentsCalendarView } from './AppointmentsCalendarView';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  clients: ClientProfile[];
  diagnostics: DiagnosticReport[];
  appointments?: Appointment[];
  onAddClient: (client: ClientProfile) => void;
  onUpdateClient: (client: ClientProfile) => void;
  onDeleteClient: (id: string) => void;
  onAddAppointment?: (appointment: Appointment) => void;
  onUpdateAppointment?: (appointment: Appointment) => void;
  onDeleteAppointment?: (id: string) => void;
  onOpenDiagnosticWithClient: (client: ClientProfile) => void;
  instituteName?: string;
  estheticianName?: string;
}

export const ClientsView: React.FC<Props> = ({
  clients,
  diagnostics,
  appointments = [],
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onOpenDiagnosticWithClient,
  instituteName,
  estheticianName,
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [mainViewMode, setMainViewMode] = useState<'dossiers' | 'agenda'>('agenda');
  const [activeDossierTab, setActiveDossierTab] = useState<'analyses' | 'soins' | 'produits' | 'notes' | 'rdv'>('analyses');

  // Modals
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [modalAppointment, setModalAppointment] = useState<Appointment | null>(null);
  const [modalPresetDate, setModalPresetDate] = useState<string | undefined>();
  const [modalPresetClient, setModalPresetClient] = useState<ClientProfile | undefined>();
  const [printReport, setPrintReport] = useState<DiagnosticReport | null>(null);

  // New Client Form State
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState<number | ''>('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newSkinType, setNewSkinType] = useState('Mixte déshydratée');
  const [newFitzpatrick, setNewFitzpatrick] = useState('Phototype II (Peau claire)');
  const [newAllergies, setNewAllergies] = useState('');
  const [newMedical, setNewMedical] = useState('');
  const [newContraindications, setNewContraindications] = useState('');
  const [newSensitivities, setNewSensitivities] = useState('');
  const [isPregnant, setIsPregnant] = useState(false);

  // Add Treatment Session Form State
  const [sessionCareType, setSessionCareType] = useState<'visage' | 'corps'>('visage');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionProtocol, setSessionProtocol] = useState('');
  const [sessionDuration, setSessionDuration] = useState(60);
  const [sessionProducts, setSessionProducts] = useState('');
  const [sessionTech, setSessionTech] = useState('');
  const [sessionReaction, setSessionReaction] = useState('Tolérance excellente');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionPrice, setSessionPrice] = useState(75);

  // Add Purchased Product Form State
  const [productName, setProductName] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [productCategory, setProductCategory] = useState('Soin du Visage');
  const [productPrice, setProductPrice] = useState(30);
  const [productFeedback, setProductFeedback] = useState('');
  const [productRating, setProductRating] = useState(5);

  // Note fast input
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<PrivateClientNote['category']>('observation_cutanee');
  const [newNotePriority, setNewNotePriority] = useState(false);

  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const filteredClients = clients.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.skinType && c.skinType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const clientDiagnostics = diagnostics.filter(
    (d) => d.clientId === activeClient?.id || d.clientName === activeClient?.fullName
  );

  const clientAppointments = appointments
    .filter((a) => a.clientId === activeClient?.id || a.clientName.toLowerCase() === activeClient?.fullName.toLowerCase())
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const upcomingCount = appointments.filter((a) => a.status === 'confirme' || a.status === 'en_attente').length;

  const handleOpenNewAppointment = (presetDate?: string, presetClient?: ClientProfile) => {
    setModalAppointment(null);
    setModalPresetDate(presetDate);
    setModalPresetClient(presetClient || activeClient);
    setShowAppointmentModal(true);
  };

  const handleEditAppointment = (apt: Appointment) => {
    setModalAppointment(apt);
    setModalPresetDate(apt.date);
    const cl = clients.find((c) => c.id === apt.clientId || c.fullName.toLowerCase() === apt.clientName.toLowerCase());
    setModalPresetClient(cl);
    setShowAppointmentModal(true);
  };

  const handleSaveAppointment = (savedApt: Appointment) => {
    if (modalAppointment) {
      onUpdateAppointment?.(savedApt);
    } else {
      onAddAppointment?.(savedApt);
    }
    setShowAppointmentModal(false);
  };

  const handleNavigateToClientDossier = (client: ClientProfile) => {
    setSelectedClientId(client.id);
    setMainViewMode('dossiers');
    setActiveDossierTab('rdv');
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newClient: ClientProfile = {
      id: 'cli-' + Date.now(),
      fullName: newName.trim(),
      age: typeof newAge === 'number' ? newAge : undefined,
      birthDate: newBirthDate.trim() || undefined,
      phone: newPhone.trim() || undefined,
      email: newEmail.trim() || undefined,
      address: newAddress.trim() || undefined,
      skinType: newSkinType,
      fitzpatrickScale: newFitzpatrick,
      knownAllergies: newAllergies ? newAllergies.split(',').map((s) => s.trim()) : [],
      medicalHistory: newMedical ? newMedical.split(',').map((s) => s.trim()) : [],
      contraindications: newContraindications ? newContraindications.split(',').map((s) => s.trim()) : [],
      isPregnant,
      sensitivities: newSensitivities.trim() || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      diagnosticsCount: 0,
      lastVisit: new Date().toISOString().split('T')[0],
      treatmentSessions: [],
      purchasedProducts: [],
      privateNotes: [],
    };

    onAddClient(newClient);
    setSelectedClientId(newClient.id);
    setShowNewClientModal(false);

    // Reset
    setNewName('');
    setNewAge('');
    setNewBirthDate('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setNewAllergies('');
    setNewMedical('');
    setNewContraindications('');
    setNewSensitivities('');
    setIsPregnant(false);
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient || !sessionTitle.trim()) return;

    const newSession: TreatmentSession = {
      id: 'sess-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      careType: sessionCareType,
      title: sessionTitle.trim(),
      protocolSummary: sessionProtocol.trim(),
      durationMinutes: sessionDuration,
      productsUsedCabin: sessionProducts.split(',').map((s) => s.trim()).filter(Boolean),
      technologiesUsed: sessionTech ? sessionTech.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      skinReaction: sessionReaction.trim(),
      notes: sessionNotes.trim() || undefined,
      price: sessionPrice,
    };

    const updated: ClientProfile = {
      ...activeClient,
      lastVisit: newSession.date,
      treatmentSessions: [newSession, ...(activeClient.treatmentSessions || [])],
    };

    onUpdateClient(updated);
    setShowAddSessionModal(false);
    setSessionTitle('');
    setSessionProtocol('');
    setSessionProducts('');
    setSessionTech('');
    setSessionNotes('');
  };

  const handleAddPurchasedProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient || !productName.trim()) return;

    const newPurchased: PurchasedProductRecord = {
      id: 'purch-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      productName: productName.trim(),
      brand: productBrand.trim() || 'Institut',
      category: productCategory,
      price: productPrice,
      repurchaseStatus: 'actif',
      clientFeedback: productFeedback.trim() || undefined,
      rating: productRating,
    };

    const updated: ClientProfile = {
      ...activeClient,
      purchasedProducts: [newPurchased, ...(activeClient.purchasedProducts || [])],
    };

    onUpdateClient(updated);
    setShowAddProductModal(false);
    setProductName('');
    setProductBrand('');
    setProductFeedback('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient || !newNoteContent.trim()) return;

    const newNote: PrivateClientNote = {
      id: 'note-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      author: 'Émilie (Esthéticienne)',
      content: newNoteContent.trim(),
      category: newNoteCategory,
      isImportant: newNotePriority,
    };

    const updated: ClientProfile = {
      ...activeClient,
      privateNotes: [newNote, ...(activeClient.privateNotes || [])],
    };

    onUpdateClient(updated);
    setNewNoteContent('');
    setNewNotePriority(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-700 mb-1">
            <Calendar className="w-4 h-4" />
            <span>Gestion Cabine, Rendez-vous & Dossiers Clients</span>
          </div>
          <h1 className="text-3xl font-serif text-stone-900 font-bold">
            {mainViewMode === 'agenda' ? 'Agenda & Planification des Visites' : t.clients.title}
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            {mainViewMode === 'agenda'
              ? 'Planifiez les créneaux de soins cabine, suivez le calendrier récapitulatif des visites et synchronisez les dossiers clientes.'
              : t.clients.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => handleOpenNewAppointment()}
            className="px-4 py-2.5 bg-rose-950 hover:bg-rose-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-rose-300" />
            <span>Nouveau Rendez-vous</span>
          </button>
          <button
            onClick={() => setShowNewClientModal(true)}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.clients.newClientBtn}</span>
          </button>
        </div>
      </div>

      {/* Main Mode Segmented Navigation Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => setMainViewMode('agenda')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              mainViewMode === 'agenda'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-rose-800" />
            <span>Agenda & Calendrier des Visites</span>
            {upcomingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900">
                {upcomingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMainViewMode('dossiers')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              mainViewMode === 'dossiers'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-4 h-4 text-stone-700" />
            <span>Dossiers Clients & Bilans ({clients.length})</span>
          </button>
        </div>

        <div className="text-xs text-stone-500 font-medium px-2">
          {mainViewMode === 'agenda' ? (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              Créneaux horaires, cabines et suivi des rendez-vous
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              Fiches diagnostiques, prescriptions et progrès
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area: Either Agenda View or Dossiers Grid */}
      {mainViewMode === 'agenda' ? (
        <AppointmentsCalendarView
          appointments={appointments}
          clients={clients}
          onAddAppointment={onAddAppointment || (() => {})}
          onUpdateAppointment={onUpdateAppointment || (() => {})}
          onDeleteAppointment={onDeleteAppointment || (() => {})}
          onSelectClientDossier={handleNavigateToClientDossier}
          onOpenNewAppointmentModal={(presetDate, presetClient) => handleOpenNewAppointment(presetDate, presetClient)}
          onEditAppointment={handleEditAppointment}
        />
      ) : (
        /* Main Grid: Client List on Left, Active Record on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Client Sidebar List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder={t.clients.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 shadow-2xs"
            />
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden">
            {filteredClients.map((client) => {
              const isSelected = client.id === selectedClientId;
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`p-4 cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-rose-50/70 border-l-4 border-l-rose-700 text-stone-900'
                      : 'hover:bg-stone-50/70 text-stone-700'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">{client.fullName}</span>
                      {client.isPregnant && (
                        <span className="p-0.5 bg-rose-100 text-rose-800 rounded-full" title="Femme enceinte">
                          <Baby className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500 truncate">{client.skinType || 'Sans diagnostic'}</div>
                    <div className="text-[10px] text-stone-400">
                      Dernier soin : {client.lastVisit || client.createdAt}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-rose-700' : 'text-stone-300'}`} />
                </div>
              );
            })}

            {filteredClients.length === 0 && (
              <div className="p-8 text-center text-xs text-stone-400">
                Aucune cliente trouvée correspondant à la recherche.
              </div>
            )}
          </div>
        </div>

        {/* Client Detailed Record */}
        <div className="lg:col-span-8">
          {activeClient ? (
            <div className="space-y-6">
              {/* Identity Banner */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-serif font-bold text-stone-900">
                        {activeClient.fullName}
                      </h2>
                      {activeClient.isPregnant && (
                        <span className="bg-rose-100 text-rose-900 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <Baby className="w-3.5 h-3.5" /> Enceinte (Alerte rétinoïdes & H.E)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Cliente de l'institut depuis le {activeClient.createdAt}
                      {activeClient.nextAppointment && (
                        <span className="text-rose-800 font-semibold ml-2">
                          · Prochain RDV : {activeClient.nextAppointment}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleOpenNewAppointment(undefined, activeClient)}
                      className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-rose-300" />
                      Planifier un RDV
                    </button>
                    <button
                      onClick={() => onOpenDiagnosticWithClient(activeClient)}
                      className="px-3.5 py-2 bg-rose-950 hover:bg-rose-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Lancer Bilan Peau
                    </button>
                    <button
                      onClick={() => onDeleteClient(activeClient.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Supprimer la fiche cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Téléphone</span>
                    <span className="font-medium text-stone-800 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-stone-400" />
                      {activeClient.phone || 'Non renseigné'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Email</span>
                    <span className="font-medium text-stone-800 flex items-center gap-1 mt-0.5 truncate">
                      <Mail className="w-3 h-3 text-stone-400" />
                      {activeClient.email || 'Non renseigné'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Âge</span>
                    <span className="font-medium text-stone-800 mt-0.5 block">
                      {activeClient.age ? `${activeClient.age} ans` : 'Non renseigné'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Phototype</span>
                    <span className="font-medium text-stone-800 mt-0.5 block">
                      {activeClient.fitzpatrickScale || 'Fitzpatrick II'}
                    </span>
                  </div>
                </div>

                {/* Skin Type & Known Allergies & Medical History */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                    <span className="font-semibold text-stone-800 block mb-1">Type de Peau & Diagnostic</span>
                    <p className="text-stone-600 text-[11px] leading-relaxed">{activeClient.skinType}</p>
                  </div>

                  <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/70">
                    <span className="font-semibold text-rose-950 block mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Allergies Connues
                    </span>
                    {activeClient.knownAllergies && activeClient.knownAllergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activeClient.knownAllergies.map((all, i) => (
                          <span key={i} className="bg-white text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[10px]">
                            {all}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-stone-500 text-[11px]">Aucune allergie cutanée signalée</span>
                    )}
                  </div>

                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/70">
                    <span className="font-semibold text-amber-950 block mb-1">Contre-Indications</span>
                    {activeClient.contraindications && activeClient.contraindications.length > 0 ? (
                      <ul className="text-amber-900 text-[10px] list-disc pl-3 space-y-0.5">
                        {activeClient.contraindications.map((ci, i) => (
                          <li key={i}>{ci}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-stone-500 text-[11px]">Aucune contre-indication stricte</span>
                    )}
                  </div>
                </div>
              </div>

              {/* DOSSIER CLIENT TABS (Analyses, Soins, Produits, Notes) */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                {/* Tabs bar */}
                <div className="flex border-b border-stone-200 bg-stone-50/70 overflow-x-auto">
                  <button
                    onClick={() => setActiveDossierTab('analyses')}
                    className={`px-5 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                      activeDossierTab === 'analyses'
                        ? 'border-rose-900 text-rose-950 bg-white'
                        : 'border-transparent text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Analyses de Peau ({clientDiagnostics.length})
                  </button>
                  <button
                    onClick={() => setActiveDossierTab('soins')}
                    className={`px-5 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                      activeDossierTab === 'soins'
                        ? 'border-rose-900 text-rose-950 bg-white'
                        : 'border-transparent text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Soins Cabine Effectués ({activeClient.treatmentSessions?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveDossierTab('produits')}
                    className={`px-5 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                      activeDossierTab === 'produits'
                        ? 'border-rose-900 text-rose-950 bg-white'
                        : 'border-transparent text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Produits Utilisés & Achetés ({activeClient.purchasedProducts?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveDossierTab('notes')}
                    className={`px-5 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                      activeDossierTab === 'notes'
                        ? 'border-rose-900 text-rose-950 bg-white'
                        : 'border-transparent text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Notes Personnelles ({activeClient.privateNotes?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveDossierTab('rdv')}
                    className={`px-5 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                      activeDossierTab === 'rdv'
                        ? 'border-rose-900 text-rose-950 bg-white'
                        : 'border-transparent text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-rose-800" />
                    Rendez-vous ({clientAppointments.length})
                  </button>
                </div>

                <div className="p-6">
                  {/* TAB 1: Analyses de Peau (Visage & Corps) */}
                  {activeDossierTab === 'analyses' && (
                    <div className="space-y-4">
                      {/* Treatment Progress Evolution Tracker when multiple diagnostics exist */}
                      {clientDiagnostics.length >= 2 && (() => {
                        const sorted = [...clientDiagnostics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        const initial = sorted[0];
                        const latest = sorted[sorted.length - 1];
                        const hydraDiff = latest.metrics.hydrationScore - initial.metrics.hydrationScore;
                        const redDiff = latest.metrics.rednessSensitivityScore - initial.metrics.rednessSensitivityScore;
                        const firmDiff = latest.metrics.elasticityFirmnessScore - initial.metrics.elasticityFirmnessScore;

                        return (
                          <div className="p-4 bg-gradient-to-br from-rose-50/70 via-stone-50 to-emerald-50/40 rounded-xl border border-rose-200/90 space-y-3 shadow-2xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-rose-700" />
                                <span className="font-serif font-bold text-sm text-stone-900">
                                  Évolution Cutanée & Progrès du Traitement
                                </span>
                              </div>
                              <span className="text-[10px] text-stone-500 bg-white px-2.5 py-1 rounded-full border border-stone-200 shadow-2xs">
                                Du {initial.date} au {latest.date}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                              {/* Hydration Evolution */}
                              <div className="bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs space-y-0.5">
                                <span className="text-[10px] text-stone-500 block">Hydratation</span>
                                <div className="font-bold text-sm flex items-center justify-center gap-1 text-emerald-700">
                                  <span>{latest.metrics.hydrationScore}%</span>
                                  <span className="text-[10px] font-semibold">({hydraDiff >= 0 ? `+${hydraDiff}%` : `${hydraDiff}%`})</span>
                                </div>
                                <span className="text-[9px] text-stone-400 block">Initial : {initial.metrics.hydrationScore}%</span>
                              </div>

                              {/* Redness Evolution */}
                              <div className="bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs space-y-0.5">
                                <span className="text-[10px] text-stone-500 block">Apaisement Rougeurs</span>
                                <div className="font-bold text-sm flex items-center justify-center gap-1 text-emerald-700">
                                  <span>{latest.metrics.rednessSensitivityScore}%</span>
                                  <span className="text-[10px] font-semibold">({redDiff <= 0 ? `${redDiff}%` : `+${redDiff}%`})</span>
                                </div>
                                <span className="text-[9px] text-stone-400 block">Initial : {initial.metrics.rednessSensitivityScore}%</span>
                              </div>

                              {/* Firmness Evolution */}
                              <div className="bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs space-y-0.5">
                                <span className="text-[10px] text-stone-500 block">Fermeté / Tonicité</span>
                                <div className="font-bold text-sm flex items-center justify-center gap-1 text-emerald-700">
                                  <span>{latest.metrics.elasticityFirmnessScore}%</span>
                                  <span className="text-[10px] font-semibold">({firmDiff >= 0 ? `+${firmDiff}%` : `${firmDiff}%`})</span>
                                </div>
                                <span className="text-[9px] text-stone-400 block">Initial : {initial.metrics.elasticityFirmnessScore}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {clientDiagnostics.length > 0 ? (
                        <div className="space-y-3">
                          {clientDiagnostics.map((diag) => (
                            <div
                              key={diag.id}
                              className="p-4 rounded-xl border border-stone-200 hover:border-stone-300 transition-all space-y-2.5 bg-stone-50/50"
                            >
                              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-stone-900">
                                      {diag.treatmentArea === 'corps' ? 'Soin Corporel' : 'Soin Facial'} : {diag.specificZone}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-semibold">
                                      {diag.date}
                                    </span>
                                  </div>
                                  <p className="text-xs text-rose-900 font-medium font-serif italic">
                                    "{diag.cabinProtocol.title}" ({diag.cabinProtocol.duration})
                                  </p>
                                </div>

                                <button
                                  onClick={() => setPrintReport(diag)}
                                  className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-2xs cursor-pointer transition-colors"
                                >
                                  <FileDown className="w-3.5 h-3.5" />
                                  Exporter en PDF / Imprimer
                                </button>
                              </div>

                              <p className="text-xs text-stone-600 line-clamp-2">
                                {diag.diagnosticSummary}
                              </p>

                              {/* Mini metrics indicators */}
                              <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                                <span className="bg-white border border-stone-200 px-2 py-1 rounded text-stone-700">
                                  💧 Hydratation : <strong>{diag.metrics.hydrationScore}%</strong>
                                </span>
                                <span className="bg-white border border-stone-200 px-2 py-1 rounded text-stone-700">
                                  🌿 Sébum : <strong>{diag.metrics.sebumScore}%</strong>
                                </span>
                                <span className="bg-white border border-stone-200 px-2 py-1 rounded text-stone-700">
                                  ✨ Fermeté : <strong>{diag.metrics.elasticityFirmnessScore}%</strong>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 bg-stone-50 rounded-xl text-center text-xs text-stone-400 space-y-2">
                          <Activity className="w-8 h-8 mx-auto text-stone-300" />
                          <p>Aucune analyse de peau enregistrée pour le moment.</p>
                          <button
                            onClick={() => onOpenDiagnosticWithClient(activeClient)}
                            className="text-rose-800 font-semibold underline text-xs"
                          >
                            Réaliser le premier diagnostic de peau (visage ou corps)
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: Soins en Cabine Effectués */}
                  {activeDossierTab === 'soins' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-stone-500">
                          Prestations et protocoles appliqués en institut
                        </span>
                        <button
                          onClick={() => setShowAddSessionModal(true)}
                          className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Enregistrer un Soin Réalisé
                        </button>
                      </div>

                      {activeClient.treatmentSessions && activeClient.treatmentSessions.length > 0 ? (
                        <div className="space-y-3">
                          {activeClient.treatmentSessions.map((sess) => (
                            <div
                              key={sess.id}
                              className="p-4 rounded-xl border border-stone-200 hover:border-stone-300 transition-all space-y-2 bg-stone-50/40 text-xs"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-stone-900">{sess.title}</span>
                                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                                      {sess.careType === 'corps' ? 'Corps' : 'Visage'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-stone-500 mt-0.5">
                                    Le {sess.date} · Durée : {sess.durationMinutes} min {sess.price ? `· Tarif : ${sess.price} €` : ''}
                                  </div>
                                </div>
                              </div>

                              <p className="text-stone-700 leading-relaxed text-[11px]">{sess.protocolSummary}</p>

                              {sess.productsUsedCabin && sess.productsUsedCabin.length > 0 && (
                                <div className="text-[11px] text-rose-950">
                                  <strong>Produits utilisés en cabine :</strong> {sess.productsUsedCabin.join(', ')}
                                </div>
                              )}

                              {sess.technologiesUsed && sess.technologiesUsed.length > 0 && (
                                <div className="text-[11px] text-indigo-950">
                                  <strong>Technologies & Appareils :</strong> {sess.technologiesUsed.join(', ')}
                                </div>
                              )}

                              {sess.skinReaction && (
                                <div className="p-2 bg-white rounded-lg border border-stone-200 text-[11px] text-stone-600">
                                  <strong>Réaction cutanée observée :</strong> {sess.skinReaction}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 bg-stone-50 rounded-xl text-center text-xs text-stone-400">
                          Aucun soin cabine enregistré. Cliquez sur "Enregistrer un Soin Réalisé" après la prestation.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Produits Utilisés & Achetés */}
                  {activeDossierTab === 'produits' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-stone-500">
                          Routine prescrite à domicile & achats effectués en boutique salon
                        </span>
                        <button
                          onClick={() => setShowAddProductModal(true)}
                          className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Ajouter un Produit Acheté
                        </button>
                      </div>

                      {activeClient.purchasedProducts && activeClient.purchasedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {activeClient.purchasedProducts.map((prod) => (
                            <div
                              key={prod.id}
                              className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-bold text-stone-900 text-sm block">{prod.productName}</span>
                                  <span className="text-[11px] text-stone-500">{prod.brand} · {prod.category}</span>
                                </div>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 capitalize">
                                  {prod.repurchaseStatus}
                                </span>
                              </div>

                              <div className="flex justify-between items-center text-[11px] text-stone-600 pt-1 border-t border-stone-200/60">
                                <span>Acheté le {prod.date}</span>
                                {prod.price && <span className="font-semibold">{prod.price} €</span>}
                              </div>

                              {prod.clientFeedback && (
                                <p className="text-[11px] text-stone-600 italic bg-white p-2 rounded-lg border border-stone-200/80">
                                  "{prod.clientFeedback}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 bg-stone-50 rounded-xl text-center text-xs text-stone-400">
                          Aucun produit d'entretien enregistré. Ajoutez les soins vendus ou apportés par la cliente.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: Notes Personnelles de l'Esthéticienne */}
                  {activeDossierTab === 'notes' && (
                    <div className="space-y-4">
                      {/* Fast Note Creation Form */}
                      <form onSubmit={handleAddNote} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-xs">
                        <div className="font-semibold text-stone-800">
                          Ajouter une note personnelle confidentielle :
                        </div>
                        <textarea
                          rows={2}
                          required
                          placeholder="Ex: Préfère les odeurs de camomille. Attention rougeurs légères lors du peeling lactique..."
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs"
                        />
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex items-center gap-3">
                            <select
                              value={newNoteCategory}
                              onChange={(e) => setNewNoteCategory(e.target.value as any)}
                              className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                            >
                              <option value="observation_cutanee">Observation Cutanée</option>
                              <option value="preference_cliente">Préférence Cliente</option>
                              <option value="reaction_produit">Réaction Produit</option>
                              <option value="objectif_suivi">Objectif de Suivi</option>
                            </select>
                            <label className="flex items-center gap-1.5 text-rose-900 font-semibold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newNotePriority}
                                onChange={(e) => setNewNotePriority(e.target.checked)}
                                className="rounded text-rose-800"
                              />
                              <span>Prioritaire (Épingler)</span>
                            </label>
                          </div>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-rose-950 hover:bg-rose-900 text-white rounded-lg text-xs font-semibold shadow-2xs"
                          >
                            Enregistrer la Note
                          </button>
                        </div>
                      </form>

                      {/* Notes List */}
                      {activeClient.privateNotes && activeClient.privateNotes.length > 0 ? (
                        <div className="space-y-2.5">
                          {activeClient.privateNotes.map((note) => (
                            <div
                              key={note.id}
                              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                                note.isImportant
                                  ? 'bg-rose-50/70 border-rose-300'
                                  : 'bg-stone-50/50 border-stone-200'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  {note.isImportant && <Pin className="w-3.5 h-3.5 text-rose-700" />}
                                  <span className="font-semibold text-stone-900">{note.author}</span>
                                  <span className="text-[10px] text-stone-400">· {note.date}</span>
                                </div>
                                <span className="text-[10px] uppercase font-bold text-stone-500">
                                  {note.category.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <p className="text-stone-700 leading-relaxed text-[11px]">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-stone-400">
                          Aucune note enregistrée pour le moment.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: Rendez-vous & Créneaux de la Cliente */}
                  {activeDossierTab === 'rdv' && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                          <span className="font-semibold text-stone-900 block text-xs">
                            Historique et prochaines visites de {activeClient.fullName}
                          </span>
                          <span className="text-[11px] text-stone-500">
                            {clientAppointments.length} visite{clientAppointments.length > 1 ? 's' : ''} enregistrée{clientAppointments.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenNewAppointment(undefined, activeClient)}
                          className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Planifier un Rendez-vous
                        </button>
                      </div>

                      {clientAppointments.length > 0 ? (
                        <div className="space-y-3">
                          {clientAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:border-stone-300 transition-all space-y-2.5 text-xs"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm text-stone-900">
                                      {apt.serviceTitle}
                                    </span>
                                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                                      {apt.serviceType}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-stone-500">
                                    Le <strong>{apt.date}</strong> de <strong>{apt.startTime} à {apt.endTime}</strong> ({apt.durationMinutes} min)
                                    {apt.cabin && ` · ${apt.cabin}`}
                                    {apt.price ? ` · ${apt.price} €` : ''}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                    apt.status === 'confirme'
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                      : apt.status === 'en_attente'
                                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                                      : apt.status === 'termine'
                                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                                      : 'bg-stone-100 text-stone-500 border-stone-200'
                                  }`}>
                                    {apt.status === 'confirme' ? 'Confirmé' : apt.status === 'en_attente' ? 'En attente' : apt.status === 'termine' ? 'Effectué' : 'Annulé'}
                                  </span>

                                  <button
                                    onClick={() => handleEditAppointment(apt)}
                                    className="px-2 py-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg text-xs transition-colors cursor-pointer"
                                  >
                                    Modifier
                                  </button>
                                </div>
                              </div>

                              {apt.notes && (
                                <p className="text-[11px] text-stone-600 bg-white p-2 rounded-lg border border-stone-200/80 italic">
                                  "{apt.notes}"
                                </p>
                              )}

                              <div className="flex items-center gap-3 pt-1 border-t border-stone-200/60 text-[11px]">
                                {apt.status !== 'confirme' && (
                                  <button
                                    onClick={() => onUpdateAppointment?.({ ...apt, status: 'confirme' })}
                                    className="text-emerald-700 hover:underline font-semibold cursor-pointer"
                                  >
                                    Confirmer le créneau
                                  </button>
                                )}
                                {apt.status !== 'termine' && (
                                  <button
                                    onClick={() => onUpdateAppointment?.({ ...apt, status: 'termine' })}
                                    className="text-blue-700 hover:underline font-semibold cursor-pointer"
                                  >
                                    Marquer comme effectué
                                  </button>
                                )}
                                {apt.status !== 'annule' && (
                                  <button
                                    onClick={() => onUpdateAppointment?.({ ...apt, status: 'annule' })}
                                    className="text-stone-500 hover:underline cursor-pointer"
                                  >
                                    Annuler
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 bg-stone-50 rounded-xl text-center text-xs text-stone-400 space-y-2">
                          <Calendar className="w-8 h-8 mx-auto text-stone-300" />
                          <p>Aucun rendez-vous planifié pour {activeClient.fullName}.</p>
                          <button
                            onClick={() => handleOpenNewAppointment(undefined, activeClient)}
                            className="text-rose-800 font-semibold underline text-xs cursor-pointer"
                          >
                            Planifier le prochain soin cabine
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400">
              Sélectionnez une cliente dans la liste à gauche.
            </div>
          )}
        </div>
      </div>
      )}

      {/* MODAL 1: CREATE NEW CLIENT */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden my-auto border border-stone-200">
            <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Créer une Nouvelle Fiche Cliente
              </h3>
              <button
                onClick={() => setShowNewClientModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nom Complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sophie Martin"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Âge</label>
                  <input
                    type="number"
                    placeholder="Ex: 38"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    placeholder="06 ..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Adresse postale</label>
                <input
                  type="text"
                  placeholder="Ex: 12 Rue du Faubourg, 75008 Paris"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Type de Peau Général</label>
                <input
                  type="text"
                  placeholder="Ex: Peau mixte sensible, sujette à la couperose"
                  value={newSkinType}
                  onChange={(e) => setNewSkinType(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Allergies Connues (séparées par virgules)</label>
                <input
                  type="text"
                  placeholder="Ex: Parfums de synthèse, Sulfates, Rétinol pur"
                  value={newAllergies}
                  onChange={(e) => setNewAllergies(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Contre-indications cabine</label>
                <input
                  type="text"
                  placeholder="Ex: Pas de radiofréquence, éviter vapeur trop chaude"
                  value={newContraindications}
                  onChange={(e) => setNewContraindications(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <input
                  type="checkbox"
                  id="preg-check-modal"
                  checked={isPregnant}
                  onChange={(e) => setIsPregnant(e.target.checked)}
                  className="rounded text-rose-800"
                />
                <label htmlFor="preg-check-modal" className="font-semibold text-rose-900 cursor-pointer">
                  Cliente enceinte ou allaitante (active les alertes sécurité maternité)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-950 hover:bg-rose-900 text-white rounded-xl font-semibold shadow-xs"
                >
                  Créer la Fiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD TREATMENT SESSION */}
      {showAddSessionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden my-auto border border-stone-200">
            <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Enregistrer un Soin Réalisé en Cabine
              </h3>
              <button onClick={() => setShowAddSessionModal(false)} className="text-stone-400 hover:text-stone-700">
                Fermer
              </button>
            </div>

            <form onSubmit={handleAddSession} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Cible</label>
                  <select
                    value={sessionCareType}
                    onChange={(e) => setSessionCareType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  >
                    <option value="visage">Soin du Visage</option>
                    <option value="corps">Soin du Corps</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Durée (minutes)</label>
                  <input
                    type="number"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(parseInt(e.target.value) || 45)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Intitulé du Soin *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Soin Liftant Peptides & Luminothérapie LED"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Protocole Réalisé (étapes clés)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Nettoyage prébiotique, peeling enzymatique, modelage quartz rose, masque alginate, LED rouge 15 min..."
                  value={sessionProtocol}
                  onChange={(e) => setSessionProtocol(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Produits Cabine Utilisés</label>
                  <input
                    type="text"
                    placeholder="Sérum Peptides, Masque Alginate..."
                    value={sessionProducts}
                    onChange={(e) => setSessionProducts(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Technologies Utilisées</label>
                  <input
                    type="text"
                    placeholder="LED, Vapeur, Ultrasons..."
                    value={sessionTech}
                    onChange={(e) => setSessionTech(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Réaction Cutanée</label>
                  <input
                    type="text"
                    placeholder="Tolérance parfaite, rougeurs apaisées..."
                    value={sessionReaction}
                    onChange={(e) => setSessionReaction(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tarif (€)</label>
                  <input
                    type="number"
                    value={sessionPrice}
                    onChange={(e) => setSessionPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddSessionModal(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-950 text-white rounded-xl font-semibold shadow-xs"
                >
                  Enregistrer le Soin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD PURCHASED PRODUCT */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden my-auto border border-stone-200">
            <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Ajouter un Produit Acheté / Routine
              </h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-stone-400 hover:text-stone-700">
                Fermer
              </button>
            </div>

            <form onSubmit={handleAddPurchasedProduct} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nom du Produit *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sérum Céramides Pro"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Marque</label>
                  <input
                    type="text"
                    placeholder="Ex: Laboratoire Institut"
                    value={productBrand}
                    onChange={(e) => setProductBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Catégorie</label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  >
                    <option value="Soin du Visage">Soin du Visage</option>
                    <option value="Soin du Corps">Soin du Corps</option>
                    <option value="Nettoyant / Démaquillant">Nettoyant / Démaquillant</option>
                    <option value="Protection Solaire">Protection Solaire</option>
                    <option value="Soin Minceur">Soin Minceur</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Prix (€)</label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Avis / Ressenti de la cliente</label>
                <input
                  type="text"
                  placeholder="Ex: Apprécie la texture légère, aucune sensation de tiraillement..."
                  value={productFeedback}
                  onChange={(e) => setProductFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-950 text-white rounded-xl font-semibold shadow-xs"
                >
                  Ajouter au Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {printReport && (
        <PrintablePrescriptionModal
          report={printReport}
          onClose={() => setPrintReport(null)}
          instituteName={instituteName}
          estheticianName={estheticianName}
        />
      )}

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onSave={handleSaveAppointment}
        clients={clients}
        initialClient={modalPresetClient}
        initialDate={modalPresetDate}
        initialAppointment={modalAppointment}
      />
    </div>
  );
};
