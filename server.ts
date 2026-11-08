import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import Stripe from 'stripe';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(
  express.json({
    limit: '25mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Enable global CORS for all domains, including PWABuilder crawlers and browser fetch
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range, X-Requested-With');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Explicit manifest.json endpoint with full CORS and correct MIME type
app.get('/manifest.json', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.resolve(__dirname, 'public', 'manifest.json'));
});

// Dedicated Service Worker handling with root scope and fresh cache headers
app.get('/sw.js', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.resolve(__dirname, 'public', 'sw.js'));
});

// Privacy Policy endpoint (Google Play Store & PWABuilder compliance)
app.get(['/privacy', '/privacy.html', '/politique-de-confidentialite'], (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.sendFile(path.resolve(__dirname, 'public', 'privacy.html'));
});

// Google Play Console Assets & Icons download hub
app.get(['/telecharger-icones', '/telecharger-icones.html', '/google-play-assets'], (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.sendFile(path.resolve(__dirname, 'public', 'telecharger-icones.html'));
});

// Dedicated Facebook Promo link with Open Graph preview & auto-redirect to Google Play
app.get(['/promo-facebook', '/promo-facebook.html', '/promo-fb', '/facebook'], (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.sendFile(path.resolve(__dirname, 'public', 'promo-facebook.html'));
});

// Digital Asset Links for Android App Links & Google Play Console Domain Validation
// Meets Google Play requirements: HTTP 200, no redirect, Content-Type: application/json; charset=utf-8
app.get(['/.well-known/assetlinks.json', '/assetlinks.json'], (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  // 1. Check if user configured ANDROID_SHA256_FINGERPRINT in env vars / AI Studio secrets
  const envFingerprints =
    process.env.ANDROID_SHA256_FINGERPRINT ||
    process.env.DIGITAL_ASSET_LINKS_SHA256;

  if (envFingerprints) {
    const list = envFingerprints
      .split(/[\n,]+/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);

    const statement = [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'pro.dermesthetic.app',
          sha256_cert_fingerprints: list,
        },
      },
    ];
    return res.status(200).json(statement);
  }

  // 2. Read from static file public/.well-known/assetlinks.json
  const assetlinksPath = path.resolve(__dirname, 'public', '.well-known', 'assetlinks.json');
  if (fs.existsSync(assetlinksPath)) {
    try {
      const fileData = fs.readFileSync(assetlinksPath, 'utf-8');
      const parsed = JSON.parse(fileData);
      return res.status(200).json(parsed);
    } catch (e) {
      console.warn('Could not parse assetlinks.json file:', e);
    }
  }

  // 3. Fallback standard Digital Asset Links structure
  return res.status(200).json([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'pro.dermesthetic.app',
        sha256_cert_fingerprints: [
          '14:6D:E9:EB:18:66:47:FD:A2:29:43:8B:1A:1C:CE:F6:C3:0A:94:41:F0:8A:E2:E2:B0:1B:67:86:14:8B:2A:4E',
        ],
      },
    },
  ]);
});

// Admin API to read current assetlinks status
app.get('/api/assetlinks', (req, res) => {
  const assetlinksPath = path.resolve(__dirname, 'public', '.well-known', 'assetlinks.json');
  let currentJson: any = null;
  try {
    if (fs.existsSync(assetlinksPath)) {
      currentJson = JSON.parse(fs.readFileSync(assetlinksPath, 'utf-8'));
    }
  } catch (err) {
    currentJson = null;
  }

  const envFingerprints =
    process.env.ANDROID_SHA256_FINGERPRINT ||
    process.env.DIGITAL_ASSET_LINKS_SHA256 ||
    null;

  const activeFingerprints = envFingerprints
    ? envFingerprints.split(/[\n,]+/).map((s) => s.trim().toUpperCase()).filter(Boolean)
    : currentJson?.[0]?.target?.sha256_cert_fingerprints || [];

  res.json({
    packageName: 'pro.dermesthetic.app',
    domain: 'ais-pre-xqni426rbj4g2zmdisysfc-665307952988.europe-west2.run.app',
    activeFingerprints,
    hasEnvOverride: !!envFingerprints,
    assetlinksUrl: '/.well-known/assetlinks.json',
    statement: currentJson,
  });
});

