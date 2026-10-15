import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Scan,
  Upload,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  ShieldAlert,
  Baby,
  Sparkles,
  Search,
  FileText,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  ArrowRight,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  PlusCircle,
  ShoppingBag,
  Sliders,
  DollarSign
} from 'lucide-react';
import { ProductAnalysisResult, ClientProfile } from '../types';
import { analyzeProductApi } from '../services/apiService';
import { VERIFIED_PRODUCTS_CATALOG } from '../data/cosmeticsDatabase';

interface Props {
  clients: ClientProfile[];
  onAddProductToClient?: (clientId: string, product: ProductAnalysisResult) => void;
  onAddProductToCatalog?: (product: ProductAnalysisResult) => void;
}

export const ProductScannerView: React.FC<Props> = ({
  clients,
  onAddProductToClient,
  onAddProductToCatalog,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'barcode' | 'inci' | 'photo' | 'catalog'>('camera');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('all');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [inciInput, setInciInput] = useState('');
  const [productNameInput, setProductNameInput] = useState('');
  const [brandInput, setBrandInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Soin du Visage');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductAnalysisResult | null>(VERIFIED_PRODUCTS_CATALOG[2]); // Default showcase: Nivea with clear hazard warnings!
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  // New product addition state
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [customCategory, setCustomCategory] = useState('Soin du Visage');
  const [customBarcode, setCustomBarcode] = useState('');
  const [customPrice, setCustomPrice] = useState('25,00 €');
  const [customInci, setCustomInci] = useState('');

  // Camera handling
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);

      // Check if native BarcodeDetector is available
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
          });

          scanIntervalRef.current = window.setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  const detectedCode = barcodes[0].rawValue;
                  stopCamera();
                  handleAnalyze({ barcode: detectedCode });
                }
              } catch (e) {
                // Ignore detection frame error
              }
            }
          }, 400);
        } catch (e) {
          console.warn('BarcodeDetector initialization failed', e);
        }
      }
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      setCameraError('Accès caméra non disponible. Vous pouvez saisir le code-barre manuellement ou téléverser une photo.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  // Capture frame from camera
  const captureFrame = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    handleAnalyze({ labelPhotoBase64: dataUrl });
  };

  // Upload image handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      handleAnalyze({
        labelPhotoBase64: dataUrl,
        productName: productNameInput || file.name.replace(/\.[^/.]+$/, ''),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (params: {
    barcode?: string;
    productName?: string;
    brand?: string;
    ingredientsList?: string;
    category?: string;
    labelPhotoBase64?: string;
  }) => {
    setLoading(true);
    setSavedSuccessMsg('');
    try {
      const res = await analyzeProductApi({
        barcode: params.barcode || barcodeInput,
        productName: params.productName || productNameInput,
        brand: params.brand || brandInput,
        ingredientsList: params.ingredientsList || inciInput,
        category: params.category || categoryInput,
        labelPhotoBase64: params.labelPhotoBase64,
      });
      setResult(res);
      if (params.barcode) setBarcodeInput(params.barcode);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToClient = () => {
    if (!selectedClientId || !result || !onAddProductToClient) return;
    onAddProductToClient(selectedClientId, result);
    setSavedSuccessMsg('Produit ajouté avec succès dans l’historique des produits de la cliente !');
    setTimeout(() => setSavedSuccessMsg(''), 4000);
  };

  const handleCreateCustomProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    setLoading(true);
    try {
      const analyzed = await analyzeProductApi({
        barcode: customBarcode.trim() || undefined,
        productName: customName.trim(),
        brand: customBrand.trim(),
        category: customCategory,
        ingredientsList: customInci.trim(),
      });

      const fullCustomProduct: ProductAnalysisResult = {
        ...analyzed,
        retailPrice: customPrice.trim() || undefined,
        source: 'institut_catalog',
      };

      setResult(fullCustomProduct);
      if (onAddProductToCatalog) {
        onAddProductToCatalog(fullCustomProduct);
      }
      setShowAddCustomModal(false);
      setCustomName('');
      setCustomBrand('');
      setCustomInci('');
      setCustomBarcode('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered catalog
  const filteredCatalog = VERIFIED_PRODUCTS_CATALOG.filter((prod) => {
    const matchesSearch =
      prod.productName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      prod.brand.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (prod.barcode && prod.barcode.includes(catalogSearch));
    const matchesCategory =
      catalogCategoryFilter === 'all' ||
      (catalogCategoryFilter === 'visage' && prod.category.toLowerCase().includes('visage')) ||
      (catalogCategoryFilter === 'corps' && prod.category.toLowerCase().includes('corps')) ||
      (catalogCategoryFilter === 'clean' && !prod.isControversialOrDangerous) ||
      (catalogCategoryFilter === 'danger' && prod.isControversialOrDangerous);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Intro Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-700 mb-1">
            <Scan className="w-4 h-4" />
            <span>Scanner & Base de Données Cosmétiques (Visage & Corps)</span>
          </div>
          <h1 className="text-3xl font-serif text-stone-900 font-bold">
            Analyse des Produits & Détection des Ingrédients Dangereux
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Scannez le code-barre ou explorez le catalogue : découvrez la composition INCI, les avis utilisateurs certifiés
            et une alerte formelle en cas de perturbateurs endocriniens ou substances toxiques.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddCustomModal(true)}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <PlusCircle className="w-4 h-4" />
            Ajouter un Produit au Salon
          </button>
        </div>
      </div>

      {/* Input Scanner Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Scanner Tools (Tabs) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
            {/* Tab Selection */}
            <div className="flex p-1 bg-stone-100 rounded-xl mb-5 flex-wrap gap-1">
              <button
                onClick={() => setActiveTab('camera')}
                className={`flex-1 min-w-[70px] py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'camera'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Caméra
              </button>
              <button
                onClick={() => setActiveTab('barcode')}
                className={`flex-1 min-w-[70px] py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'barcode'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Scan className="w-3.5 h-3.5" />
                Code-barre
              </button>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex-1 min-w-[70px] py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'catalog'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Base ({VERIFIED_PRODUCTS_CATALOG.length})
              </button>
              <button
                onClick={() => setActiveTab('inci')}
                className={`flex-1 min-w-[70px] py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'inci'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                INCI
              </button>
              <button
                onClick={() => setActiveTab('photo')}
                className={`flex-1 min-w-[70px] py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'photo'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Photo
              </button>
            </div>

            {/* TAB 1: Live Camera Scanner */}
            {activeTab === 'camera' && (
              <div className="space-y-4">
                <div className="relative aspect-4/3 bg-stone-950 rounded-xl overflow-hidden flex items-center justify-center border border-stone-800">
                  {cameraActive ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {/* Viewfinder Target Frame */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                        <div className="w-64 h-36 border-2 border-rose-400/90 rounded-xl relative shadow-lg">
                          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-rose-300"></div>
                          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-rose-300"></div>
                          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-rose-300"></div>
                          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-rose-300"></div>
                          {/* Animated laser scan line */}
                          <div className="w-full h-0.5 bg-rose-500 absolute top-1/2 -translate-y-1/2 animate-pulse shadow-sm"></div>
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/90 bg-stone-950/70 py-1 px-3 mx-4 rounded-lg backdrop-blur-xs">
                        Pointez vers le code-barre du soin visage ou corps
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center text-stone-400 space-y-3">
                      <Camera className="w-10 h-10 mx-auto text-stone-500 opacity-60" />
                      <p className="text-xs">{cameraError || 'Activation du flux vidéo haute définition...'}</p>
                      <button
                        onClick={startCamera}
                        className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-lg transition-colors"
                      >
                        Autoriser & Allumer la Caméra
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={captureFrame}
                    disabled={!cameraActive || loading}
                    className="flex-1 py-2.5 bg-rose-900 hover:bg-rose-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    Photographier & Décrypter
                  </button>
                  <button
                    onClick={cameraActive ? stopCamera : startCamera}
                    className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
                    title={cameraActive ? 'Mettre en pause' : 'Redémarrer'}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Manual Barcode Input */}
            {activeTab === 'barcode' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Numéro de Code-barre (EAN-13 / UPC)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ex: 3401345934573..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                    />
                    <button
                      onClick={() => handleAnalyze({ barcode: barcodeInput })}
                      disabled={!barcodeInput || loading}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      Analyser
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-2">
                    Sélection rapide : Produits types visage et corps en institut :
                  </label>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {VERIFIED_PRODUCTS_CATALOG.map((prod) => (
                      <button
                        key={prod.barcode}
                        onClick={() => {
                          setBarcodeInput(prod.barcode || '');
                          setResult(prod);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs border transition-all flex items-center justify-between ${
                          result?.barcode === prod.barcode
                            ? 'bg-rose-50/70 border-rose-300 text-rose-950 font-medium'
                            : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                        }`}
                      >
                        <div className="truncate flex-1 pr-2">
                          <span className="font-semibold">{prod.brand}</span> - {prod.productName}
                          <div className="text-[10px] text-stone-500">{prod.category}</div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {prod.isControversialOrDangerous ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-rose-100 text-rose-800">
                              DANGER
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                              CLEAN
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-stone-600">
                            {prod.safetyScore}/100
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Complete Skincare & Bodycare Catalog Explorer */}
            {activeTab === 'catalog' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Filtrer par marque, soin visage, corps..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
                  {[
                    { id: 'all', label: 'Tous' },
                    { id: 'visage', label: 'Visage' },
                    { id: 'corps', label: 'Corps' },
                    { id: 'clean', label: 'Clean' },
                    { id: 'danger', label: 'Dangereux' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCatalogCategoryFilter(cat.id)}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                        catalogCategoryFilter === cat.id
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredCatalog.map((prod) => (
                    <div
                      key={prod.barcode}
                      onClick={() => {
                        setBarcodeInput(prod.barcode || '');
                        setResult(prod);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer text-xs transition-all space-y-1 ${
                        result?.barcode === prod.barcode
                          ? 'bg-rose-50/70 border-rose-300'
                          : 'bg-stone-50 hover:bg-stone-100/80 border-stone-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-stone-900">{prod.brand}</span> · {prod.productName}
                          <div className="text-[10px] text-stone-500">{prod.category}</div>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            prod.isControversialOrDangerous
                              ? 'bg-rose-100 text-rose-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {prod.safetyScore}/100
                        </span>
                      </div>
                      {prod.reviews && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-700">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{prod.reviews.averageRating} / 5</span>
                          <span className="text-stone-400">({prod.reviews.totalReviews} avis)</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Raw INCI Text Paste */}
            {activeTab === 'inci' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Nom du Produit</label>
                    <input
                      type="text"
                      placeholder="Ex: Sérum Purifiant"
                      value={productNameInput}
                      onChange={(e) => setProductNameInput(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Marque</label>
                    <input
                      type="text"
                      placeholder="Ex: Laboratoire X"
                      value={brandInput}
                      onChange={(e) => setBrandInput(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Coller la Liste d’Ingrédients INCI
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Aqua, Glycerin, Dimethicone, BHT, Sodium Lauryl Sulfate, Parfum, Phenoxyethanol..."
                    value={inciInput}
                    onChange={(e) => setInciInput(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <button
                  onClick={() => handleAnalyze({ ingredientsList: inciInput })}
                  disabled={!inciInput || loading}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                  Décoder la Composition INCI
                </button>
              </div>
            )}

            {/* TAB 5: Upload Photo */}
            {activeTab === 'photo' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:bg-stone-50/50 transition-colors">
                  <Upload className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                  <p className="text-xs font-semibold text-stone-700">Téléversez la photo du flacon ou de l’étiquette INCI</p>
                  <p className="text-[11px] text-stone-500 mt-1">L’IA lit automatiquement la composition et les mentions de sécurité</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="mt-3 block w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-800 hover:file:bg-rose-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Client Association Box */}
          {result && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                <Layers className="w-4 h-4 text-rose-700" />
                <span>Enregistrer dans le dossier de suivi d'une cliente :</span>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                >
                  <option value="">Sélectionnez une cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.skinType || 'Sans bilan'})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSaveToClient}
                  disabled={!selectedClientId}
                  className="px-3 py-2 bg-rose-950 hover:bg-rose-900 disabled:opacity-40 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  Associer
                </button>
              </div>
              {savedSuccessMsg && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {savedSuccessMsg}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: In-Depth Product Toxicology & Pro Verdict */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-rose-600 animate-spin mx-auto" />
              <h3 className="text-base font-semibold text-stone-800">Décryptage de la formule en cours...</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Vérification des perturbateurs endocriniens, allergènes de parfum, hydrocarbures pétrochimiques et calcul de l’indice comédogène.
              </p>
            </div>
          ) : result ? (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden divide-y divide-stone-100">
              {/* CLEAR HAZARD BANNER IF DANGEROUS */}
              {result.isControversialOrDangerous ? (
                <div className="p-4 bg-rose-600 text-white flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 shrink-0 animate-bounce" />
                    <div>
                      <div className="font-bold text-sm uppercase tracking-wide">
                        ALERTE : SUBSTANCE DANGEREUSE OU CONTROVERSÉE DÉTECTÉE
                      </div>
                      <div className="text-xs text-rose-100">
                        Ce produit contient des ingrédients déconseillés par les comités de santé (perturbateurs endocriniens ou occlusifs).
                      </div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-white text-rose-900 font-bold rounded-lg shrink-0">
                    À BANNIR
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-emerald-600 text-white flex items-center gap-2 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>PRODUIT SÛR & CONFORME : Aucune substance toxique majeure identifiée.</span>
                </div>
              )}

              {/* Product Header & Safety Score */}
              <div className="p-6 bg-stone-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-rose-800 uppercase tracking-widest">
                    {result.brand || 'Marque'}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-0.5">
                    {result.productName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mt-1">
                    <span>{result.category}</span>
                    {result.retailPrice && (
                      <>
                        <span>·</span>
                        <span className="font-semibold text-stone-800">{result.retailPrice}</span>
                      </>
                    )}
                    {result.barcode && (
                      <>
                        <span>·</span>
                        <span className="font-mono text-[11px]">EAN: {result.barcode}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Score Card */}
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs shrink-0">
                  <div
                    className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white font-bold shadow-2xs ${
                      result.safetyScore >= 80
                        ? 'bg-emerald-600'
                        : result.safetyScore >= 60
                        ? 'bg-amber-500'
                        : 'bg-rose-600'
                    }`}
                  >
                    <span className="text-lg leading-none">{result.safetyScore}</span>
                    <span className="text-[10px] opacity-80">/100</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Indice Tolérance</span>
                    <span className="font-bold text-stone-900 capitalize text-sm">{result.riskLevel}</span>
                  </div>
                </div>
              </div>

              {/* Status Tags Grid (Pregnancy, Sensitive Skin, Post-Care) */}
              <div className="p-4 bg-stone-50/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* Pregnancy */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    result.isSafeForPregnancy
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <Baby className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="block text-[10px] opacity-75">Grossesse</span>
                    <span className="font-semibold text-[11px]">
                      {result.isSafeForPregnancy ? 'Compatible' : 'Déconseillé'}
                    </span>
                  </div>
                </div>

                {/* Sensitive Skin */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    result.isSafeForSensitiveSkin
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="block text-[10px] opacity-75">Peau Réactive</span>
                    <span className="font-semibold text-[11px]">
                      {result.isSafeForSensitiveSkin ? 'Toléré' : 'Risque d’irritation'}
                    </span>
                  </div>
                </div>

                {/* Comedogenicity */}
                <div className="p-2.5 rounded-xl border bg-stone-100/70 border-stone-200 text-stone-800 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-stone-300 flex items-center justify-center font-bold text-[10px]">
                    {result.comedogenicRating}
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-500">Comédogénicité</span>
                    <span className="font-semibold text-[11px]">
                      {result.comedogenicRating === 0
                        ? 'Non comédogène'
                        : result.comedogenicRating <= 2
                        ? 'Faible (1-2/5)'
                        : 'Élevé (Pores bouchés)'}
                    </span>
                  </div>
                </div>

                {/* Post-Care */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    result.suitableForPostCare
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="block text-[10px] opacity-75">Post-Soin Cabine</span>
                    <span className="font-semibold text-[11px]">
                      {result.suitableForPostCare ? 'Autorisé' : 'Bannir en post-soin'}
                    </span>
                  </div>
                </div>
              </div>

              {/* RED FLAGS: Dangerous / Controversial Ingredients */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Substances Controversées ou Dangereuses Détectées ({result.dangerousOrControversialIngredients.length})
                  </h3>
                  {result.dangerousOrControversialIngredients.length === 0 && (
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Aucune alerte critique
                    </span>
                  )}
                </div>

                {result.dangerousOrControversialIngredients.length > 0 ? (
                  <div className="space-y-2.5">
                    {result.dangerousOrControversialIngredients.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          item.severity === 'haute'
                            ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                            : item.severity === 'moyenne'
                            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                            : 'bg-stone-50 border-stone-200 text-stone-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{item.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                              item.severity === 'haute'
                                ? 'bg-rose-200 text-rose-900'
                                : item.severity === 'moyenne'
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {item.category.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-stone-700 leading-relaxed">{item.dangerDescription}</p>
                        {item.scientificContext && (
                          <div className="text-[11px] text-stone-500 italic pt-0.5">
                            Source : {item.scientificContext}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>
                      Ce produit ne contient aucun perturbateur endocrinien majeur, ni dérivés pétrochimiques occlusifs identifiés.
                    </span>
                  </div>
                )}
              </div>

              {/* USER REVIEWS & RATINGS SECTION */}
              {result.reviews && (
                <div className="p-6 space-y-4 bg-amber-50/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-amber-800 block">
                        Retours d’expérience & Avis Clients
                      </span>
                      <h3 className="text-base font-serif font-bold text-stone-900">
                        Avis Utilisateurs ({result.reviews.totalReviews} avis vérifiés)
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-stone-900 text-sm">{result.reviews.averageRating} / 5</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Points forts rapportés</span>
                      </div>
                      <ul className="text-stone-600 text-[11px] space-y-0.5 list-disc pl-4">
                        {result.reviews.positiveHighlights.map((pos, i) => (
                          <li key={i}>{pos}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>Points faibles & alertes</span>
                      </div>
                      <ul className="text-stone-600 text-[11px] space-y-0.5 list-disc pl-4">
                        {result.reviews.negativeHighlights.map((neg, i) => (
                          <li key={i}>{neg}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {result.reviews.reviewsSample && result.reviews.reviewsSample.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {result.reviews.reviewsSample.map((rev, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-stone-200/80 text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-stone-900">{rev.author}</span>
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-stone-600 text-[11px] italic">"{rev.comment}"</p>
                          {rev.skinTypeTested && (
                            <span className="text-[10px] text-stone-400 block">
                              Type de peau testé : {rev.skinTypeTested}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Beneficial Active Ingredients */}
              {result.beneficialActives && result.beneficialActives.length > 0 && (
                <div className="p-6 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Actifs Bénéfiques & Molécules d’Intérêt ({result.beneficialActives.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {result.beneficialActives.map((act, i) => (
                      <div key={i} className="p-2.5 bg-emerald-50/40 border border-emerald-100 rounded-xl">
                        <span className="font-semibold text-emerald-950 block">{act.name}</span>
                        <span className="text-stone-600 text-[11px]">{act.benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Esthetician Verdict & Clean Institute Alternatives */}
              <div className="p-6 bg-stone-900 text-white space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-rose-400 font-semibold block">
                    Avis Clinique de la Praticienne
                  </span>
                  <p className="text-sm font-medium leading-relaxed italic text-stone-200">
                    "{result.professionalVerdict}"
                  </p>
                </div>

                {result.recommendedCleanAlternatives && result.recommendedCleanAlternatives.length > 0 && (
                  <div className="border-t border-stone-800 pt-4 space-y-2">
                    <span className="text-xs font-semibold text-stone-300 block">
                      Alternatives Saines & Professionnelles à Recommander en Cabine :
                    </span>
                    <div className="space-y-2">
                      {result.recommendedCleanAlternatives.map((alt, i) => (
                        <div key={i} className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/80 text-xs">
                          <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                            <ArrowRight className="w-3.5 h-3.5" />
                            {alt.productType} : {alt.keyActiveAlternative}
                          </div>
                          <p className="text-stone-300 mt-1 text-[11px]">{alt.professionalAdvice}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400 space-y-3">
              <Scan className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-sm font-medium text-stone-600">Aucun produit sélectionné</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Custom Product to Salon Catalog */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden my-auto border border-stone-200">
            <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Ajouter un Produit à la Base de l'Institut
              </h3>
              <button onClick={() => setShowAddCustomModal(false)} className="text-stone-400 hover:text-stone-700">
                Fermer
              </button>
            </div>

            <form onSubmit={handleCreateCustomProduct} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nom du Produit *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Émulsion Détox O3"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Marque *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Laboratoire Pro"
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Catégorie</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  >
                    <option value="Soin du Visage">Soin du Visage</option>
                    <option value="Soin du Corps">Soin du Corps</option>
                    <option value="Soin Minceur & Fermeté">Soin Minceur & Fermeté</option>
                    <option value="Protection Solaire">Protection Solaire</option>
                    <option value="Démaquillant & Nettoyant">Démaquillant & Nettoyant</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Prix Vente Conseillé</label>
                  <input
                    type="text"
                    placeholder="Ex: 35,00 €"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Code-barre (facultatif)</label>
                <input
                  type="text"
                  placeholder="Ex: 3700..."
                  value={customBarcode}
                  onChange={(e) => setCustomBarcode(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Formule INCI complète</label>
                <textarea
                  rows={4}
                  placeholder="Aqua, Glycerin, Niacinamide, Squalane..."
                  value={customInci}
                  onChange={(e) => setCustomInci(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-rose-950 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Analyser & Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
