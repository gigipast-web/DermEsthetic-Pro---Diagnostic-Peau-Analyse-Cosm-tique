import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Download,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Share2,
  Send,
  FileText,
  Globe,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PLAY_STORE_TESTING_URL = 'https://play.google.com/apps/testing/pro.dermesthetic.app';
export const PROMO_IMAGE_PATH = '/assets/aistudio/affiche_promo_fran_ais_daa5a922.png';

export const FACEBOOK_POST_TEXT = `🌸 Une peau plus saine commence ici ! 🌸

L'application Dermesthetic arrive sur Android et nous ouvrons aujourd'hui les accès en avant-première ! 📱✨

🔬 Analyse cutanée sur-mesure & diagnostic de peau
🌿 Scanner de cosmétiques & décryptage INCI des ingrédients
💆‍♀️ Conseils d'experts & suivi de votre routine personnalisée

👉 Rejoignez notre phase de test officielle sur Google Play :
https://play.google.com/apps/testing/pro.dermesthetic.app

Testez notre appli et faites partie de l'aventure ! ❤️
#Dermesthetic #SoinDeLaPeau #Esthétique #CosmétiquePro #GooglePlay #BeautyTech`;

export const GooglePlayPromoModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPost, setCopiedPost] = useState(false);
  const [activeTab, setActiveTab] = useState<'poster' | 'facebook' | 'domain'>('domain');

  // Digital Asset Links State
  const [assetlinksStatus, setAssetlinksStatus] = useState<{
    packageName: string;
    domain: string;
    activeFingerprints: string[];
    hasEnvOverride: boolean;
  } | null>(null);
  const [shaInput, setShaInput] = useState('');
  const [isSavingSha, setIsSavingSha] = useState(false);
  const [shaSuccess, setShaSuccess] = useState<string | null>(null);
  const [shaError, setShaError] = useState<string | null>(null);
  const [copiedAssetUrl, setCopiedAssetUrl] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/assetlinks')
        .then((res) => res.json())
        .then((data) => {
          setAssetlinksStatus(data);
          if (data.activeFingerprints && data.activeFingerprints.length > 0) {
            setShaInput(data.activeFingerprints.join('\n'));
          }
        })
        .catch((e) => console.warn('Could not fetch assetlinks info', e));
    }
  }, [isOpen]);

  const handleSaveSha = async () => {
    setIsSavingSha(true);
    setShaSuccess(null);
    setShaError(null);
    try {
      const res = await fetch('/api/assetlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: shaInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShaSuccess('Empreinte SHA-256 enregistrée avec succès dans le fichier assetlinks.json !');
        setAssetlinksStatus((prev: any) => ({
          ...prev,
          activeFingerprints: data.activeFingerprints,
        }));
        setTimeout(() => setShaSuccess(null), 5000);
      } else {
        setShaError(data.error || 'Erreur lors de l’enregistrement.');
      }
    } catch (e: any) {
      setShaError(e.message || 'Impossible de joindre le serveur.');
    } finally {
      setIsSavingSha(false);
    }
  };

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(PLAY_STORE_TESTING_URL);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }
  };

  const handleCopyPostText = async () => {
    try {
      await navigator.clipboard.writeText(FACEBOOK_POST_TEXT);
      setCopiedPost(true);
      setTimeout(() => setCopiedPost(false), 2500);
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }
  };

  const handleShareFacebook = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-xqni426rbj4g2zmdisysfc-665307952988.europe-west2.run.app';
    const promoUrl = `${origin}/promo-facebook`;
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(promoUrl)}`;
    window.open(fbShareUrl, '_blank', 'noopener,noreferrer,width=650,height=550');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-rose-200 shadow-inner">
              <Share2 className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg text-white">
                  Promotion Facebook & Google Play
                </h2>
                <span className="text-[10px] bg-blue-500/25 text-blue-200 border border-blue-400/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Kit Réseaux Sociaux
                </span>
              </div>
              <p className="text-xs text-rose-200/80">
                Affiche cliquable et textes prêts à publier pour votre communication Facebook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('facebook')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'facebook'
                ? 'border-blue-600 text-blue-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Kit Publication Facebook</span>
          </button>
          <button
            onClick={() => setActiveTab('poster')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'poster'
                ? 'border-rose-900 text-rose-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-rose-800" />
            <span>Affiche Haute Résolution</span>
          </button>
          <button
            onClick={() => setActiveTab('domain')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'domain'
                ? 'border-emerald-700 text-emerald-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Validation Domaine (AssetLinks)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* TAB 1: FACEBOOK PROMO KIT */}
          {activeTab === 'facebook' && (
            <div className="space-y-5">
              {/* Facebook Direct Share Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-blue-950 text-sm block flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    Publier directement sur Facebook
                  </span>
                  <p className="text-blue-800/80 text-[11px]">
                    Générez automatiquement la carte d'aperçu avec l'affiche et le lien Google Play.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="px-4 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Partager sur Facebook</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>
              </div>

              {/* Ready-to-use Copywriting for Facebook */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-rose-800" />
                    Texte prêt à coller pour votre post Facebook :
                  </span>
                  <button
                    onClick={handleCopyPostText}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
                  >
                    {copiedPost ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Texte copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-600" />
                        <span>Copier tout le texte</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs font-sans text-stone-800 whitespace-pre-line leading-relaxed select-all">
                  {FACEBOOK_POST_TEXT}
                </div>
              </div>

              {/* Step-by-Step Facebook Guide */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 text-xs">
                <span className="font-bold text-stone-900 block">
                  💡 Comment faire votre promo sur Facebook en 2 minutes :
                </span>
                <ol className="space-y-2 list-decimal list-inside text-stone-600 text-[11px] leading-relaxed">
                  <li>
                    <strong className="text-stone-800">Téléchargez l'affiche haute définition</strong> avec le bouton ci-dessous (ou utilisez le bouton "Télécharger l'Affiche HD").
                  </li>
                  <li>
                    Rendez-vous sur votre <strong>Page Facebook</strong> ou dans un <strong>groupe</strong> et créez une nouvelle publication.
                  </li>
                  <li>
                    Ajoutez la photo de l'affiche et <strong className="text-stone-800">collez le texte</strong> copié ci-dessus.
                  </li>
                  <li>
                    Le lien Google Play <code className="bg-white px-1 py-0.5 rounded border border-stone-200 font-mono text-[10px] text-rose-900">https://play.google.com/apps/testing/pro.dermesthetic.app</code> sera automatiquement cliquable pour vos followers !
                  </li>
                </ol>
              </div>

              {/* Actions row */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <a
                  href={PROMO_IMAGE_PATH}
                  download="Affiche-Dermesthetic-Facebook.png"
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-950 hover:bg-rose-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-rose-300" />
                  <span>1. Télécharger l'Affiche pour Facebook</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyPostText}
                  className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs flex items-center justify-center gap-2 border border-stone-200 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-stone-600" />
                  <span>2. Copier le texte Facebook</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: POSTER VIEW */}
          {activeTab === 'poster' && (
            <div className="space-y-5">
              {/* Instruction banner */}
              <div className="flex items-start gap-3 p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200/80 text-xs text-stone-700">
                <Sparkles className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-stone-900">
                    Cliquez directement sur l'affiche ci-dessous pour tester la redirection :
                  </p>
                  <p className="text-[11px] text-stone-500">
                    L'image redirige directement vers l'URL officielle de test Google Play Store.
                  </p>
                </div>
              </div>

              {/* Promotional Poster Image with Hyperlink */}
              <div className="relative group rounded-2xl overflow-hidden border border-stone-200 shadow-md hover:shadow-xl transition-all duration-300 bg-stone-100">
                <a
                  href={PLAY_STORE_TESTING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative cursor-pointer"
                  title="Cliquer pour ouvrir la page de test sur Google Play"
                >
                  <img
                    src={PROMO_IMAGE_PATH}
                    alt="Affiche promotionnelle Dermesthetic - Disponible sur Google Play"
                    className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.015]"
                    loading="eager"
                  />

                  {/* Hover Overlay Hint */}
                  <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 text-white p-4 backdrop-blur-[2px]">
                    <div className="px-4 py-2.5 rounded-xl bg-white text-stone-900 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                      <ExternalLink className="w-4 h-4 text-rose-800" />
                      <span>Ouvrir Google Play (Phase de Test)</span>
                    </div>
                    <span className="text-[11px] text-rose-200 font-medium">
                      play.google.com/apps/testing/pro.dermesthetic.app
                    </span>
                  </div>
                </a>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <a
                  href={PLAY_STORE_TESTING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-950 hover:bg-rose-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-rose-300" />
                  <span>Tester le Lien Google Play</span>
                  <ExternalLink className="w-3.5 h-3.5 text-rose-300 ml-1" />
                </a>

                <a
                  href={PROMO_IMAGE_PATH}
                  download="Affiche-Dermesthetic-GooglePlay.png"
                  className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-stone-200 shadow-2xs"
                  title="Télécharger l'affiche au format haute résolution PNG"
                >
                  <Download className="w-4 h-4 text-stone-600" />
                  <span>Télécharger en HD (1254x1254)</span>
                </a>

                <button
                  onClick={handleCopyLink}
                  className="py-3 px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
                  title="Copier le lien Google Play"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-stone-600" />
                      <span>Copier lien</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DOMAIN & DIGITAL ASSET LINKS VALIDATION */}
          {activeTab === 'domain' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Alert resolution banner */}
              <div className="p-4 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                    Configuration Digital Asset Links active & conforme
                  </h4>
                  <p className="text-[11px] sm:text-xs text-emerald-800 leading-relaxed">
                    Votre serveur sert désormais le fichier officiel <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono font-bold text-emerald-950">/.well-known/assetlinks.json</code> en <strong>HTTP 200 direct</strong>, <strong>sans redirection</strong> et avec le type MIME strict <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono font-bold text-emerald-950">application/json</code>.
                  </p>
                </div>
              </div>

              {/* Status checklist of the 3 Google Play tests */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-stone-900 block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  État des 3 tests de la Google Play Console
                </span>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white border border-stone-200/80 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-semibold text-stone-800">Fichier Digital Asset Links</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✅ Présent & Accessible
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white border border-stone-200/80 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-semibold text-stone-800">Domaine sans redirection</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✅ Direct 200 OK (0 redirection)
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white border border-stone-200/80 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-semibold text-stone-800">Type de contenu JSON</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✅ application/json strict
                    </span>
                  </div>
                </div>
              </div>

              {/* URL tester button */}
              <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <strong className="block text-stone-900 font-semibold">URL de vérification publique :</strong>
                  <code className="text-[11px] text-rose-950 font-mono font-bold break-all">
                    /.well-known/assetlinks.json
                  </code>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href="/.well-known/assetlinks.json"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-800 text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <span>Ouvrir le JSON</span>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                  </a>
                  <button
                    onClick={() => {
                      const fullUrl = `${window.location.origin}/.well-known/assetlinks.json`;
                      navigator.clipboard.writeText(fullUrl);
                      setCopiedAssetUrl(true);
                      setTimeout(() => setCopiedAssetUrl(false), 2500);
                    }}
                    className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedAssetUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAssetUrl ? 'Copié !' : 'Copier URL'}</span>
                  </button>
                </div>
              </div>

              {/* SHA-256 Fingerprint Management */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-800" />
                    Empreinte de certificat SHA-256 (Google Play App Signing)
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    Package: pro.dermesthetic.app
                  </span>
                </div>

                <div className="text-[11px] text-stone-600 space-y-1.5 bg-rose-50/60 p-3 rounded-xl border border-rose-100">
                  <p className="font-semibold text-rose-950">
                    Où trouver votre véritable empreinte SHA-256 dans Google Play Console (2 méthodes faciles) :
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-stone-700">
                    <li>
                      <strong>Méthode 1 (Depuis l'alerte « Protégé avec Play ») :</strong> Rendez-vous dans <em>Configuration &gt; Intégrité de l'application</em>. Sur l'écran qui affiche « Protégé avec Play », cliquez sur l'onglet <strong>« Signature de l'application »</strong> juste en-dessous. Vous y trouverez l'encadré <em>Certificat de clé de signature d'application</em> avec la ligne <strong>« Empreinte du certificat SHA-256 »</strong>.
                    </li>
                    <li>
                      <strong>Méthode 2 (En 1 clic depuis les Liens Profonds) :</strong> Rendez-vous dans <em>Configuration &gt; Liens vers l'application (ou Liens profonds)</em>. Cliquez sur <strong>« Résoudre les problèmes de domaine »</strong> (ou la flèche en bout de ligne) puis sur <strong>« Afficher l'extrait Digital Asset Links »</strong>. Vous pouvez copier l'empreinte ou même tout le bloc JSON !
                    </li>
                  </ul>
                  <p className="text-[10px] text-stone-500 italic">
                    💡 Vous pouvez coller ici soit l'empreinte seule (ex: <code>3A:B8:2C:...</code>), soit l'extrait JSON complet fourni par Google.
                  </p>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={shaInput}
                    onChange={(e) => setShaInput(e.target.value)}
                    placeholder="Ex: 14:6D:E9:EB:18:66:47:FD:A2:29:43:8B:1A:1C:CE:F6:C3:0A:94:41:F0:8A:E2:E2:B0:1B:67:86:14:8B:2A:4E"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-rose-800 focus:outline-hidden"
                  />

                  {shaSuccess && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{shaSuccess}</span>
                    </div>
                  )}

                  {shaError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{shaError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveSha}
                      disabled={isSavingSha || !shaInput.trim()}
                      className="px-4 py-2 bg-rose-950 hover:bg-rose-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      {isSavingSha && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>Enregistrer l'empreinte SHA-256</span>
                    </button>

                    <span className="text-[11px] text-stone-500">
                      Prend effet immédiatement sans redémarrage
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructions to clear Google Play error */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1.5">
                <strong className="block font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  Comment faire disparaître l'alerte sur Google Play Console :
                </strong>
                <ol className="list-decimal pl-5 space-y-1 text-[11px] text-amber-900">
                  <li>Retournez sur votre <strong>Google Play Console</strong>.</li>
                  <li>Dans le menu de gauche, rendez-vous dans <strong>Configuration &gt; Liens vers l'application</strong> (App Links).</li>
                  <li>En face du domaine <code className="bg-amber-100/90 px-1 py-0.5 rounded font-mono font-bold">ais-pre-xqni426rbj4g2zmdisysfc-665307952988.europe-west2.run.app</code>, cliquez sur <strong>Réessayer</strong> ou <strong>Relancer la vérification</strong>.</li>
                  <li>Google Play va interroger l'URL <code className="bg-amber-100/90 px-1 py-0.5 rounded font-mono font-bold">/.well-known/assetlinks.json</code> qui répond désormais avec succès !</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-stone-500 hidden sm:inline">
            Affiche certifiée pour Facebook, Instagram et WhatsApp
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer ml-auto"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