// Admin API to update assetlinks.json with new SHA-256 fingerprints from Google Play Console
app.post('/api/assetlinks', (req, res) => {
  try {
    const { fingerprints, fingerprint } = req.body;
    let rawList: string[] = [];

    if (Array.isArray(fingerprints)) {
      rawList = fingerprints;
    } else if (typeof fingerprint === 'string') {
      const trimmed = fingerprint.trim();
      // 1. Try parsing if user pasted the entire Google Play JSON snippet
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed[0]?.target?.sha256_cert_fingerprints) {
          rawList = parsed[0].target.sha256_cert_fingerprints;
        } else if (parsed?.target?.sha256_cert_fingerprints) {
          rawList = parsed.target.sha256_cert_fingerprints;
        }
      } catch {
        // 2. Extract with regex if it contains colon-separated SHA-256
        const matches = trimmed.match(/(?:[0-9A-Fa-f]{2}[:\s-]){31}[0-9A-Fa-f]{2}/g);
        if (matches && matches.length > 0) {
          rawList = matches.map((m) => m.replace(/[\s-]+/g, ':').toUpperCase());
        } else {
          rawList = trimmed.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
        }
      }
    }

    if (!rawList.length) {
      return res.status(400).json({ error: 'Au moins une empreinte SHA-256 est requise.' });
    }

    // Format check & clean (e.g. normalize to XX:XX:XX... format)
    const cleaned = rawList.map((fp) => {
      let str = fp.replace(/[^A-Fa-f0-9:]/g, '').toUpperCase();
      if (!str.includes(':') && str.length === 64) {
        str = str.match(/.{1,2}/g)?.join(':') || str;
      }
      return str;
    }).filter((s) => s.length >= 64);

    if (!cleaned.length) {
      return res.status(400).json({
        error: 'Empreinte SHA-256 invalide. Format attendu : XX:XX:XX... (32 octets hexadécimaux).',
      });
    }

    const statement = [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'pro.dermesthetic.app',
          sha256_cert_fingerprints: cleaned,
        },
      },
    ];

    const dirPath = path.resolve(__dirname, 'public', '.well-known');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const assetlinksPath = path.resolve(dirPath, 'assetlinks.json');
    fs.writeFileSync(assetlinksPath, JSON.stringify(statement, null, 2), 'utf-8');

    return res.json({
      success: true,
      message: 'Fichier Digital Asset Links mis à jour avec succès.',
      activeFingerprints: cleaned,
      statement,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur lors de la mise à jour.' });
  }
});

app.use(
  express.static(path.resolve(__dirname, 'public'), {
    dotfiles: 'allow',
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  })
);

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Initialize Stripe Client
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      appInfo: {
        name: 'DermEstheticPro',
        version: '1.0.0',
      },
    })
  : null;

// Helper function to call Gemini with automatic fallback on 503 / model demand spikes
async function generateJsonWithFallback(contents: any, preferredModel = 'gemini-flash-latest') {
  if (!ai) throw new Error('Service IA non initialisé.');
  const models = [preferredModel, 'gemini-3.8-flash', 'gemini-3.1-flash-lite'].filter(
    (m, i, arr) => arr.indexOf(m) === i
  );

  let lastError: any = null;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          responseMimeType: 'application/json',
        },
      });
      const rawJson = response.text || '{}';
      return JSON.parse(rawJson);
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying fallback:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError;
}

// Proxy Open Beauty Facts + Open Food Facts to avoid CORS issues
app.get('/api/openbeautyfacts/:barcode', async (req, res) => {
  const { barcode } = req.params;
  const cleanCode = (barcode || '').trim();
  if (!cleanCode) return res.status(400).json({ error: 'Code-barre manquant' });

  const candidateUrls = [
    `https://world.openbeautyfacts.org/api/v0/product/${cleanCode}.json`,
    `https://world.openbeautyfacts.org/api/v2/product/${cleanCode}.json`,
    `https://world.openfoodfacts.org/api/v0/product/${cleanCode}.json`,
  ];

  for (const url of candidateUrls) {
    try {
      const fetchResponse = await fetch(url, {
        headers: {
          'User-Agent': 'DermEstheticPro-EstheticianApp/1.0 (contact@dermestheticpro.local)',
        },
      });

      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        if (data && (data.status === 1 || data.product) && data.product) {
          return res.json(data);
        }
      }
    } catch (e) {
      // try next source
    }
  }

  return res.status(404).json({ error: 'Produit non trouvé sur Open Beauty Facts' });
});

