import { ProductAnalysisResult, DangerousIngredient, ClientProfile } from '../types';

export const INCI_HAZARD_DICTIONARY: Record<string, {
  name: string;
  category: 'perturbateur_endocrinien' | 'cancérogène_suspecté' | 'irritant_sulfate' | 'polluant_silicone_peg' | 'allergène_parfum' | 'huile_minérale_occlusive' | 'comédogène' | 'autre';
  severity: 'haute' | 'moyenne' | 'faible';
  dangerDescription: string;
  scientificContext: string;
  comedogenicScore?: number;
}> = {
  'bht': {
    name: 'BHT (Butylated Hydroxytoluene)',
    category: 'perturbateur_endocrinien',
    severity: 'haute',
    dangerDescription: 'Antioxydant synthétique suspecté d’interférer avec la fonction thyroïdienne et le système reproducteur.',
    scientificContext: 'Évalué comme perturbateur endocrinien prioritaire par l’ANSES et le comité scientifique européen SCCS.',
    comedogenicScore: 0,
  },
  'bha': {
    name: 'BHA (Butylated Hydroxyanisole)',
    category: 'cancérogène_suspecté',
    severity: 'haute',
    dangerDescription: 'Conservateur antioxydant classé cancérogène possible par le CIRC (Groupe 2B) et perturbateur endocrinien.',
    scientificContext: 'Interdit dans les cosmétiques dans plusieurs juridictions strictes en raison de risques de génotoxicité.',
    comedogenicScore: 0,
  },
  'benzophenone-3': {
    name: 'Benzophenone-3 (Oxybenzone)',
    category: 'perturbateur_endocrinien',
    severity: 'haute',
    dangerDescription: 'Filtre UV chimique fortement allergisant, bioaccumulable et destructeur avéré des coraux marins.',
    scientificContext: 'Pénètre la barrière cutanée humaine et se retrouve dans le sang et le lait maternel.',
  },
  'ethylhexyl methoxycinnamate': {
    name: 'Ethylhexyl Methoxycinnamate (Octinoxate)',
    category: 'perturbateur_endocrinien',
    severity: 'haute',
    dangerDescription: 'Filtre solaire altérant l’axe hormonal œstrogénique et thyroïdien.',
    scientificContext: 'Classé parmi les substances sous surveillance prioritaire de l’Union Européenne.',
  },
  'propylparaben': {
    name: 'Propylparaben',
    category: 'perturbateur_endocrinien',
    severity: 'haute',
    dangerDescription: 'Conservateur de la famille des parabènes suspecté d’effets œstrogéniques et de toxicité pour la reproduction.',
    scientificContext: 'Fortement restreint par le règlement Cosmétique CE 1223/2009 sur la zone du siège des nourrissons.',
  },
  'butylparaben': {
    name: 'Butylparaben',
    category: 'perturbateur_endocrinien',
    severity: 'haute',
    dangerDescription: 'Parabène à longue chaîne hautement suspecté d’altérer la fertilité et le développement hormonal.',
    scientificContext: 'Inscrit sur la liste des substances extrêmement préoccupantes (SVHC) de l’ECHA.',
  },
  'sodium lauryl sulfate': {
    name: 'Sodium Lauryl Sulfate (SLS)',
    category: 'irritant_sulfate',
    severity: 'moyenne',
    dangerDescription: 'Tensioactif anionique très agressif qui décape la barrière lipidique cutanée et fragilise le microbiome.',
    scientificContext: 'Utilisé comme irritant de référence en dermatologie pour tester l’efficacité des crèmes réparatrices.',
    comedogenicScore: 0,
  },
  'sodium laureth sulfate': {
    name: 'Sodium Laureth Sulfate (SLES)',
    category: 'irritant_sulfate',
    severity: 'moyenne',
    dangerDescription: 'Moins irritant que le SLS pur mais issu d’éthoxylation pouvant contenir des traces résiduelles de 1,4-dioxane.',
    scientificContext: 'Le 1,4-dioxane est un cancérogène suspecté classé 2B par le CIRC.',
  },
  'paraffinum liquidum': {
    name: 'Paraffinum Liquidum (Huile minérale)',
    category: 'huile_minérale_occlusive',
    severity: 'haute',
    dangerDescription: 'Hydrocarbure pétrochimique inerte créant un film occlusif imperméable empêchant la respiration cutanée.',
    scientificContext: 'N’apporte aucun nutriment actif à la peau, potentiel comédogène élevé sur peaux acnéiques.',
    comedogenicScore: 4,
  },
  'petrolatum': {
    name: 'Petrolatum (Vaseline)',
    category: 'huile_minérale_occlusive',
    severity: 'moyenne',
    dangerDescription: 'Dérivé pétrochimique occlusif. Doit être hautement purifié selon les normes européennes pour exclure les HAP.',
    scientificContext: 'Barrière physique pure sans biocompatibilité avec les lipides de l’épiderme.',
    comedogenicScore: 3,
  },
  'dmdm hydantoin': {
    name: 'DMDM Hydantoin',
    category: 'cancérogène_suspecté',
    severity: 'haute',
    dangerDescription: 'Conservateur libérateur lent de formaldéhyde, substance hautement allergisante et cancérogène avérée.',
    scientificContext: 'Interdit dans de nombreuses formulations modernes en raison de l’exposition chronique au formol.',
  },
  'cyclopentasiloxane': {
    name: 'Cyclopentasiloxane (D5)',
    category: 'polluant_silicone_peg',
    severity: 'moyenne',
    dangerDescription: 'Silicone volatil synthétique polluant très persistant dans l’environnement et occlusif pour les pores.',
    scientificContext: 'Restreint dans l’UE dans les cosmétiques à rincer en raison de sa toxicité aquatique (ECHA).',
    comedogenicScore: 1,
  },
  'dimethicone': {
    name: 'Dimethicone (Silicone)',
    category: 'polluant_silicone_peg',
    severity: 'faible',
    dangerDescription: 'Silicone synthétique apportant un toucher soyeux artificiel mais créant un bouclier imperméable et non biodégradable.',
    scientificContext: 'Peut asphyxier les peaux à tendance comédonienne lors d’utilisations répétées sans double nettoyage.',
    comedogenicScore: 1,
  },
  'peg-40 hydrogenated castor oil': {
    name: 'PEG-40 Hydrogenated Castor Oil',
    category: 'polluant_silicone_peg',
    severity: 'faible',
    dangerDescription: 'Émulsifiant éthoxylé pouvant fragiliser la perméabilité cutanée et augmenter la pénétration des polluants.',
    scientificContext: 'Procédé de synthèse polluant utilisant de l’oxyde d’éthylène toxique.',
  },
  'limonene': {
    name: 'Limonene',
    category: 'allergène_parfum',
    severity: 'faible',
    dangerDescription: 'Composé aromatique naturel ou synthétique à forte odeur d’agrumes, s’oxydant au contact de l’air en puissant allergène.',
    scientificContext: 'Fait partie des 26 allergènes à mention obligatoire selon la réglementation cosmétique européenne.',
  },
  'linalool': {
    name: 'Linalool',
    category: 'allergène_parfum',
    severity: 'faible',
    dangerDescription: 'Allergène de parfum courant provoquant de l’eczéma de contact chez les peaux sensibles ou sensibilisées.',
    scientificContext: 'Devient très réactif et sensibilisant lorsqu’il s’oxyde à l’air libre.',
  },
  'isopropyl myristate': {
    name: 'Isopropyl Myristate',
    category: 'comédogène',
    severity: 'moyenne',
    dangerDescription: 'Émollient synthétique au très fort potentiel comédogène (5/5). Favorise l’apparition rapide de microkystes et comédons.',
    scientificContext: 'À proscrire formellement sur peaux mixtes, grasses et sujettes à l’acné vulgaire.',
    comedogenicScore: 5,
  },
};

