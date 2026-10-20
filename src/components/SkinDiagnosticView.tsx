import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Camera,
  Upload,
  User,
  Heart,
  Activity,
  Layers,
  Clock,
  Printer,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  RefreshCw,
  Sun,
  ShieldCheck,
  Zap,
  Sliders,
  Check,
  TrendingUp,
  Droplets,
  Flame,
  Gauge,
  Image as ImageIcon,
  ArrowRight,
  BookmarkCheck
} from 'lucide-react';
import { TreatmentArea, DiagnosticReport, ClientProfile, SkinMetrics } from '../types';
import { analyzeSkinApi } from '../services/apiService';
import { PrintablePrescriptionModal } from './PrintablePrescriptionModal';

interface Props {
  clients: ClientProfile[];
  onSaveReport?: (report: DiagnosticReport, clientId?: string) => void;
  instituteName?: string;
  estheticianName?: string;
}

const FACE_ZONES = [
  { id: 'zone_t', name: 'Zone T (Front, Nez, Menton)', desc: 'Pores dilatés, hyperséborrhée, comédons' },
  { id: 'joues_pommettes', name: 'Joues & Pommettes', desc: 'Rougeurs, couperose, déshydratation, sensibilité' },
  { id: 'contour_yeux', name: 'Contour des Yeux', desc: 'Cernes vasculaires/pigmentaires, ridules, poches' },
  { id: 'ovale_visage', name: 'Ovale du Visage & Bas Joues', desc: 'Perte de fermeté, affaissement des volumes' },
  { id: 'cou_decollete', name: 'Cou & Décolleté', desc: 'Plissotement solaire, taches, manque de tonus' },
  { id: 'visage_global', name: 'Visage Complet (Global)', desc: 'Bilan complet d’éclat et texture globale' },
];

const BODY_ZONES = [
  { id: 'jambes_cuisses', name: 'Cuisses & Jambes', desc: 'Cellulite aqueuse/fibreuse, jambes lourdes, capitons' },
  { id: 'fessiers_culotte', name: 'Fessiers & Culotte de Cheval', desc: 'Perte de galbe, peau d’orange adipeuse' },
  { id: 'ventre_taille', name: 'Ventre & Taille', desc: 'Relâchement post-maternité, vergetures, perte de tonicité' },
  { id: 'bras', name: 'Bras (Face postérieure)', desc: 'Relâchement cutané, kératose pilaire' },
  { id: 'dos', name: 'Dos & Épaules', desc: 'Imperfections sébacées, microkystes, taches' },
  { id: 'buste_decollete_corps', name: 'Buste & Décolleté', desc: 'Tonicité des tissus de soutien, taches de soleil' },
];

const FITZPATRICK_TYPES = [
  { level: 'Phototype I', label: 'Peau très claire, taches de rousseur, brûle toujours, ne bronze jamais' },
  { level: 'Phototype II', label: 'Peau claire, cheveux blonds/châtains, brûle souvent, bronze difficilement' },
  { level: 'Phototype III', label: 'Peau intermédiaire, cheveux châtains/bruns, brûle modérément, bronze graduellement' },
  { level: 'Phototype IV', label: 'Peau mate méditerranéenne, brûle rarement, bronze facilement' },
  { level: 'Phototype V', label: 'Peau brune foncée, brûle très exceptionnellement, pigmentation intense' },
  { level: 'Phototype VI', label: 'Peau noire, ne brûle jamais, forte propension aux taches post-inflammatoires' },
];

const FACE_CONCERNS_OPTIONS = [
  'Déshydratation & Tiraillements',
  'Pores dilatés & Excès de sébum',
  'Rides & Ridules installées',
  'Perte de fermeté & Relâchement',
  'Taches pigmentaires & Teint terne',
  'Rougeurs diffuses / Couperose',
  'Acné adulte & Microkystes',
  'Sensibilité aux changements thermiques',
];