// Endpoint: Skin Diagnostic Analysis (Visage & Corps)
app.post('/api/gemini/skin-analysis', async (req, res) => {
  try {
    const {
      photoBase64,
      photoMimeType = 'image/jpeg',
      treatmentArea, // "visage" | "corps"
      specificZone,
      clientName,
      clientAge,
      skinType,
      concerns,
      sensations,
      practitionerNotes,
      language = 'fr',
    } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Service IA non initialisé. Veuillez configurer GEMINI_API_KEY dans vos variables d’environnement.',
      });
    }

    const langInstructions: Record<string, string> = {
      fr: 'Rédige impérativement l’ensemble des synthèses, titres, protocoles, étapes cabine, ordonnance beauté et conseils en FRANÇAIS soigné et professionnel.',
      en: 'Write ALL summaries, titles, salon protocols, cabin steps, home prescriptions, and professional advice in refined, professional ENGLISH.',
      es: 'Redacta OBLIGATORIAMENTE todos los análisis, protocolos, pasos de cabina, prescripción y consejos en ESPAÑOL profesional.',
      it: 'Redigi OBBLIGATORIAMENTE tutte le analisi, protocolli, passaggi in cabina, prescrizione e consigli in ITALIANO professionale.',
      de: 'Verfasse ALLE Analysen, Protokolle, Behandlungsschritte, Heimpflege-Verschreibungen und Ratschläge auf professionellem DEUTSCH.',
      pt: 'Redija OBRIGATORIAMENTE todas as análises, protocolos de cabine, prescrição de cuidados e conselhos em PORTUGUÊS profissional.',
    };
    const langRule = langInstructions[language] || langInstructions.fr;

    const promptText = `
Tu es un dermatologue consultant expert et maître formateur en esthétique professionnelle clinique pour les instituts de beauté et centres de soins dermo-esthétiques.
Effectue un diagnostic cutané ultra-précis, bienveillant et hautement professionnel pour une cliente en cabine d'esthétique.

LANGUE DE RÉPONSE OBLIGATOIRE :
${langRule}

Informations du bilan d'observation :
- Cible : ${treatmentArea === 'corps' ? 'SOIN DU CORPS' : 'SOIN DU VISAGE'}
- Zone précise : ${specificZone || 'Zone globale'}
- Profil cliente : ${clientName || 'Cliente'}, ${clientAge ? `${clientAge} ans` : 'Âge non spécifié'}
- Type de peau perçu par l'esthéticienne : ${skinType || 'À déterminer'}
- Préoccupations majeures signalées : ${Array.isArray(concerns) ? concerns.join(', ') : concerns || 'Bilan de routine'}
- Sensations ressenties par la cliente : ${Array.isArray(sensations) ? sensations.join(', ') : sensations || 'Non spécifié'}
- Remarques cliniques de la praticienne : ${practitionerNotes || 'Aucune'}

${photoBase64 ? 'Une photo macroscopique haute résolution de la zone examinée est fournie. Analyse attentivement la texture du grain de peau, les pores, le film hydrolipidique, la vascularisation, les taches pigmentaires, les zones d’atrophie ou perte de tonicité, et les microlésions.' : 'Bilan basé sur l’interrogatoire clinique et les observations tactiles de la praticienne.'}

Réponds STRICTEMENT sous forme de JSON valide correspondant à la structure requise :
- diagnosticSummary: synthèse claire et valorisante de l'état cutané (3-4 phrases).
- metrics: { hydrationScore: number (0-100), sebumScore: number (0-100), wrinklesScore: number (0-100), pigmentSpotsScore: number (0-100), rednessSensitivityScore: number (0-100), elasticityFirmnessScore: number (0-100), poresTextureScore: number (0-100), celluliteGrade: "aucune" | "stade_1_aqueuse" | "stade_2_adipeuse" | "stade_3_fibreuse" (si corps), stretchMarksSeverity: "aucune" | "légère" | "modérée" | "prononcée" (si corps), lymphaticRetention: "faible" | "modérée" | "sévère" (si corps) }
- identifiedConditions: tableau d'évaluation précise des conditions cutanées courantes détectées sur l'image et l'observation :
  Pour chaque condition (notamment Acné / Comédons, Rougeurs / Couperose, Rides / Perte d'élasticité, Taches pigmentaires / Teint hétérogène, Déshydratation, et si corps: Cellulite, Vergetures) :
  {
    "id": string (ex: "acne", "redness", "wrinkles", "dark_spots", "dehydration", "cellulite"),
    "name": string (ex: "Acné & Imperfections", "Rougeurs & Couperose / Rosacée", "Rides & Ridules", "Taches Pigmentaires", "Déshydratation Épidermique"),
    "detected": boolean,
    "severity": "faible" | "modérée" | "sévère",
    "confidenceScore": number (pourcentage de 0 à 100),
    "description": string (explication visuelle et clinique précise des manifestations observées),
    "affectedZone": string (ex: "Front et ailes du nez", "Joues et pommettes"),
    "suggestedProTreatment": string (soin professionnel en cabine recommandé spécifiquement pour cette condition : ex. "Luminothérapie LED Bleue 415nm & Peeling Salicylique doux", "Drainage lymphatique & Cryothérapie"),
    "suggestedProducts": string[] (3 à 4 actifs et produits ciblés recommandés pour traiter cette condition : ex. ["Sérum Niacinamide 5% & Zinc", "Nettoyant doux sans savon", "Fluide non comédogène"])
  }
- skinTypeAssessment: { mainType: string, phototypeFitzpatrick: string, hydrationLevel: "déshydratée" | "équilibrée" | "sèche", lipidLevel: "alipidique" | "normale" | "hyperséborrhéique" }
- priorityIssues: array d'objets avec { issue: string, severity: "faible" | "modérée" | "forte", affectedArea: string, scientificExplanation: string }
- cabinProtocol: protocole complet de cabine en institut comprenant :
  - title: nom du protocole sur-mesure (ex: "Protocole Restructurant Barrière Cutanée & Détox O3")
  - targetGoal: objectif principal
  - duration: durée recommandée en minutes
  - steps: liste de 5 à 7 étapes techniques (ex: Démaquillage lacté prébiotique, Peeling enzymatique doux, Vapeur ozone & ultrasons, Modelage dermo-stimulant aux manœuvres spécifiques, Masque hydro-plastifiant ou biocellulose, Sérum concentré & LED thérapie rouge/bleue, Crème barrière SPF50). Chaque étape comprend: { stepNumber: number, phase: string, actionName: string, equipmentOrTechnique: string, activeIngredients: string[], cautions: string }
- homePrescription: ordonnance beauté personnalisée à domicile :
  - morning: array de 3 à 4 étapes { step: string, category: string, keyActives: string, usageTip: string }
  - evening: array de 3 à 4 étapes { step: string, category: string, keyActives: string, usageTip: string }
  - weeklyCare: string (soin hebdomadaire à la maison)
  - lifestyleAdvice: array de 3 conseils d'hygiène de vie (sommeil, hydratation, alimentation, protection UV)
- recommendedActiveIngredients: array de 4 à 6 molécules bienfaisantes (ex: Niacinamide, Acide hyaluronique multi-moléculaire, Céramides NP, Bakuchiol, Centella Asiatica)
- activesToAvoid: array de 2 à 4 ingrédients à proscrire ou manier avec précaution pour cette peau (ex: AHA à fort pourcentage, sulfates irritants, alcool dénaturé, huiles essentielles photosensibilisantes).
`;

    const contentsParts: any[] = [];
    if (photoBase64) {
      const cleanBase64 = photoBase64.replace(/^data:image\/\w+;base64,/, '');
      contentsParts.push({
        inlineData: {
          mimeType: photoMimeType,
          data: cleanBase64,
        },
      });
    }
    contentsParts.push({ text: promptText });

    const parsed = await generateJsonWithFallback(
      contentsParts.length === 1 ? contentsParts[0].text : { parts: contentsParts },
      'gemini-flash-latest'
    );
    return res.json(parsed);
  } catch (error: any) {
    console.error('Skin analysis error:', error);
    return res.status(500).json({
      error: "Erreur lors de l'analyse cutanée",
      details: error.message || 'Impossible de générer le diagnostic.',
    });
  }
});