export const VERIFIED_PRODUCTS_CATALOG: ProductAnalysisResult[] = [
  {
    barcode: '3401345934573',
    productName: 'Créaline H2O Eau Micellaire Démaquillante',
    brand: 'Bioderma',
    category: 'Démaquillant Visage & Yeux',
    retailPrice: '14,90 € (500ml)',
    safetyScore: 88,
    riskLevel: 'sûr',
    isControversialOrDangerous: false,
    summary: 'Formule culte haute tolérance respectant le film hydrolipidique grâce à des esters de glycérol biomimétiques. Sans parfum ni paraben, respecte le pH physiologique cutané.',
    extractedInci: ['AQUA/WATER/EAU', 'PEG-6 CAPRYLIC/CAPRIC GLYCERIDES', 'FRUCTOOLIGOSACCHARIDES', 'MANNITOL', 'XYLITOL', 'RHAMNOSE', 'CUCUMIS SATIVUS (CUCUMBER) FRUIT EXTRACT', 'PROPYLENE GLYCOL', 'CETRIMONIUM BROMIDE', 'DISODIUM EDTA'],
    dangerousOrControversialIngredients: [
      {
        name: 'Cetrimonium Bromide',
        category: 'autre',
        severity: 'faible',
        dangerDescription: 'Conservateur ammonium quaternaire potentiellement irritant à concentration élevée.',
      },
      {
        name: 'Disodium EDTA',
        category: 'autre',
        severity: 'faible',
        dangerDescription: 'Agent chélateur synthétique peu biodégradable qui augmente la perméabilité cutanée.',
      },
    ],
    beneficialActives: [
      { name: 'Extrait de Concombre (Cucumis Sativus)', benefit: 'Apaisant immédiat, réduit les rougeurs et l’échauffement cutané.', efficacyLevel: 'majeur' },
      { name: 'Complexe D.A.F (Mannitol, Xylitol, Rhamnose)', benefit: 'Renforce le seuil de tolérance de l’épiderme réactif.', efficacyLevel: 'majeur' },
    ],
    comedogenicRating: 0,
    isSafeForPregnancy: true,
    isSafeForSensitiveSkin: true,
    suitableForPostCare: true,
    professionalVerdict: 'Produit de référence en pré-soin cabine pour un démaquillage doux. Recommandez à la cliente de toujours rincer délicatement à l’eau thermale pour ne pas laisser de tensioactifs résiduels.',
    recommendedCleanAlternatives: [
      { productType: 'Huile démaquillante émulsionnable', keyActiveAlternative: 'Huile de Camélia et Squalane végétal', professionalAdvice: 'Idéal pour dissoudre les filtres solaires sans frottement mécanique avec coton.' }
    ],
    reviews: {
      averageRating: 4.8,
      totalReviews: 2450,
      satisfactionPercentage: 96,
      positiveHighlights: ['Ne pique pas les yeux', 'Ne tiraille pas', 'Démaquille même le waterproof sans frotter'],
      negativeHighlights: ['Contient du PEG-6', 'Nécessite quand même un rinçage pour les peaux atopiques'],
      reviewsSample: [
        { author: 'Marie-Laure P.', rating: 5, comment: 'Indispensable pour ma peau réactive avec rougeurs, je l’utilise avant mes séances en institut.', skinTypeTested: 'Peau sensible couperosique', date: '2026-09-12' },
        { author: 'Chloé T.', rating: 4, comment: 'Très douce mais je préfère vaporiser de l’eau florale après pour parfaire le nettoyage.', skinTypeTested: 'Peau mixte', date: '2026-08-30' }
      ]
    },
    analyzedAt: '2026-10-10',
    source: 'local_verified',
  },
  {
    barcode: '4005808111220',
    productName: 'Crème Hydratante Universelle Boîte Bleue',
    brand: 'Nivea',
    category: 'Crème multi-usages visage & corps',
    retailPrice: '4,50 € (150ml)',
    safetyScore: 36,
    riskLevel: 'dangereux / déconseillé',
    isControversialOrDangerous: true,
    summary: 'ALERTE TOXICOLOGIE : Formule très grasse dominée par des huiles minérales pétrochimiques étouffantes (Paraffinum Liquidum, Paraffin) et un cocktail de plus de 7 allergènes de parfums réputés.',
    extractedInci: ['AQUA', 'PARAFFINUM LIQUIDUM', 'CERA MICROCRISTALLINA', 'GLYCERIN', 'LANOLIN ALCOHOL (EUCERIT)', 'PARAFFIN', 'PANTHENOL', 'MAGNESIUM SULFATE', 'DECYL OLEATE', 'OCTYLDODECANOL', 'ALUMINUM STEARATES', 'CITRIC ACID', 'MAGNESIUM STEARATE', 'LIMONENE', 'GERANIOL', 'HYDROXYCITRONELLAL', 'LINALOOL', 'CITRONELLOL', 'BENZYL BENZOATE', 'CINNAMYL ALCOHOL', 'PARFUM'],
    dangerousOrControversialIngredients: [
      {
        name: 'Paraffinum Liquidum & Paraffin',
        category: 'huile_minérale_occlusive',
        severity: 'haute',
        dangerDescription: 'Dérivés pétrochimiques formant une pellicule plastique occlusive étouffant les pores. Induit des microkystes sébacés sévères sur le visage.',
        scientificContext: 'Non biodégradable et sans affinité biologique avec les phospholipides épidermiques.',
        comedogenicScore: 4,
      },
      {
        name: 'Cocktail 7+ Allergènes (Limonene, Geraniol, Hydroxycitronellal, Linalool, Cinnamyl Alcohol)',
        category: 'allergène_parfum',
        severity: 'haute',
        dangerDescription: 'Forte concentration d’allergènes classés prioritaires par l’UE provoquant de l’eczéma et dermites de contact.',
      },
      {
        name: 'Cera Microcristallina',
        category: 'huile_minérale_occlusive',
        severity: 'moyenne',
        dangerDescription: 'Cire minérale hydrocarbure aliphatique issue du raffinage pétrolier.',
      }
    ],
    beneficialActives: [
      { name: 'Panthenol (Provitamine B5)', benefit: 'Hydratant secondaire.', efficacyLevel: 'secondaire' },
      { name: 'Glycérine', benefit: 'Humectant classique.', efficacyLevel: 'secondaire' }
    ],
    comedogenicRating: 4,
    isSafeForPregnancy: true,
    isSafeForSensitiveSkin: false,
    suitableForPostCare: false,
    professionalVerdict: 'DÉCONSEILLER FERMEMENT SUR LE VISAGE DE LA CLIENTE. Cette formule obstrue totalement l’ostium folliculaire et provoque des poussées d’acné rétentionnelle. Peut être tolérée uniquement sur les talons très fendillés.',
    recommendedCleanAlternatives: [
      { productType: 'Baume Cérat Végétal Cabine', keyActiveAlternative: 'Beurre de Karité brut bio, Céramides végétales et Squalane d’olive', professionalAdvice: 'Véritable nutrition biomimétique sans hydrocarbures fossiles.' }
    ],
    reviews: {
      averageRating: 2.9,
      totalReviews: 890,
      satisfactionPercentage: 48,
      positiveHighlights: ['Prix très accessible', 'Soulage les talons rugueux'],
      negativeHighlights: ['Texture poisseuse très lourde', 'Boutons et points noirs garantis sur le visage', 'Parfum très fort irritant'],
      reviewsSample: [
        { author: 'Pauline D.', rating: 1, comment: 'Mon esthéticienne m’a alertée : après un mois d’application sur le visage j’avais des microkystes partout ! À bannir.', skinTypeTested: 'Peau mixte', date: '2026-09-01' },
        { author: 'Sylvie M.', rating: 3, comment: 'Correct pour les coudes très secs en hiver mais impossible sur le visage.', skinTypeTested: 'Peau sèche', date: '2026-07-15' }
      ]
    },
    analyzedAt: '2026-10-10',
    source: 'local_verified',
  },
  {
    barcode: '3337875597203',
    productName: 'Baume Corps Relipidant Lipikar Baume AP+M',
    brand: 'La Roche-Posay',
    category: 'Baume Corps Anti-Démangeaisons',
    retailPrice: '19,50 € (400ml)',
    safetyScore: 90,
    riskLevel: 'très sûr',
    isControversialOrDangerous: false,
    summary: 'Formule corps dermo-cosmétique d’excellence pour le corps. Répare le microbiome avec l’Aqua Posae Filiformis et apporte 20% de beurre de karité pour apaiser les peaux très sèches et atopiques.',
    extractedInci: ['AQUA/WATER', 'BUTYROSPERMUM PARKII BUTTER/SHEA BUTTER', 'GLYCERIN', 'DIMETHICONE', 'NIACINAMIDE', 'CETEARYL ALCOHOL', 'BRASSICA CAMPESTRIS SEED OIL', 'GLYCERYL STEARATE', 'AMMONIUM POLYACRYLOYLDIMETHYL TAURATE', 'PEG-100 STEARATE', 'PROPANEDIOL', 'OPHIOPOGON JAPONICUS ROOT EXTRACT', 'PEG-20 METHYL GLUCOSE SESQUISTEARATE', 'SORBITAN TRISTEARATE', 'DIMETHICONOL', 'SODIUM CHLORIDE', 'MANNOSE', 'COCO-BETAINE', 'DISODIUM EDTA', 'CAPRYLOYL GLYCINE', 'CAPRYLYL GLYCOL', 'VITREOSCILLA FERMENT', 'CITRIC ACID', 'MALTODEXTRIN', 'XANTHAN GUM', 'TOCOPHEROL'],
    dangerousOrControversialIngredients: [
      {
        name: 'Dimethicone',
        category: 'polluant_silicone_peg',
        severity: 'faible',
        dangerDescription: 'Silicone présent en faible dose pour améliorer la glisse sur le corps.',
      },
    ],
    beneficialActives: [
      { name: 'Beurre de Karité brut (20%)', benefit: 'Restauration lipidique profonde des jambes et du buste.', efficacyLevel: 'majeur' },
      { name: 'Niacinamide (4%)', benefit: 'Apaise les démangeaisons intenses et renforce la synthèse de céramides.', efficacyLevel: 'majeur' },
      { name: 'Aqua Posae Filiformis', benefit: 'Rééquilibre la flore microbienne épidermique.', efficacyLevel: 'majeur' },
    ],
    comedogenicRating: 2,
    isSafeForPregnancy: true,
    isSafeForSensitiveSkin: true,
    suitableForPostCare: true,
    professionalVerdict: 'Soin corps de référence en institut après des gommages corporels mécaniques ou pour les clientes souffrant de xérose cutanée sévère.',
    recommendedCleanAlternatives: [
      { productType: 'Baume Corps Végétal Précieux', keyActiveAlternative: 'Huile d’Avocat et Beurre de Mangue bio', professionalAdvice: 'Alternative sans silicones pour un soin corps 100% naturel.' }
    ],
    reviews: {
      averageRating: 4.9,
      totalReviews: 3120,
      satisfactionPercentage: 97,
      positiveHighlights: ['Stoppe net les démangeaisons corporelles', 'Fini non collant permettant de s’habiller vite', 'Tolérance parfaite'],
      negativeHighlights: ['Flacon pompe difficile à vider jusqu’au fond'],
      reviewsSample: [
        { author: 'Nathalie G.', rating: 5, comment: 'Recommandé par mon esthéticienne après mon gommage corps aux sels, mes jambes de croco ont disparu en 3 jours !', skinTypeTested: 'Peau corporelle atopique', date: '2026-10-01' }
      ]
    },
    analyzedAt: '2026-10-10',
    source: 'local_verified',
  },
  {
    barcode: '3525722028889',
    productName: 'Huile Minceur & Anti-Capitons Drainante',
    brand: 'Institut Caudalie / Body Slim Pro',
    category: 'Huile de soin corps & fermeté',
    retailPrice: '28,00 € (100ml)',
    safetyScore: 92,
    riskLevel: 'très sûr',
    isControversialOrDangerous: false,
    summary: 'Huile sèche 100% végétale enrichie en huiles essentielles lipolytiques de baies de genièvre, romarin et cyprès. Draine l’eau et affine la silhouette sans huiles minérales.',
    extractedInci: ['VITIS VINIFERA (GRAPE) SEED OIL', 'SESAMUM INDICUM (SESAME) SEED OIL', 'CAPRYLIC/CAPRIC TRIGLYCERIDE', 'ROSMARINUS OFFICINALIS (ROSEMARY) LEAF OIL', 'CUPRESSUS SEMPERVIRENS LEAF/NUT/STEM OIL', 'JUNIPERUS COMMUNIS FRUIT OIL', 'CYMBOPOGON FLEXUOSUS OIL', 'HELIANTHUS ANNUUS (SUNFLOWER) SEED OIL', 'TOCOPHEROL', 'LIMONENE', 'CITRAL', 'GERANIOL', 'LINALOOL'],
    dangerousOrControversialIngredients: [
      {
        name: 'Huiles essentielles lipolytiques (Limonene, Citral, Geraniol)',
        category: 'allergène_parfum',
        severity: 'faible',
        dangerDescription: 'Composés aromatiques naturels des huiles essentielles. Contre-indiqués chez la femme enceinte.',
      }
    ],
    beneficialActives: [
      { name: 'Huile de Pépins de Raisin & Sésame', benefit: 'Riche en acides gras oméga-6 régénérants, glisse parfaite en modelage.', efficacyLevel: 'majeur' },
      { name: 'Huile essentielle de Genièvre & Cyprès', benefit: 'Actif veinotonique et drainant lymphatique majeur contre les jambes lourdes.', efficacyLevel: 'majeur' },
      { name: 'Romarin & Lemongrass', benefit: 'Tonifie les fibres d’élastine et raffermit les capitons.', efficacyLevel: 'majeur' }
    ],
    comedogenicRating: 1,
    isSafeForPregnancy: false, // Contient des huiles essentielles !
    isSafeForSensitiveSkin: true,
    suitableForPostCare: true,
    professionalVerdict: 'Idéal en cabine pour les manœuvres de palper-rouler manuel, madérothérapie et drainage lymphatique brésilien. ATTENTION : Proscrire chez les femmes enceintes et allaitantes en raison des huiles essentielles.',
    recommendedCleanAlternatives: [
      { productType: 'Huile Neutre Corps Grossesse', keyActiveAlternative: 'Macérat de Bellis et Huile d’Amande Douce vierge', professionalAdvice: 'Sécurité absolue pour vergetures de grossesse sans huiles essentielles.' }
    ],
    reviews: {
      averageRating: 4.7,
      totalReviews: 640,
      satisfactionPercentage: 92,
      positiveHighlights: ['Odeur spa fabuleuse', 'Efficacité visible sur la rétention d’eau des cuisses', 'Pénètre sans tacher les vêtements'],
      negativeHighlights: ['Interdite pendant la grossesse'],
      reviewsSample: [
        { author: 'Audrey F.', rating: 5, comment: 'Mon esthéticienne me l’applique en cure minceur, combinée aux massages les résultats sur ma cellulite sont bluffants.', skinTypeTested: 'Cellulite aqueuse cuisses', date: '2026-09-18' }
      ]
    },
    analyzedAt: '2026-10-10',
    source: 'local_verified',
  },
  {
    barcode: '769915190601',
    productName: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    category: 'Sérum visage clarifiant & séborégulateur',
    retailPrice: '6,60 € (30ml)',
    safetyScore: 94,
    riskLevel: 'très sûr',
    isControversialOrDangerous: false,
    summary: 'Formule minimaliste ultra-clean sans huiles, sans silicones, sans parfum ni alcool. Haute concentration d’actifs reconnus pour resserrer les pores et réguler le sébum.',
    extractedInci: ['AQUA (WATER)', 'NIACINAMIDE', 'PENTYLENE GLYCOL', 'ZINC PCA', 'DIMETHYL ISOSORBIDE', 'TAMARINDUS INDICA SEED GUM', 'XANTHAN GUM', 'ISOCETETH-20', 'ETHOXYDIGLYCOL', 'PHENOXYETHANOL', 'CHLORPHENESIN'],
    dangerousOrControversialIngredients: [
      {
        name: 'Phenoxyethanol',
        category: 'autre',
        severity: 'faible',
        dangerDescription: 'Conservateur synthétique restreint à 1% max dans l’Union Européenne.',
      },
    ],
    beneficialActives: [
      { name: 'Niacinamide pure (10%)', benefit: 'Affine le grain de peau, renforce la barrière céramidique, atténue les rougeurs.', efficacyLevel: 'majeur' },
      { name: 'Zinc PCA (1%)', benefit: 'Contrôle la production de sébum sans dessécher et accélère la cicatrisation cutanée.', efficacyLevel: 'majeur' },
    ],
    comedogenicRating: 0,
    isSafeForPregnancy: true,
    isSafeForSensitiveSkin: true,
    suitableForPostCare: true,
    professionalVerdict: 'Sérum universel économique et très propre pour toutes les peaux mixtes à grasses et ternes. Attention à ne pas le superposer dans la même minute avec de l’acide ascorbique pur.',
    recommendedCleanAlternatives: [
      { productType: 'Sérum Pro Haute Tolérance', keyActiveAlternative: 'Niacinamide 5% + Acide Hyaluronique végétal', professionalAdvice: 'Concentration 5% souvent plus douce pour peaux très réactives.' }
    ],
    reviews: {
      averageRating: 4.6,
      totalReviews: 5800,
      satisfactionPercentage: 91,
      positiveHighlights: ['Resserre visiblement les pores en 2 semaines', 'Fini matifiant sans brillance', 'Rapport qualité/prix imbattable'],
      negativeHighlights: ['Peut mousser légèrement si appliqué en trop grande quantité'],
      reviewsSample: [
        { author: 'Lucie B.', rating: 5, comment: 'Validé par mon esthéticienne, ma zone T ne brille plus du tout en fin de journée.', skinTypeTested: 'Peau grasse comédonienne', date: '2026-09-22' }
      ]
    },
    analyzedAt: '2026-10-10',
    source: 'local_verified',
  },
  {
    barcode: '3337875597180',
    productName: 'Effaclar Duo+ M Soin Anti-Imperfections',
    brand: 'La Roche-Posay',
    category: 'Soin correcteur anti-boutons et marques',
    retailPrice: '16,20 € (40ml)',
    safetyScore: 78,
    riskLevel: 'sûr',
    isControversialOrDangerous: false,
    summary: 'Soin ciblé pour peaux à tendance acnéique associant Phylobioma rééquilibrant le microbiome, Procerad anti-marques et Niacinamide. Contient de la diméthicone pour l’effet velouté.',
    extractedInci: ['AQUA', 'GLYCERIN', 'DIMETHICONE', 'ISOCETYL STEARATE', 'NIACINAMIDE', 'ISOPROPYL LAUROYL SARCOSINATE', 'SILICA', 'AMMONIUM POLYACRYLOYLDIMETHYL TAURATE', 'METHYL METHACRYLATE CROSSPOLYMER', 'POTASSIUM CETYL PHOSPHATE', 'SORBITAN OLEATE', 'ZINC PCA', 'GLYCERYL STEARATE SE', 'ISOHEXADECANE', 'SODIUM HYDROXIDE', 'SALICYLIC ACID', 'PIROCTONE OLAMINE', 'PARFUM/FRAGRANCE'],
    dangerousOrControversialIngredients: [
      {
        name: 'Dimethicone & Isohexadecane',
        category: 'polluant_silicone_peg',
        severity: 'faible',
        dangerDescription: 'Silicones synthétiques apportant un toucher soyeux matifiant.',
      },
      {
        name: 'Parfum synthétique',
        category: 'allergène_parfum',
        severity: 'faible',
        dangerDescription: 'Sensibilisation possible sur barrière cutanée enflammée par des poussées d’acné sévères.',
      },
    ],
    beneficialActives: [
      { name: 'Niacinamide (4%)', benefit: 'Calme l’inflammation des papules et estompe les taches brunes post-boutons.', efficacyLevel: 'majeur' },
      { name: 'Zinc PCA', benefit: 'Action antibactérienne et séborégulatrice.', efficacyLevel: 'majeur' },
      { name: 'Acide Salicylique', benefit: 'Dégage les comédons et microkystes.', efficacyLevel: 'majeur' },
    ],
    comedogenicRating: 1,
    isSafeForPregnancy: true,
    isSafeForSensitiveSkin: false,
    suitableForPostCare: false,
    professionalVerdict: 'Soin efficace en cure locale sur les boutons inflammatoires. Déconseillé en post-peeling immédiat car la barrière cutanée a besoin d’agents régénérants lipidiques.',
    recommendedCleanAlternatives: [
      { productType: 'Fluide Purifiant Cabine', keyActiveAlternative: 'Acide Azélaïque 10% + Extrait de Thé Vert', professionalAdvice: 'Alternative sans silicones respectant le film épidermique.' }
    ],
    reviews: {
      averageRating: 4.4,
      totalReviews: 1890,
      satisfactionPercentage: 88,
      positiveHighlights: ['Assèche les boutons sans laisser de taches', 'Texture non grasse'],
      negativeHighlights: ['Léger picotement sur peau très sensibilisée'],
      reviewsSample: [
        { author: 'Manon V.', rating: 4, comment: 'Très bien pour mes boutons hormonaux sur le menton, conseillé par ma praticienne.', skinTypeTested: 'Peau acnéique adulte', date: '2026-08-14' }
      ]
    },
    analyzedAt: '2026-10-10',
    source: 'local_verified',
  },
  {
    barcode: '3045200702119',
    productName: 'Lait Corporel Hydratant Éclaircissant Anti-Taches Douteux',
    brand: 'Laboratoire Blanchissant / Export',
    category: 'Lait corporel dépigmentant controversé',
    retailPrice: '12,00 € (250ml)',
    safetyScore: 18,
    riskLevel: 'dangereux / déconseillé',
    isControversialOrDangerous: true,
    summary: 'DANGER TOXICOLOGIQUE MAJEUR : Contient du BHT et du BHA à forte dose, des dérivés d’hydroquinone suspectés et du Propylparaben. Risque de dépigmentation irréversible et perturbation endocrinienne sévère.',
    extractedInci: ['AQUA', 'PARAFFINUM LIQUIDUM', 'HYDROQUINONE TRACES', 'BHT', 'BHA', 'PROPYLPARABEN', 'METHYLPARABEN', 'SODIUM LAURYL SULFATE', 'BENZOPHENONE-3', 'PARFUM', 'ALPHA-ISOMETHYL IONONE'],
    dangerousOrControversialIngredients: [
      {
        name: 'BHT & BHA',
        category: 'perturbateur_endocrinien',
        severity: 'haute',
        dangerDescription: 'Perturbateurs endocriniens toxiques pour le système reproducteur et la thyroïde. BHA classé cancérogène possible 2B.',
      },
      {
        name: 'Propylparaben',
        category: 'perturbateur_endocrinien',
        severity: 'haute',
        dangerDescription: 'Parabène à longue chaîne hautement reprotoxique.',
      },
      {
        name: 'Benzophenone-3 (Oxybenzone)',
        category: 'perturbateur_endocrinien',
        severity: 'haute',
        dangerDescription: 'Filtre chimique perturbateur hormonal puissant.',
      },
      {
        name: 'Sodium Lauryl Sulfate (SLS)',
        category: 'irritant_sulfate',
        severity: 'moyenne',
        dangerDescription: 'Tensioactif décapant altérant la perméabilité cutanée.',
      }
    ],
    beneficialActives: [],
    comedogenicRating: 4,
    isSafeForPregnancy: false,
    isSafeForSensitiveSkin: false,
    suitableForPostCare: false,
    professionalVerdict: 'ALERTE ESTHÉTICIENNE : EXCLURE IMMÉDIATEMENT CE PRODUIT. Produit dangereux non conforme aux normes européennes de sécurité. Risque de brûlure chimique et d’hyperpigmentation réactionnelle.',
    recommendedCleanAlternatives: [
      { productType: 'Lait Corps Unifiant Pro', keyActiveAlternative: 'Vitamine C stabilisée + Niacinamide 4% + Extrait de Réglisse', professionalAdvice: 'Éclaircissement naturel et sain des taches sans aucun toxique.' }
    ],
    reviews: {
      averageRating: 1.8,
      totalReviews: 120,
      satisfactionPercentage: 15,
      positiveHighlights: ['Aucun'],
      negativeHighlights: ['Brûlures cutanées', 'Aggravation des taches', 'Odeur chimique piquante'],
      reviewsSample: [
        { author: 'Anonyme', rating: 1, comment: 'Acheté sur internet, m’a brûlé la peau des jambes et mon esthéticienne m’a ordonné de le jeter immédiatement !', skinTypeTested: 'Peau mate', date: '2026-05-10' }
      ]
    },
    analyzedAt: '2026-10-10',
    source: 'local_verified',
  }
];