const BODY_CONCERNS_OPTIONS = [
  'Cellulite adipeuse / Peau d’orange',
  'Cellulite aqueuse & Rétention d’eau',
  'Relâchement cutané & Manque de fermeté',
  'Vergetures (rouges ou blanches)',
  'Sécheresse corporelle sévère (peau de crocodile)',
  'Kératose pilaire (petits boutons rugueux)',
  'Jambes lourdes & Stase veineuse',
  'Imperfections et comédons du dos',
];

const SENSATIONS_OPTIONS = [
  'Tiraillements après la douche',
  'Sensation de brûlure / picotements',
  'Brillance sur la zone médiane en journée',
  'Démangeaisons fréquentes',
  'Pression / lourdeur des membres',
  'Rugosité au toucher',
];

export const SkinDiagnosticView: React.FC<Props> = ({
  clients,
  onSaveReport,
  instituteName,
  estheticianName,
}) => {
  const [treatmentArea, setTreatmentArea] = useState<TreatmentArea>('visage');
  const [selectedZone, setSelectedZone] = useState<string>('Visage Complet (Global)');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [clientName, setClientName] = useState<string>(clients[0]?.fullName || 'Élodie Laurent');
  const [clientAge, setClientAge] = useState<number>(clients[0]?.age || 34);
  const [skinType, setSkinType] = useState<string>('Mixte déshydratée avec tiraillements');
  const [fitzpatrick, setFitzpatrick] = useState<string>('Phototype II');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([
    'Déshydratation & Tiraillements',
    'Rougeurs diffuses / Couperose',
  ]);
  const [selectedSensations, setSelectedSensations] = useState<string[]>([
    'Tiraillements après la douche',
    'Sensation de brûlure / picotements',
  ]);
  const [practitionerNotes, setPractitionerNotes] = useState<string>(
    'Film hydrolipidique altéré sur les joues. Desquamation fine au niveau des sourcils. Bonne élasticité générale.'
  );

  // Photos: Before & After
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoAfterBase64, setPhotoAfterBase64] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Loading & Result state
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Auto-fill when selecting a saved client
  const handleClientSelect = (id: string) => {
    setSelectedClientId(id);
    const found = clients.find((c) => c.id === id);
    if (found) {
      setClientName(found.fullName);
      if (found.age) setClientAge(found.age);
      if (found.skinType) setSkinType(found.skinType);
      if (found.fitzpatrickScale) {
        const match = FITZPATRICK_TYPES.find((f) => found.fitzpatrickScale?.includes(f.level));
        if (match) setFitzpatrick(match.level);
      }
    }
  };

  const toggleConcern = (item: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const toggleSensation = (item: string) => {
    setSelectedSensations((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  // Start skin macro camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    setPhotoBase64(canvas.toDataURL('image/jpeg', 0.85));
    stopCamera();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isAfter = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (isAfter) {
        setPhotoAfterBase64(event.target?.result as string);
      } else {
        setPhotoBase64(event.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateDiagnostic = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const generated = await analyzeSkinApi({
        treatmentArea,
        specificZone: selectedZone,
        clientName: clientName || 'Cliente',
        clientAge,
        skinType,
        concerns: selectedConcerns,
        sensations: selectedSensations,
        practitionerNotes,
        photoBase64: photoBase64 || undefined,
      });

      if (photoAfterBase64) {
        generated.photoAfterUrl = photoAfterBase64;
      }
      if (selectedClientId) {
        generated.clientId = selectedClientId;
      }

      setReport(generated);
      if (onSaveReport) {
        onSaveReport(generated, selectedClientId);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Metric color helper
  const getMetricColor = (val: number, invert = false) => {
    const score = invert ? 100 - val : val;
    if (score >= 70) return 'bg-emerald-500 text-emerald-950';
    if (score >= 45) return 'bg-amber-500 text-amber-950';
    return 'bg-rose-500 text-rose-950';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-700 mb-1">
            <Activity className="w-4 h-4" />
            <span>Module d'Analyse Cutanée Avancé & Métriques Biomédicales</span>
          </div>
          <h1 className="text-3xl font-serif text-stone-900 font-bold">
            Diagnostic Précis de la Peau : Visage & Corps
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Mesurez l'hydratation, les lipides, les rides, les taches et la fermeté. Obtenez un diagnostic personnalisé
            avec protocole cabine sur-mesure et enregistrement automatique dans le dossier de suivi de la cliente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {report && (
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimer Ordonnance Beauté
            </button>
          )}
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Questionnaire */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Care Mode Switch (Visage vs Corps) */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
              1. Type de Soin & Zone d'Intervention
            </label>

            {/* Visage vs Corps Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setTreatmentArea('visage');
                  setSelectedZone('Visage Complet (Global)');
                  setSelectedConcerns(['Déshydratation & Tiraillements', 'Rougeurs diffuses / Couperose']);
                }}
                className={`py-3 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                  treatmentArea === 'visage'
                    ? 'bg-white text-rose-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-rose-600" />
                Soin du Visage
              </button>
              <button
                type="button"
                onClick={() => {
                  setTreatmentArea('corps');
                  setSelectedZone('Cuisses & Jambes');
                  setSelectedConcerns(['Cellulite adipeuse / Peau d’orange', 'Relâchement cutané & Manque de fermeté']);
                }}
                className={`py-3 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                  treatmentArea === 'corps'
                    ? 'bg-white text-rose-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Activity className="w-4 h-4 text-rose-600" />
                Soin du Corps
              </button>
            </div>

            {/* Zone Selector Buttons */}
            <div>
              <span className="text-xs font-medium text-stone-600 block mb-2">
                Sélectionnez la zone anatomique ciblée :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(treatmentArea === 'visage' ? FACE_ZONES : BODY_ZONES).map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setSelectedZone(z.name)}
                    className={`p-3 text-left rounded-xl border text-xs transition-all ${
                      selectedZone === z.name
                        ? 'border-rose-400 bg-rose-50/70 text-rose-950 font-semibold shadow-2xs'
                        : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <div className="font-semibold text-stone-900">{z.name}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{z.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Client Profile */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                2. Profil & Cliente Associée
              </label>
              {clients.length > 0 && (
                <span className="text-xs text-rose-700 font-medium">Charger fiche existante</span>
              )}
            </div>

            {clients.length > 0 && (
              <select
                value={selectedClientId}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs mb-3"
              >
                <option value="">Sélectionner une cliente existante...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.skinType || 'Nouveau bilan'})
                  </option>
                ))}
              </select>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Nom / Prénom</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Âge</label>
                <input
                  type="number"
                  value={clientAge}
                  onChange={(e) => setClientAge(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Fitzpatrick scale */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                Phototype Fitzpatrick (Tolérance au soleil & mélanine)
              </label>
              <select
                value={fitzpatrick}
                onChange={(e) => setFitzpatrick(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
              >
                {FITZPATRICK_TYPES.map((f) => (
                  <option key={f.level} value={f.level}>
                    {f.level} : {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Photos Macro (Avant & Après Soin) */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                3. Photos Cutanées (Avant / Après Soin)
              </label>
              <span className="text-[10px] text-stone-400">Pour le suivi comparatif</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Photo Avant */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-stone-700 block">Photo Initiale (Avant)</span>
                {photoBase64 ? (
                  <div className="relative aspect-4/3 bg-stone-900 rounded-xl overflow-hidden border border-stone-300">
                    <img src={photoBase64} alt="Avant soin" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoBase64(null)}
                      className="absolute top-1.5 right-1.5 bg-stone-900/80 text-white text-[10px] px-2 py-0.5 rounded"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="py-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Caméra
                    </button>
                    <label className="py-2 bg-stone-50 hover:bg-stone-100 border border-dashed border-stone-300 rounded-xl text-[11px] font-medium text-stone-600 flex items-center justify-center gap-1.5 cursor-pointer text-center">
                      <Upload className="w-3.5 h-3.5" />
                      Importer fichier
                      <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, false)} className="hidden" />
                    </label>
                  </div>
                )}
              </div>

              {/* Photo Après */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-stone-700 block">Photo de Suivi (Après Soin)</span>
                {photoAfterBase64 ? (
                  <div className="relative aspect-4/3 bg-stone-900 rounded-xl overflow-hidden border border-stone-300">
                    <img src={photoAfterBase64} alt="Après soin" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoAfterBase64(null)}
                      className="absolute top-1.5 right-1.5 bg-stone-900/80 text-white text-[10px] px-2 py-0.5 rounded"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <label className="h-24 bg-stone-50 hover:bg-stone-100 border border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer text-center p-2">
                    <ImageIcon className="w-5 h-5 text-stone-400" />
                    <span className="text-[11px] font-medium text-stone-600">Ajouter photo après séance</span>
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, true)} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {cameraActive && (
              <div className="relative aspect-4/3 bg-black rounded-xl overflow-hidden border border-stone-800 mt-2">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    Capturer l'Échantillon Cutané
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-2 bg-stone-800 text-stone-300 text-xs rounded-lg"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Clinical Concerns & Sensations */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
              4. Préoccupations Prioritaires & Sensations Ressenties
            </label>

            <div>
              <span className="text-[11px] font-semibold text-stone-600 block mb-2">
                Motifs de consultation & problématiques observées :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(treatmentArea === 'visage' ? FACE_CONCERNS_OPTIONS : BODY_CONCERNS_OPTIONS).map((c) => {
                  const isChecked = selectedConcerns.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleConcern(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isChecked
                          ? 'bg-rose-900 text-white shadow-2xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-stone-600 block mb-2">
                Sensations cutanées rapportées par la cliente :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SENSATIONS_OPTIONS.map((s) => {
                  const isChecked = selectedSensations.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSensation(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isChecked
                          ? 'bg-stone-800 text-white shadow-2xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Observations de la Praticienne (Examen tactile & loupe d’esthétique)
              </label>
              <textarea
                rows={3}
                value={practitionerNotes}
                onChange={(e) => setPractitionerNotes(e.target.value)}
                placeholder="Ex: Pores serrés sur les joues mais dilatés sur les ailes du nez, présence de comédons ouverts..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleGenerateDiagnostic}
            disabled={loading}
            className="w-full py-4 bg-rose-950 hover:bg-rose-900 disabled:opacity-50 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Génération du diagnostic et des métriques en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-rose-300" />
                Calculer les Métriques & Générer le Protocole Cabine
              </>
            )}
          </button>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Bilan enregistré avec succès dans le dossier de suivi de {clientName} !</span>
            </div>
          )}
        </div>

        {/* Right Column: Diagnostic & Advanced Metrics Result */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-rose-700 animate-spin mx-auto" />
              <h3 className="text-base font-semibold text-stone-800">
                Calcul des indices dermo-esthétiques en cours...
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Modélisation de l’intégrité de la barrière épidermique, calcul des scores d’hydratation, de sébum et de fermeté.
              </p>
            </div>
          ) : report ? (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden divide-y divide-stone-100">
              {/* Header & Quick Action */}
              <div className="p-6 bg-stone-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-rose-800 font-semibold">
                    {report.treatmentArea === 'corps' ? 'Bilan Corporel' : 'Bilan Facial'} · {report.date}
                  </div>
                  <h2 className="text-xl font-serif font-bold text-stone-900 mt-0.5">
                    {report.clientName} ({report.specificZone})
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Fiche Ordonnance (PDF)
                  </button>
                </div>
              </div>

              {/* ADVANCED NUMERICAL SKIN METRICS DASHBOARD */}
              <div className="p-6 space-y-4 bg-stone-50/40">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-rose-800" />
                    Biométrie Cutanée & Métriques Chiffrées
                  </h3>
                  <span className="text-[11px] text-stone-500">Évaluation clinique normée</span>
                </div>

                {/* Progress bars grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Hydration */}
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-blue-500" /> Hydratation
                      </span>
                      <span className="font-bold text-stone-900">{report.metrics.hydrationScore} %</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${report.metrics.hydrationScore}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-stone-400 block">
                      {report.metrics.hydrationScore < 40 ? 'Déshydratation critique' : 'Barrière hydrique optimale'}
                    </span>
                  </div>

                  {/* Sebum */}
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-500" /> Lipides & Sébum
                      </span>
                      <span className="font-bold text-stone-900">{report.metrics.sebumScore} %</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${report.metrics.sebumScore}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-stone-400 block">
                      {report.metrics.sebumScore > 70 ? 'Hyperséborrhée' : report.metrics.sebumScore < 35 ? 'Alipidique' : 'Équilibré'}
                    </span>
                  </div>

                  {/* Firmness / Elasticity */}
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-500" /> Fermeté & Tonicité
                      </span>
                      <span className="font-bold text-stone-900">{report.metrics.elasticityFirmnessScore} %</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${report.metrics.elasticityFirmnessScore}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-stone-400 block">
                      {report.metrics.elasticityFirmnessScore >= 70 ? 'Tonicité dermo-épidermique forte' : 'Relâchement modéré'}
                    </span>
                  </div>

                  {/* Redness / Sensitivity */}
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-rose-500" /> Rougeurs & Réactivité
                      </span>
                      <span className="font-bold text-stone-900">{report.metrics.rednessSensitivityScore} %</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all"
                        style={{ width: `${report.metrics.rednessSensitivityScore}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-stone-400 block">
                      {report.metrics.rednessSensitivityScore >= 60 ? 'Hyper-réactivité vasomotrice' : 'Seuil de tolérance stable'}
                    </span>
                  </div>

                  {/* Wrinkles */}
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-stone-800">Rides & Ridules</span>
                      <span className="font-bold text-stone-900">{report.metrics.wrinklesScore} %</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${report.metrics.wrinklesScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Pigment Spots */}
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-stone-800">Taches Pigmentaires & Uniformité</span>
                      <span className="font-bold text-stone-900">{report.metrics.pigmentSpotsScore} %</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full transition-all"
                        style={{ width: `${report.metrics.pigmentSpotsScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Body Specific Indicators */}
                {report.treatmentArea === 'corps' && (
                  <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                    <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-xl">
                      <span className="text-[10px] text-stone-500 block">Grade Cellulite</span>
                      <span className="font-bold text-rose-950 capitalize">
                        {report.metrics.celluliteGrade?.replace(/_/g, ' ') || 'Stade 2 adipeuse'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                      <span className="text-[10px] text-stone-500 block">Rétention d'Eau</span>
                      <span className="font-bold text-indigo-950 capitalize">
                        {report.metrics.lymphaticRetention || 'Modérée'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                      <span className="text-[10px] text-stone-500 block">Vergetures</span>
                      <span className="font-bold text-amber-950 capitalize">
                        {report.metrics.stretchMarksSeverity || 'Légère'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* BEFORE / AFTER PHOTO COMPARISON IF AVAILABLE */}
              {(report.photoUrl || report.photoAfterUrl) && (
                <div className="p-6 space-y-3 bg-stone-50/20">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-rose-800" />
                    Comparatif Visuel Cutané
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {report.photoUrl && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-stone-600 block">Avant Soin</span>
                        <img
                          src={report.photoUrl}
                          alt="Avant Soin"
                          className="w-full aspect-4/3 object-cover rounded-xl border border-stone-200"
                        />
                      </div>
                    )}
                    {report.photoAfterUrl && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-stone-600 block">Après Soin / Évolution</span>
                        <img
                          src={report.photoAfterUrl}
                          alt="Après Soin"
                          className="w-full aspect-4/3 object-cover rounded-xl border border-stone-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Diagnostic Summary */}
              <div className="p-6 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Synthèse Clinique de la Praticienne
                </h3>
                <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200/80 italic">
                  "{report.diagnosticSummary}"
                </p>
              </div>

              {/* Priority Issues */}
              {report.priorityIssues && report.priorityIssues.length > 0 && (
                <div className="p-6 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Déséquilibres Identifiés & Mécanismes Biologiques ({report.priorityIssues.length})
                  </h3>
                  <div className="space-y-2">
                    {report.priorityIssues.map((iss, i) => (
                      <div key={i} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-stone-900">{iss.issue}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              iss.severity === 'forte'
                                ? 'bg-rose-100 text-rose-800'
                                : iss.severity === 'modérée'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            Priorité {iss.severity}
                          </span>
                        </div>
                        <p className="text-stone-600 text-[11px] leading-relaxed">{iss.scientificExplanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cabin Protocol */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-800 block">Protocole Institut</span>
                    <h3 className="text-base font-serif font-bold text-stone-900">
                      {report.cabinProtocol.title}
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-stone-100 border border-stone-200 rounded-lg text-stone-700 font-semibold">
                    {report.cabinProtocol.duration}
                  </span>
                </div>

                <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 text-xs">
                  {report.cabinProtocol.steps.map((step) => (
                    <div key={step.stepNumber} className="p-3.5 space-y-1.5 hover:bg-stone-50/50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-[10px]">
                            {step.stepNumber}
                          </span>
                          <span className="font-bold text-stone-900 text-xs">{step.actionName}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 uppercase font-medium">
                          {step.phase}
                        </span>
                      </div>
                      <p className="text-stone-600 text-[11px] pl-7">{step.equipmentOrTechnique}</p>
                      {step.activeIngredients && step.activeIngredients.length > 0 && (
                        <div className="pl-7 text-[10px] text-rose-900">
                          <strong>Actifs cibles :</strong> {step.activeIngredients.join(', ')}
                        </div>
                      )}
                      {step.cautions && (
                        <div className="pl-7 text-[10px] text-amber-800 italic">
                          Précautions : {step.cautions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Home Prescription Teaser */}
              <div className="p-6 bg-stone-50/80 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Ordonnance Beauté & Routine Domicile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Matin */}
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2">
                    <span className="font-semibold text-amber-900 block text-[11px] uppercase tracking-wide">
                      Matin (Protection & Éveil)
                    </span>
                    <div className="space-y-1.5">
                      {report.homePrescription.morning.map((m, i) => (
                        <div key={i} className="text-[11px] text-stone-700">
                          <strong>{m.step}:</strong> {m.category} ({m.keyActives})
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Soir */}
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2">
                    <span className="font-semibold text-indigo-900 block text-[11px] uppercase tracking-wide">
                      Soir (Régénération & Réparation)
                    </span>
                    <div className="space-y-1.5">
                      {report.homePrescription.evening.map((e, i) => (
                        <div key={i} className="text-[11px] text-stone-700">
                          <strong>{e.step}:</strong> {e.category} ({e.keyActives})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="text-xs font-semibold text-rose-900 hover:text-rose-950 flex items-center gap-1.5 underline"
                  >
                    Voir l’ordonnance complète et imprimer la fiche cliente →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400 space-y-3">
              <Sparkles className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-sm font-medium text-stone-600">Aucun bilan généré pour le moment</p>
              <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                Remplissez les observations cliniques sur le panneau de gauche et cliquez sur "Calculer les Métriques" pour élaborer le diagnostic.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Print Prescription Modal */}
      {showPrintModal && report && (
        <PrintablePrescriptionModal
          report={report}
          onClose={() => setShowPrintModal(false)}
          instituteName={instituteName}
          estheticianName={estheticianName}
        />
      )}
    </div>
  );
};