// Endpoint: Product INCI & Hazard Scan Analysis
app.post('/api/gemini/product-analysis', async (req, res) => {
  try {
    const {
      barcode,
      productName,
      brand,
      ingredientsList,
      category,
      labelPhotoBase64,
      labelPhotoMimeType = 'image/jpeg',
      language = 'fr',
    } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Service IA non initialisé. Veuillez configurer GEMINI_API_KEY dans vos variables d’environnement.',
      });
    }

    const langInstructions: Record<string, string> = {
      fr: 'Rédige impérativement le résumé d’expertise, les explications toxicologiques, le verdict professionnel et les avis en FRANÇAIS.',
      en: 'Write ALL summaries, toxicological explanations, hazards, professional verdicts, and reviews in ENGLISH.',
      es: 'Redacta OBLIGATORIAMENTE el resumen, explicaciones de riesgos, veredicto profesional y reseñas en ESPAÑOL.',
      it: 'Redigi OBBLIGATORIAMENTE il riassunto, le spiegazioni tossicologiche, il verdetto professionale e le recensioni in ITALIANO.',
      de: 'Verfasse ALLE Zusammenfassungen, toxikologischen Erklärungen, Gefahren, das Expertenurteil und Bewertungen auf DEUTSCH.',
      pt: 'Redija OBRIGATORIAMENTE o resumo, as explicações toxicológicas, o parecer profissional e as avaliações em PORTUGUÊS.',
    };
    const langRule = langInstructions[language] || langInstructions.fr;

    const promptText = `
Tu es un toxicologue cosmétologue et expert en formulation de soins esthétiques (réglementation européenne CE 1223/2009, CosIng, normes Clean Beauty, INCI Beauty & Yuka).
Analyse rigoureusement ce produit cosmétique pour les esthéticiennes professionnelles.

LANGUE DE RÉPONSE OBLIGATOIRE :
${langRule}

Données du produit :
- Nom : ${productName || 'Produit cosmétique inconnu'}
- Marque : ${brand || 'Non spécifiée'}
- Code-barre : ${barcode || 'Non renseigné'}
- Catégorie de soin : ${category || 'Soin visage / corps'}
- Liste INCI fournie : ${ingredientsList || (labelPhotoBase64 ? 'Lire et extraire la liste INCI depuis la photo de l’étiquette fournie.' : 'Non fournie, évaluer le produit sur base de sa référence exacte.')}

Objectif impératif :
1. Calculer un score de sécurité INCI sur 100 (100 = 100% clean et sûr, 0 = très toxique ou dangereux).
2. Repérer IMMÉDIATEMENT tous les ingrédients dangereux, controversés ou à risque pour la santé et la peau :
   - Perturbateurs endocriniens avérés ou suspectés (BHT, BHA, Parabènes, Phtalates, Benzophénone, Octinoxate, Homosalate, Triclosan...)
   - Cancérogènes suspectés, impuretés PEG, libérateurs de formaldéhyde (DMDM hydantoin, Quaternium-15, Imidazolidinyl urea, Diazolidinyl urea, 1,4-dioxane traces...)
   - Tensioactifs sulfatés décapants (Sodium Lauryl Sulfate, Sodium Laureth Sulfate...)
   - Silicones lourds & microplastiques étouffants (Cyclotetrasiloxane D4, Cyclopentasiloxane D5, Dimethicone en tête d'INCI...)
   - Huiles minérales occlusives (Paraffinum Liquidum, Petrolatum, Mineral Oil...)
   - Allergènes de parfum réglementés (Limonene, Linalool, Geraniol, Citronellol, Oakmoss...)
   - Indice comédogène (0 à 5).
3. Déterminer si le produit est adapté pour :
   - Femmes enceintes / allaitantes
   - Peaux atopiques, réactives ou eczématiques
   - Usage post-soin cabine (post-peeling, microneedling, etc.)
4. Fournir un verdict professionnel clair pour l'esthéticienne (A recommander, Tolérable, ou À Déconseiller/Bannir) et suggérer des alternatives clean et efficaces d'institut.

Réponds STRICTEMENT au format JSON avec cette structure :
{
  "productName": string,
  "brand": string,
  "category": string,
  "safetyScore": number (0-100),
  "riskLevel": "très sûr" | "sûr" | "modéré" | "à risque" | "dangereux / déconseillé",
  "isControversialOrDangerous": boolean (true si perturbateur endocrinien, cancérigène suspecté, huile minérale occlusive ou score < 60),
  "summary": string (résumé d'expertise en 2-3 phrases pour l'esthéticienne),
  "extractedInci": string[] (liste normalisée des ingrédients identifiés),
  "keyIngredientsWithPurpose": [
    {
      "name": string (nom INCI ou commun),
      "purpose": string (fonction exacte : ex: "Humectant & Hydratant", "Tensioactif nettoyant", "Émulsifiant", "Conservateur", "Antioxydant", "Agent de texture / Émollient", "Filtre UV"),
      "safetyRating": "sûr" | "modéré" | "à risque" | "dangereux",
      "isDangerousOrControversial": boolean,
      "hazardDetails": string (si à risque ou dangereux, raison précise),
      "scientificContext": string (contexte toxicologique ou réglementaire)
    }
  ],
  "dangerousOrControversialIngredients": [
    {
      "name": string (nom INCI exact),
      "category": "perturbateur_endocrinien" | "cancérogène_suspecté" | "irritant_sulfate" | "polluant_silicone_peg" | "allergène_parfum" | "huile_minérale_occlusive" | "autre",
      "severity": "haute" | "moyenne" | "faible",
      "dangerDescription": string (pourquoi c'est mauvais pour le client),
      "scientificContext": string (ex: 'Interdit par l'UE ou classé perturbateur endocrinien par l'ANSES')
    }
  ],
  "beneficialActives": [
    {
      "name": string,
      "benefit": string,
      "efficacyLevel": "majeur" | "secondaire"
    }
  ],
  "comedogenicRating": number (de 0 à 5),
  "isSafeForPregnancy": boolean,
  "isSafeForSensitiveSkin": boolean,
  "suitableForPostCare": boolean,
  "professionalVerdict": string (avis sans concession de la praticienne),
  "recommendedCleanAlternatives": [
    {
      "productType": string,
      "keyActiveAlternative": string,
      "professionalAdvice": string
    }
  ],
  "reviews": {
    "averageRating": number (1 à 5),
    "totalReviews": number,
    "satisfactionPercentage": number,
    "positiveHighlights": string[],
    "negativeHighlights": string[],
    "reviewsSample": [
      {
        "author": string,
        "rating": number,
        "comment": string,
        "skinTypeTested": string
      }
    ]
  }
}
`;

    const contentsParts: any[] = [];
    if (labelPhotoBase64) {
      const cleanBase64 = labelPhotoBase64.replace(/^data:image\/\w+;base64,/, '');
      contentsParts.push({
        inlineData: {
          mimeType: labelPhotoMimeType,
          data: cleanBase64,
        },
      });
    }
    contentsParts.push({ text: promptText });

    const parsed = await generateJsonWithFallback(
      contentsParts.length === 1 ? contentsParts[0].text : { parts: contentsParts },
      'gemini-flash-latest'
    );
    return res.json(parsed);
  } catch (error: any) {
    console.error('Product analysis error:', error);
    return res.status(500).json({
      error: "Erreur lors de l'analyse du produit cosmétique",
      details: error.message || 'Impossible de décoder les ingrédients.',
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!ai,
    stripeConfigured: !!stripe,
    timestamp: new Date().toISOString(),
  });
});

