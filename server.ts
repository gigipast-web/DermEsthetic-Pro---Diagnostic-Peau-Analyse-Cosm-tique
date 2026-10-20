import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

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

app.use(
  express.static(path.resolve(__dirname, 'public'), {
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

// Proxy Open Beauty Facts to avoid CORS issues
app.get('/api/openbeautyfacts/:barcode', async (req, res) => {
  const { barcode } = req.params;
  try {
    const fetchResponse = await fetch(`https://world.openbeautyfacts.org/api/v2/product/${barcode}.json`, {
      headers: {
        'User-Agent': 'DermEstheticPro-EstheticianApp/1.0 (contact@dermestheticpro.local)',
      },
    });

    if (!fetchResponse.ok) {
      return res.status(fetchResponse.status).json({ error: 'Produit non trouvé sur Open Beauty Facts' });
    }

    const data = await fetchResponse.json();
    return res.json(data);
  } catch (error: any) {
    console.error('Error fetching Open Beauty Facts:', error);
    return res.status(500).json({ error: 'Erreur lors de la recherche du produit', details: error.message });
  }
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
    } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Service IA non initialisé. Veuillez configurer GEMINI_API_KEY dans vos variables d’environnement.',
      });
    }

    const promptText = `
Tu es un dermatologue consultant expert et maître formateur en esthétique professionnelle clinique pour les instituts de beauté et centres de soins dermo-esthétiques.
Effectue un diagnostic cutané ultra-précis, bienveillant et hautement professionnel pour une cliente en cabine d'esthétique.

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contentsParts.length === 1 ? contentsParts[0].text : { parts: contentsParts },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawJson = response.text || '{}';
    const parsed = JSON.parse(rawJson);
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
    } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Service IA non initialisé. Veuillez configurer GEMINI_API_KEY dans vos variables d’environnement.',
      });
    }

    const promptText = `
Tu es un toxicologue cosmétologue et expert en formulation de soins esthétiques (réglementation européenne CE 1223/2009, CosIng, normes Clean Beauty, INCI Beauty & Yuka).
Analyse rigoureusement ce produit cosmétique pour les esthéticiennes professionnelles.

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contentsParts.length === 1 ? contentsParts[0].text : { parts: contentsParts },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawJson = response.text || '{}';
    const parsed = JSON.parse(rawJson);
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
    timestamp: new Date().toISOString(),
  });
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