export const SAMPLE_CLIENTS: ClientProfile[] = [
  {
    id: 'cli-01',
    fullName: 'Élodie Laurent',
    age: 34,
    birthDate: '1992-04-18',
    phone: '06 12 34 56 78',
    email: 'elodie.laurent@email.fr',
    address: '14 Rue de la Paix, 75002 Paris',
    skinType: 'Mixte déshydratée avec réactivité vasomotrice',
    fitzpatrickScale: 'Phototype II (Peau claire sensible au soleil)',
    knownAllergies: ['Parfums de synthèse lourds', 'Huiles minérales pétrochimiques'],
    medicalHistory: ['Sensibilité au froid (phénomène de Raynaud léger)', 'Pas d’antécédent lourd'],
    isPregnant: false,
    sensitivities: 'Rougeurs diffuses sur les pommettes en hiver, tiraillements après la douche',
    contraindications: ['Éviter les gommages mécaniques à gros grains abrasifs', 'Éviter les acides AHA très concentrés (>15%)'],
    createdAt: '2026-09-15',
    diagnosticsCount: 2,
    lastVisit: '2026-10-02',
    nextAppointment: '2026-10-24 à 14h30',
    treatmentSessions: [
      {
        id: 'sess-01',
        date: '2026-10-02',
        careType: 'visage',
        title: 'Soin Cabine Réparateur Barrière Cutanée & Quartz Rose',
        protocolSummary: 'Double nettoyage prébiotique, peeling enzymatique papaïne sous vapeur tiède, modelage drainant quartz rose au squalane, masque biocellulose céramides + LED jaune 15 min.',
        durationMinutes: 60,
        productsUsedCabin: ['Huile démaquillante Camélia', 'Peeling Enzymatique Doux', 'Sérum Céramides & Niacinamide', 'Crème Barrière SPF50'],
        technologiesUsed: ['Luminothérapie LED Jaune 590nm', 'Vapeur tiède ozone'],
        skinReaction: 'Tolérance parfaite. Rougeurs disparues dès la fin de la séance LED. Éclat immédiat.',
        notes: 'Cliente très détendue. A adoré les manœuvres aux champignons de quartz rose.',
        price: 85,
      },
      {
        id: 'sess-02',
        date: '2026-09-15',
        careType: 'visage',
        title: 'Diagnostic Inicial & Soin Détox Éclat',
        protocolSummary: 'Nettoyage doux, désincrustation ultrasonique de la zone T, masque apaisant au bleuet.',
        durationMinutes: 45,
        productsUsedCabin: ['Lait dermo-nettoyant', 'Lotion florale bleuet', 'Masque apaisant'],
        technologiesUsed: ['Spatule à ultrasons'],
        skinReaction: 'Légères rougeurs temporaires sur les ailes du nez, apaisées en 20 min.',
        price: 65,
      }
    ],
    purchasedProducts: [
      {
        id: 'purch-01',
        date: '2026-10-02',
        productName: 'Créaline H2O Eau Micellaire',
        brand: 'Bioderma',
        category: 'Démaquillant Visage',
        barcode: '3401345934573',
        safetyScore: 88,
        price: 14.90,
        repurchaseStatus: 'actif',
        clientFeedback: 'Très satisfaite, ne pique pas ses yeux sensibles.',
        rating: 5,
      },
      {
        id: 'purch-02',
        date: '2026-10-02',
        productName: 'Sérum Niacinamide 10% + Zinc',
        brand: 'The Ordinary',
        category: 'Sérum Visage',
        barcode: '769915190601',
        safetyScore: 94,
        price: 6.60,
        repurchaseStatus: 'actif',
        clientFeedback: 'Utilisé chaque matin sur la zone T, pores plus resserrés.',
        rating: 5,
      }
    ],
    privateNotes: [
      {
        id: 'note-01',
        date: '2026-10-02',
        author: 'Émilie (Esthéticienne)',
        category: 'observation_cutanee',
        content: 'La cliente utilisait la crème Nivea boîte bleue qui bouchait ses pores. Nous lui avons formellement déconseillé cette formule pétrochimique et remplacée par notre fluide céramidique. Résultat spectaculaire sur les comédons en seulement 2 semaines.',
        isImportant: true,
      },
      {
        id: 'note-02',
        date: '2026-09-15',
        author: 'Émilie (Esthéticienne)',
        category: 'preference_cliente',
        content: 'Préfère les serviettes très tièdes (pas brûlantes) et les parfums naturels très légers type eau florale de bleuet.',
        isImportant: false,
      }
    ]
  },
  {
    id: 'cli-02',
    fullName: 'Camille Moreau',
    age: 48,
    birthDate: '1978-11-05',
    phone: '06 98 76 54 32',
    email: 'camille.moreau@email.fr',
    address: '8 Boulevard Haussmann, 75009 Paris',
    skinType: 'Mature alipidique, perte de fermeté ovale et cellulite cuisses',
    fitzpatrickScale: 'Phototype III (Peau intermédiaire)',
    knownAllergies: ['Rétinol pur médical non tamponné (desquamation sévère)'],
    medicalHistory: ['Ménopause récente, sécheresse cutanée globale'],
    isPregnant: false,
    sensitivities: 'Taches pigmentaires solaires sur le décolleté et rides péribuccales marquées',
    contraindications: ['Ne pas appliquer de rétinol avant exposition au soleil'],
    createdAt: '2026-08-20',
    diagnosticsCount: 3,
    lastVisit: '2026-09-28',
    nextAppointment: '2026-10-18 à 11h00',
    treatmentSessions: [
      {
        id: 'sess-10',
        date: '2026-09-28',
        careType: 'corps',
        title: 'Protocole Minceur & Drainage Lymphatique des Cuisses',
        protocolSummary: 'Brossage à sec stimulant, gommage tonifiant au marc de café et sels, modelage palper-rouler manuel à l’huile de genièvre et cyprès, enveloppement cryothérapeutique.',
        durationMinutes: 75,
        productsUsedCabin: ['Huile Minceur Drainante Caudalie', 'Gel Cryogène Raffermissant'],
        technologiesUsed: ['Madérothérapie', 'Pressothérapie pneumatique 25 min'],
        skinReaction: 'Hyperémie normale sur les cuisses, jambes immédiatement plus légères.',
        notes: 'Perte de 1,2 cm de tour de cuisse mesurée après la séance grâce au drainage.',
        price: 95,
      },
      {
        id: 'sess-11',
        date: '2026-08-20',
        careType: 'visage',
        title: 'Soin Liftant Anti-Âge aux Peptides & Radiofréquence',
        protocolSummary: 'Peeling acide lactique doux, radiofréquence multipolaire 20 min sur l’ovale, masque collagène marin.',
        durationMinutes: 70,
        productsUsedCabin: ['Sérum Peptides de Cuivre', 'Masque Collagène', 'Crème Restructurante'],
        technologiesUsed: ['Radiofréquence visage', 'LED rouge 630nm'],
        skinReaction: 'Très bon rebond dermique, effet tenseur visible.',
        price: 110,
      }
    ],
    purchasedProducts: [
      {
        id: 'purch-10',
        date: '2026-09-28',
        productName: 'Huile Minceur & Anti-Capitons Drainante',
        brand: 'Caudalie / Body Slim Pro',
        category: 'Huile Soin Corps',
        barcode: '3525722028889',
        safetyScore: 92,
        price: 28.00,
        repurchaseStatus: 'actif',
        clientFeedback: 'Applique chaque soir après la douche, sensation de jambes légères.',
        rating: 5,
      },
      {
        id: 'purch-11',
        date: '2026-08-20',
        productName: 'Baume Corps Relipidant Lipikar AP+M',
        brand: 'La Roche-Posay',
        category: 'Baume Corps',
        barcode: '3337875597203',
        safetyScore: 90,
        price: 19.50,
        repurchaseStatus: 'renouvelé',
        clientFeedback: 'A racheté un 2ème flacon pour son mari et elle-même.',
        rating: 5,
      }
    ],
    privateNotes: [
      {
        id: 'note-10',
        date: '2026-09-28',
        author: 'Émilie (Esthéticienne)',
        category: 'objectif_suivi',
        content: 'Cure minceur en 5 séances programmée : 1 séance tous les 15 jours. Objectif : tonification des quadriceps et lissage des capitons fessiers avant ses vacances.',
        isImportant: true,
      }
    ]
  },
  {
    id: 'cli-03',
    fullName: 'Sarah Benali',
    age: 27,
    birthDate: '1999-02-14',
    phone: '07 45 11 22 33',
    email: 'sarah.benali@email.fr',
    address: '22 Rue des Martyrs, 75009 Paris',
    skinType: 'Peau à tendance acnéique kystique & hyperpigmentation',
    fitzpatrickScale: 'Phototype IV (Peau mate)',
    knownAllergies: ['Acide salicylique concentré >2%'],
    medicalHistory: ['Enceinte au 2ème trimestre (5 mois)'],
    isPregnant: true,
    sensitivities: 'Mélasme de grossesse débutant sur les tempes. Interdiction totale des rétinoïdes et des huiles essentielles.',
    contraindications: ['AUCUN rétinol / rétinoïde', 'AUCUNE huile essentielle lipolytique', 'Pas d’appareils à courants galvaniques ou radiofréquence'],
    createdAt: '2026-10-01',
    diagnosticsCount: 1,
    lastVisit: '2026-10-01',
    treatmentSessions: [
      {
        id: 'sess-20',
        date: '2026-10-01',
        careType: 'visage',
        title: 'Soin Éclat Pureté Spécial Maternité (100% Sans Risque)',
        protocolSummary: 'Nettoyage lacté prébiotique, masque purifiant à l’argile blanche et avoine colloïdale, modelage décongestionnant au squalane neutre, protection solaire minérale sans filtre chimique.',
        durationMinutes: 50,
        productsUsedCabin: ['Nettoyant doux bio', 'Argile blanche kaolin', 'Squalane 100% végétal', 'Écran minéral zinc non nano'],
        technologiesUsed: ['Vapeur simple sans ozone'],
        skinReaction: 'Excellente tolérance. Teint éclairci sans rougeur.',
        price: 70,
      }
    ],
    purchasedProducts: [
      {
        id: 'purch-20',
        date: '2026-10-01',
        productName: 'Créaline H2O Bioderma',
        brand: 'Bioderma',
        category: 'Démaquillant Visage',
        barcode: '3401345934573',
        safetyScore: 88,
        price: 14.90,
        repurchaseStatus: 'actif',
        rating: 5,
      }
    ],
    privateNotes: [
      {
        id: 'note-20',
        date: '2026-10-01',
        author: 'Émilie (Esthéticienne)',
        category: 'reaction_produit',
        content: 'ATTENTION GROSSESSE : vérifier chaque produit scanné ou utilisé avec le filtre grossesse. Remplacer systématiquement le rétinol par le Bakuchiol.',
        isImportant: true,
      }
    ]
  },
];