// ==============================================================================
// STRIPE INTEGRATION API (Abonnements Mensuels Cabine)
// ==============================================================================

// 1. Stripe Configuration status
app.get('/api/stripe/config', (req, res) => {
  res.json({
    isConfigured: !!stripe,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
    mode: stripeSecretKey.startsWith('sk_test_')
      ? 'test'
      : stripeSecretKey.startsWith('sk_live_')
      ? 'live'
      : 'unconfigured',
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    prices: {
      proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || null,
      proYearly: process.env.STRIPE_PRICE_PRO_YEARLY || null,
      prestigeMonthly: process.env.STRIPE_PRICE_PRESTIGE_MONTHLY || null,
      prestigeYearly: process.env.STRIPE_PRICE_PRESTIGE_YEARLY || null,
    },
  });
});

// 2. Create Stripe Checkout Session for Monthly or Annual Subscriptions
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const {
      planId = 'pro',
      billingCycle = 'monthly',
      clientEmail,
      clientName,
      instituteName,
      userId,
    } = req.body;

    if (!stripe) {
      return res.status(200).json({
        isConfigured: false,
        message:
          'Stripe n’est pas encore configuré. Renseignez STRIPE_SECRET_KEY dans l’onglet Secrets de la console Google AI Studio.',
        demoCheckout: true,
      });
    }

    const origin = req.headers.origin || process.env.APP_URL || `http://localhost:${port}`;
    const isPro = planId === 'pro';
    const planName = isPro ? 'Pro Esthéticienne' : 'Institut & Spa Prestige';
    const isYearly = billingCycle === 'yearly';

    // Unit amounts in cents (EUR): 29€/m (or 24€/m * 12) | 69€/m (or 59€/m * 12)
    const unitAmount = isPro
      ? (isYearly ? 2400 * 12 : 2900)
      : (isYearly ? 5900 * 12 : 6900);

    // Use environment-configured price ID if available, otherwise generate inline subscription price
    const envPriceId = isPro
      ? (isYearly ? process.env.STRIPE_PRICE_PRO_YEARLY : process.env.STRIPE_PRICE_PRO_MONTHLY)
      : (isYearly ? process.env.STRIPE_PRICE_PRESTIGE_YEARLY : process.env.STRIPE_PRICE_PRESTIGE_MONTHLY);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = envPriceId
      ? [{ price: envPriceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `DermEsthetic Pro - ${planName}`,
                description: `Abonnement mensuel logiciel cabine pour ${instituteName || 'votre institut'}. Sans engagement.`,
                metadata: {
                  planId,
                  userId: userId || 'anonymous',
                  instituteName: instituteName || '',
                },
              },
              unit_amount: unitAmount,
              recurring: {
                interval: isYearly ? 'year' : 'month',
              },
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: clientEmail || undefined,
      line_items: lineItems,
      subscription_data: {
        metadata: {
          planId,
          userId: userId || '',
          instituteName: instituteName || '',
          billingCycle,
        },
      },
      metadata: {
        planId,
        userId: userId || '',
        instituteName: instituteName || '',
        billingCycle,
      },
      success_url: `${origin}/?stripe_status=success&session_id={CHECKOUT_SESSION_ID}&plan=${planId}&cycle=${billingCycle}`,
      cancel_url: `${origin}/?stripe_status=cancelled`,
    });

    return res.json({
      isConfigured: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Stripe checkout session creation error:', error);
    return res.status(500).json({
      error: 'Erreur lors de la création de la session Stripe Checkout',
      details: error.message,
    });
  }
});

