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
  DollarSign,
} from 'lucide-react';
import { ProductAnalysisResult, ClientProfile } from '../types';
import { analyzeProductApi, extractKeyIngredientsWithPurpose } from '../services/apiService';
import { VERIFIED_PRODUCTS_CATALOG } from '../data/cosmeticsDatabase';
import { useLanguage } from '../context/LanguageContext';

import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';

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
  const { t } = useLanguage();
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

  // Camera & Scanning Engine state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const resultCardRef = useRef<HTMLDivElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const zxingControlsRef = useRef<IScannerControls | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Synchronize stream with video element whenever camera becomes active
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [cameraActive]);

  // Play audio scan beep
  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio playback might be restricted before user interaction
    }
  };

  // Called immediately when a barcode is recognized
  const onCodeDetected = (code: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    playScanBeep();
    setScannedFeedback(`Code détecté : ${code} ! Analyse immédiate...`);
    stopCamera();
    setBarcodeInput(code);
    handleAnalyze({ barcode: code });
  };

  // Switch between front and rear cameras
  const toggleCameraFacing = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    if (cameraActive) {
      stopCamera();
      setTimeout(() => {
        startCamera(nextMode);
      }, 150);
    }
  };

  // Start Camera with progressive fallback (ideal environment -> ideal user -> simple -> video: true)
  const startCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
    setCameraError(null);
    setScannedFeedback(null);
    isProcessingRef.current = false;

    try {
      stopCamera();

      let stream: MediaStream | null = null;
      // 1. Try high-res with preferred facing mode
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (e1) {
        // 2. Try with facing mode only
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facing } },
          });
        } catch (e2) {
          // 3. Fallback to any camera available (laptop webcam, USB webcam)
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
      }

      if (!stream) {
        throw new Error('Aucun flux vidéo disponible');
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);

      // Fast hardware-accelerated BarcodeDetector (Chrome Android, Desktop Chrome, Edge, Safari 17+)
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
          });

          scanIntervalRef.current = window.setInterval(async () => {
            if (isProcessingRef.current || !videoRef.current || videoRef.current.readyState < 2) return;
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                if (code && code.trim().length >= 4) {
                  onCodeDetected(code.trim());
                }
              }
            } catch (err) {
              // Frame dropped, keep listening
            }
          }, 100);
        } catch (detectorErr) {
          console.warn('Native BarcodeDetector init note:', detectorErr);
        }
      }

      // Parallel ZXing reader for formats and fallback
      try {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;
        if (videoRef.current) {
          const controls = await reader.decodeFromVideoElement(videoRef.current, (barcodeResult) => {
            if (barcodeResult && !isProcessingRef.current) {
              const code = barcodeResult.getText();
              if (code && code.trim().length >= 4) {
                onCodeDetected(code.trim());
              }
            }
          });
          zxingControlsRef.current = controls;
        }
      } catch (zxingErr) {
        console.warn('ZXing live stream reader note:', zxingErr);
      }
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      setCameraError(
        'Accès caméra non disponible sur cet appareil. Utilisez les raccourcis 1-Clic ci-dessous, la saisie manuelle ou téléversez une photo.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (zxingControlsRef.current) {
      try {
        zxingControlsRef.current.stop();
      } catch (e) {}
      zxingControlsRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera(cameraFacingMode);
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

    // 1. Try BarcodeDetector on canvas
    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
        });
        const barcodes = await barcodeDetector.detect(canvas);
        if (barcodes && barcodes.length > 0) {
          const code = barcodes[0].rawValue;
          if (code && code.trim().length >= 4) {
            onCodeDetected(code.trim());
            return;
          }
        }
      } catch (e) {}
    }

    // 2. Try ZXing on image snapshot
    try {
      const reader = new BrowserMultiFormatReader();
      const codeResult = await reader.decodeFromImageUrl(dataUrl);
      if (codeResult && codeResult.getText()) {
        onCodeDetected(codeResult.getText().trim());
        return;
      }
    } catch (e) {
      // no barcode detected on frame, proceed with AI label analysis
    }

    stopCamera();
    setScannedFeedback('Lecture de l’étiquette INCI par Vision IA...');
    handleAnalyze({ labelPhotoBase64: dataUrl });
  };

  // Upload image handler: scans barcode in image OR analyzes composition label
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;

      // 1. Try BarcodeDetector
      if ('BarcodeDetector' in window) {
        try {
          const img = new Image();
          img.src = dataUrl;
          await img.decode();
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
          });
          const barcodes = await barcodeDetector.detect(img);
          if (barcodes && barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            if (code && code.trim().length >= 4) {
              onCodeDetected(code.trim());
              return;
            }
          }
        } catch (e) {}
      }

      // 2. Attempt to decode barcode from uploaded image with ZXing
      try {
        const codeReader = new BrowserMultiFormatReader();
        const detected = await codeReader.decodeFromImageUrl(dataUrl);
        if (detected && detected.getText()) {
          onCodeDetected(detected.getText().trim());
          return;
        }
      } catch (err) {
        // No barcode detected in image, fallback to Gemini label reading
      }

      setScannedFeedback('Analyse du packaging cosmétique par Vision IA...');
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
      // Auto-scroll to results so user never misses the analysis
      setTimeout(() => {
        resultCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setScannedFeedback(null);
      isProcessingRef.current = false;
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
            {t.scanner.title}
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            {t.scanner.subtitle}
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
                {t.scanner.tabCamera.replace('📷 ', '')}
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
                {t.scanner.tabBarcode.replace('🔢 ', '')}
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
                {t.scanner.tabCatalog.replace('📚 ', '')} ({VERIFIED_PRODUCTS_CATALOG.length})
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
                {t.scanner.tabInci.replace('🧪 ', '')}
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
                <div className="relative aspect-4/3 bg-stone-950 rounded-xl overflow-hidden flex items-center justify-center border border-stone-800 shadow-inner">
                  {/* The video element is ALWAYS mounted, so videoRef.current is NEVER null and receives the stream immediately */}
                  <video
                    ref={(el) => {
                      videoRef.current = el;
                      if (el && streamRef.current && el.srcObject !== streamRef.current) {
                        el.srcObject = streamRef.current;
                        el.play().catch(() => {});
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transition-opacity duration-200 ${
                      cameraActive ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
                    }`}
                  />

                  {/* Realtime Detection Banner */}
                  {scannedFeedback && (
                    <div className="absolute top-3 left-3 right-3 bg-emerald-600 text-white text-xs font-semibold py-2.5 px-3 rounded-xl shadow-lg flex items-center justify-between gap-2 z-20 animate-bounce">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0 text-white" />
                        <span>{scannedFeedback}</span>
                      </div>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                    </div>
                  )}

                  {cameraActive ? (
                    <>
                      {/* Flip Camera Button */}
                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        className="absolute top-3 right-3 p-2 bg-stone-900/80 hover:bg-stone-900 text-white rounded-lg backdrop-blur-xs text-xs font-medium flex items-center gap-1.5 shadow-md z-10 transition-colors cursor-pointer"
                        title="Changer de caméra (avant / arrière)"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="text-[10px] hidden sm:inline">{cameraFacingMode === 'environment' ? 'Arrière' : 'Avant'}</span>
                      </button>

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
                      <div className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/90 bg-stone-950/70 py-1.5 px-3 mx-4 rounded-lg backdrop-blur-xs">
                        Pointez vers le code-barre (EAN-13 / UPC) d’un produit cosmétique
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center text-stone-400 space-y-3 z-10">
                      <Camera className="w-10 h-10 mx-auto text-stone-500 opacity-60" />
                      <p className="text-xs text-stone-300">{cameraError || 'Flux vidéo en attente d’activation...'}</p>
                      <button
                        onClick={() => startCamera(cameraFacingMode)}
                        className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        Allumer la Caméra
                      </button>
                    </div>
                  )}
                </div>

                {/* Camera Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={captureFrame}
                    disabled={!cameraActive || loading}
                    className="flex-1 py-2.5 bg-rose-900 hover:bg-rose-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Photographier & Décrypter
                  </button>
                  <button
                    onClick={cameraActive ? stopCamera : () => startCamera(cameraFacingMode)}
                    className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer"
                    title={cameraActive ? 'Mettre en pause' : 'Redémarrer la caméra'}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Instant Scanned Product Card (Directly visible on screen without needing to scroll) */}
                {result && (
                  <div className="bg-stone-900 text-white rounded-2xl p-4 space-y-3 shadow-lg border border-stone-800 animate-fade-in">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 block">
                          Produit Identifié à l'Écran
                        </span>
                        <h4 className="font-serif font-bold text-white text-base truncate">
                          {result.brand ? `${result.brand} - ` : ''}{result.productName}
                        </h4>
                        <p className="text-[11px] text-stone-400">
                          {result.barcode ? `EAN : ${result.barcode}` : result.category}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-xl font-bold text-center shrink-0 ${
                          result.safetyScore >= 80
                            ? 'bg-emerald-600 text-white'
                            : result.safetyScore >= 60
                            ? 'bg-amber-500 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        <div className="text-lg leading-none font-bold">{result.safetyScore}</div>
                        <div className="text-[9px] uppercase tracking-wider opacity-85">/100</div>
                      </div>
                    </div>

                    {result.isControversialOrDangerous ? (
                      <div className="p-2.5 bg-rose-950/80 border border-rose-600/50 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="font-semibold text-[11px] leading-tight">
                          ⚠️ ALERTE : Ingrédients controversés ou perturbateurs endocriniens détectés.
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-[11px] leading-tight">
                          ✅ Formulation sûre & saine sans substances toxiques critiques.
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          resultCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Voir la fiche toxicologique complète</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startCamera(cameraFacingMode)}
                        className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Re-scanner</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 1-Click Quick Barcodes on Camera Tab */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-rose-600" />
                      Test 1-Clic Sans Produit Sous la Main :
                    </span>
                    <span className="text-[10px] text-stone-400">Codes certifiés</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '💧 Bioderma H2O', code: '3401345934538', type: 'clean' },
                      { label: '🧴 Nivea (Danger)', code: '4005808111220', type: 'danger' },
                      { label: '🌿 Lipikar AP+M', code: '3337875597203', type: 'clean' },
                      { label: '🧼 CeraVe Nettoyant', code: '3337872412486', type: 'clean' },
                      { label: '🍇 Caudalie Minceur', code: '3525722028889', type: 'clean' },
                    ].map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          setBarcodeInput(item.code);
                          handleAnalyze({ barcode: item.code });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all flex items-center gap-1 cursor-pointer ${
                          item.type === 'danger'
                            ? 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
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
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      Analyser
                    </button>
                  </div>
                </div>

                {/* 1-Click Quick Barcodes on Barcode Tab */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-rose-600" />
                      Tests Rapides 1-Clic :
                    </span>
                    <span className="text-[10px] text-stone-400">Cliquez pour tester</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '💧 Bioderma H2O', code: '3401345934538', type: 'clean' },
                      { label: '🧴 Nivea (Danger)', code: '4005808111220', type: 'danger' },
                      { label: '🌿 Lipikar AP+M', code: '3337875597203', type: 'clean' },
                      { label: '🧼 CeraVe Nettoyant', code: '3337872412486', type: 'clean' },
                      { label: '🍇 Caudalie Minceur', code: '3525722028889', type: 'clean' },
                    ].map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          setBarcodeInput(item.code);
                          handleAnalyze({ barcode: item.code });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all flex items-center gap-1 cursor-pointer ${
                          item.type === 'danger'
                            ? 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instant Result Preview Card for Barcode Tab */}
                {result && (
                  <div className="bg-stone-900 text-white rounded-2xl p-3.5 space-y-2.5 shadow-md border border-stone-800 animate-fade-in">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 block">
                          Résultat Décrypté
                        </span>
                        <h4 className="font-serif font-bold text-white text-sm truncate">
                          {result.brand ? `${result.brand} - ` : ''}{result.productName}
                        </h4>
                        <p className="text-[10px] text-stone-400">
                          {result.barcode ? `EAN : ${result.barcode}` : result.category}
                        </p>
                      </div>
                      <div
                        className={`px-2.5 py-1 rounded-lg font-bold text-center shrink-0 ${
                          result.safetyScore >= 80
                            ? 'bg-emerald-600 text-white'
                            : result.safetyScore >= 60
                            ? 'bg-amber-500 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        <div className="text-base leading-none font-bold">{result.safetyScore}</div>
                        <div className="text-[8px] uppercase tracking-wider opacity-85">/100</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        resultCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Consulter la fiche toxicologique complète</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

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
                          setTimeout(() => {
                            resultCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs border transition-all flex items-center justify-between cursor-pointer ${
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
                        setTimeout(() => {
                          resultCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
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

          {/* Quick Client Association Box - Adapted for 9/16 Mobile & Desktop */}
          {result && (
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-900 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-800 shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-bold text-stone-900 text-xs truncate">
                      Enregistrer dans le dossier cliente
                    </span>
                    <span className="text-[10px] text-stone-500 block truncate">
                      Historique de soins & ordonnance
                    </span>
                  </div>
                </div>
                {selectedClientId && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shrink-0">
                    Prêt
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full h-11 sm:h-10 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 truncate"
                >
                  <option value="">Sélectionnez une cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.skinType || 'Sans bilan'})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSaveToClient}
                  disabled={!selectedClientId}
                  className="w-full sm:w-auto h-11 sm:h-10 px-4 bg-rose-950 hover:bg-rose-900 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Associer au dossier</span>
                </button>
              </div>

              {savedSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="text-[11px] leading-tight font-medium">{savedSuccessMsg}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: In-Depth Product Toxicology & Pro Verdict */}
        <div ref={resultCardRef} className="lg:col-span-7">
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
                <div className="p-4 bg-rose-600 text-white space-y-2.5 shadow-inner">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-6 h-6 shrink-0 animate-bounce" />
                      <div>
                        <div className="font-bold text-sm uppercase tracking-wide">
                          ⚠️ ALERTE : INGRÉDIENTS DANGEREUX OU CONTROVERSÉS DÉTECTÉS
                        </div>
                        <div className="text-xs text-rose-100">
                          Attention esthéticienne : cette formulation renferme des composés toxiques, perturbateurs endocriniens ou occlusifs.
                        </div>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-white text-rose-900 font-bold rounded-lg shrink-0">
                      À DÉCONSEILLER
                    </span>
                  </div>
                  {result.dangerousOrControversialIngredients.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-rose-500/60">
                      <span className="text-[11px] font-semibold text-rose-100 mr-1 self-center">Alertes identifiées :</span>
                      {result.dangerousOrControversialIngredients.map((d, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-rose-800 text-rose-100 font-semibold border border-rose-700/50">
                          ⚠️ {d.name} ({d.category.replace(/_/g, ' ')})
                        </span>
                      ))}
                    </div>
                  )}
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

              {/* KEY INGREDIENTS, PURPOSE & SAFETY RATING */}
              {(() => {
                const keyIngredients =
                  result.keyIngredientsWithPurpose && result.keyIngredientsWithPurpose.length > 0
                    ? result.keyIngredientsWithPurpose
                    : extractKeyIngredientsWithPurpose(
                        result.extractedInci || [],
                        result.dangerousOrControversialIngredients || []
                      );

                return (
                  <div className="p-6 space-y-4 bg-stone-50/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-rose-800 block">
                          Formulation & Pharmacologie Cosmétique
                        </span>
                        <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-1.5">
                          <Sliders className="w-4 h-4 text-rose-700" />
                          Ingrédients Clés, Rôle dans la Formule & Note de Sécurité ({keyIngredients.length})
                        </h3>
                      </div>
                      <span className="text-[11px] text-stone-500 hidden sm:inline">
                        Évaluation dermo-cosmétique
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {keyIngredients.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                            item.safetyRating === 'dangereux'
                              ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                              : item.safetyRating === 'à risque'
                              ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                              : item.safetyRating === 'modéré'
                              ? 'bg-stone-50 border-stone-200 text-stone-800'
                              : 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-stone-900">{item.name}</span>
                              {item.isDangerousOrControversial && (
                                <span className="px-2 py-0.5 rounded-md bg-rose-200 text-rose-900 text-[10px] font-bold tracking-wide">
                                  ⚠️ Ingrédient controversé / dangereux
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-700">
                              <span className="font-semibold text-stone-900">Rôle cosmétique :</span> {item.purpose}
                            </div>
                            {item.hazardDetails && (
                              <div className="text-[11px] text-rose-800 font-medium bg-rose-100/60 p-1.5 rounded-lg">
                                <strong>Danger identifié :</strong> {item.hazardDetails}
                              </div>
                            )}
                            {item.scientificContext && (
                              <div className="text-[10px] text-stone-500 italic">
                                Source : {item.scientificContext}
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center self-start sm:self-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-2xs ${
                                item.safetyRating === 'dangereux'
                                  ? 'bg-rose-600 text-white'
                                  : item.safetyRating === 'à risque'
                                  ? 'bg-amber-500 text-white'
                                  : item.safetyRating === 'modéré'
                                  ? 'bg-stone-200 text-stone-800'
                                  : 'bg-emerald-600 text-white'
                              }`}
                            >
                              Note : {item.safetyRating}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

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

              {/* Quick Save to Client bar on Mobile 9/16 & Desktop */}
              <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-6 h-6 rounded-md bg-rose-100 flex items-center justify-center text-rose-800 shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-stone-800 text-[11px] shrink-0">
                    Dossier cliente :
                  </span>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="flex-1 min-w-0 h-9 px-2.5 bg-white border border-stone-300 rounded-lg text-xs truncate"
                  >
                    <option value="">Choisir une cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleSaveToClient}
                  disabled={!selectedClientId}
                  className="w-full sm:w-auto h-9 px-4 bg-rose-950 hover:bg-rose-900 active:scale-[0.98] disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all shrink-0 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Enregistrer dans son dossier</span>
                </button>
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