// 3. Verify Stripe Session after checkout redirect
app.get('/api/stripe/verify-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!stripe) {
      return res.json({ verified: true, isDemo: true });
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });
    return res.json({
      verified: session.payment_status === 'paid' || session.status === 'complete',
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email,
      metadata: session.metadata,
      subscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
    });
  } catch (error: any) {
    console.error('Stripe session verification error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 4. Create Stripe Customer Billing Portal Session
app.post('/api/stripe/create-portal-session', async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;
    if (!stripe || !customerId) {
      return res.status(400).json({ error: 'Portail client Stripe indisponible.' });
    }
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || req.headers.origin || process.env.APP_URL || `http://localhost:${port}`,
    });
    return res.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Stripe portal session error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 5. Stripe Webhook listener
app.post('/api/stripe/webhook', (req: any, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe) {
    return res.status(200).json({ received: true });
  }

  let event: Stripe.Event;

  if (webhookSecret && sig && req.rawBody) {
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    event = req.body;
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Stripe checkout completed for customer:', session.customer_email);
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      console.log('Stripe subscription update:', sub.id, sub.status);
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log('Stripe invoice paid:', invoice.id, invoice.amount_paid);
      break;
    }
    default:
      break;
  }

  return res.json({ received: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`DermEsthetic Pro server listening on http://localhost:${port}`);
  });
}

startServer();
