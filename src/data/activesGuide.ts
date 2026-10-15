export interface CosmeticActiveDetail {
  id: string;
  name: string;
  category: 'anti_age' | 'purifiant' | 'hydratant' | 'anti_taches' | 'apaisant' | 'fermete_corps';
  targetConcerns: string[];
  skinTypes: string[];
  benefits: string;
  recommendedConcentration: string;
  mechanismOfAction: string;
  usageTips: string;
  contraindications: string;
  compatibleWith: string[];
  incompatibleWith: string[];
}

export const ACTIVES_ENCYCLOPEDIA: CosmeticActiveDetail[] = [
  {
    id: 'bakuchiol',
    name: 'Bakuchiol (Alternative Végétale au Rétinol)',
    category: 'anti_age',
    targetConcerns: ['Rides & ridules', 'Perte d’élasticité', 'Teint terne', 'Acné adulte'],
    skinTypes: ['Toutes peaux', 'Peaux sensibles', 'Femmes enceintes & allaitantes'],
    benefits: 'Stimule la production de collagène I et IV sans aucune irritation, desquamation ni photosensibilisation.',
    recommendedConcentration: '0.5% à 2%',
    mechanismOfAction: 'Agit sur les mêmes récepteurs géniques cellulaires que le rétinol sans interagir avec les récepteurs de l’acide rétinoïque responsables de l’inflammation.',
    usageTips: 'Peut être utilisé matin et soir sans risque avec exposition au soleil.',
    contraindications: 'Aucune connue. Sécurité totale pendant la grossesse.',
    compatibleWith: ['Niacinamide', 'Acide Hyaluronique', 'Vitamine C', 'Peptides'],
    incompatibleWith: [],
  },
  {
    id: 'niacinamide',
    name: 'Niacinamide (Vitamine B3)',
    category: 'apaisant',
    targetConcerns: ['Pores dilatés', 'Rougeurs', 'Taches pigmentaires', 'Barrière cutanée fragilisée'],
    skinTypes: ['Peaux réactives', 'Peaux acnéiques', 'Peaux matures', 'Peaux grasses'],
    benefits: 'Calme l’inflammation, booste la synthèse naturelle de céramides, resserre les pores et illumine le teint.',
    recommendedConcentration: '2% à 5% (jusqu’à 10% pour l’excès de sébum)',
    mechanismOfAction: 'Inhibe le transfert des mélanosomes vers les kératinocytes et augmente les niveaux de NADPH épidermiques.',
    usageTips: 'L’actif universel par excellence. Idéal en cabine avant ou après des appareils d’extraction ou LED.',
    contraindications: 'Éviter les très fortes concentrations (>12%) sur peaux ultra-réactives (effet flushing vasodilatateur temporaire).',
    compatibleWith: ['Acide Hyaluronique', 'Zinc', 'Rétinol', 'Céramides', 'Peptides'],
    incompatibleWith: ['Acide Ascorbique pur au même instant (risque de formation d’acide nicotinique rougissant).'],
  },
  {
    id: 'acide_hyaluronique',
    name: 'Acide Hyaluronique Multi-Poids Moléculaire',
    category: 'hydratant',
    targetConcerns: ['Déshydratation profonde', 'Ridules de sécheresse', 'Manque de rebond', 'Post-peeling'],
    skinTypes: ['Tous types de peaux sans exception'],
    benefits: 'Capable de retenir jusqu’à 1000 fois son poids en eau. Le haut poids protège la surface, le bas poids hydrate le derme superficiel.',
    recommendedConcentration: '0.1% à 2%',
    mechanismOfAction: 'Crée un réservoir d’eau épidermique et active les récepteurs CD44 stimulant la prolifération des fibroblastes.',
    usageTips: 'Appliquer toujours sur peau légèrement humidifiée (lotion florale ou eau thermale) pour maximiser la captation d’eau.',
    contraindications: 'Aucune.',
    compatibleWith: ['Tous les actifs'],
    incompatibleWith: [],
  },
  {
    id: 'acide_azelaique',
    name: 'Acide Azélaïque Pur',
    category: 'purifiant',
    targetConcerns: ['Rosacée', 'Couperose', 'Mélasme', 'Acné inflammatoire', 'Cicatrices pigmentées'],
    skinTypes: ['Peaux réactives', 'Peaux sujettes aux rougeurs', 'Peaux acnéiques'],
    benefits: 'Antibactérien, anti-inflammatoire et dépigmentant sélectif remarquable. Ne détruit que les mélanocytes hyperactifs.',
    recommendedConcentration: '10% (cosmétique libre) à 15-20% (médical)',
    mechanismOfAction: 'Inhibe la tyrosinase et réduit la transcription de la kallikréine 5, enzyme responsable des rougeurs vasculaires.',
    usageTips: 'Actif superstar pour les clientes souffrant de rosacée qui ne supportent ni les AHA ni le rétinol.',
    contraindications: 'Légers picotements normaux lors des premières applications.',
    compatibleWith: ['Niacinamide', 'Acide Hyaluronique', 'Céramides'],
    incompatibleWith: ['AHA/BHA forts simultanément si la peau picote trop.'],
  },
  {
    id: 'peptides_cuivre',
    name: 'Peptides de Cuivre (GHK-Cu)',
    category: 'anti_age',
    targetConcerns: ['Relâchement cutané', 'Cicatrices post-boutons', 'Perte de densité dermique'],
    skinTypes: ['Peaux matures', 'Peaux atones', 'Post-micro-needling cabine'],
    benefits: 'Booste la régénération tissulaire, la synthèse d’élastine et de protéoglycanes, améliore la fermeté.',
    recommendedConcentration: '0.5% à 2%',
    mechanismOfAction: 'Signal biologique stimulant le remodelage de la matrice extracellulaire et l’élimination du collagène endommagé.',
    usageTips: 'Merveilleux en cure régénérante post-soin intensif cabine.',
    contraindications: 'Ne pas combiner avec des acides exfoliants à pH bas (décomplexation du cuivre).',
    compatibleWith: ['Acide Hyaluronique', 'Niacinamide', 'Squalane'],
    incompatibleWith: ['Vitamine C pure', 'AHA/BHA directs'],
  },
  {
    id: 'caffeine_centella_corps',
    name: 'Caféine Pure & Centella Asiatica (Synergie Corps)',
    category: 'fermete_corps',
    targetConcerns: ['Cellulite adipeuse et aqueuse', 'Peau d’orange', 'Jambes lourdes', 'Relâchement des bras et cuisses'],
    skinTypes: ['Tous soins du corps institut'],
    benefits: 'Déstocke les triglycérides adipocytaires et relance la microcirculation veinotonique et lymphatique.',
    recommendedConcentration: '3% à 5% de caféine + 1% d’asiaticoside',
    mechanismOfAction: 'Inhibition de la phosphodiestérase entraînant une lipolyse enzymatique accrue dans les adipocytes.',
    usageTips: 'À associer impérativement à des manœuvres de palper-rouler manuel ou madérothérapie en cabine.',
    contraindications: 'Femmes enceintes (limiter la caféine sur de très larges surfaces corporelles).',
    compatibleWith: ['Huiles drainantes de cèdre et cyprès', 'Extraits d’algues laminaires'],
    incompatibleWith: [],
  },
];

export const TOXIC_SUBSTITUTIONS_GUIDE = [
  {
    problematicIngredient: 'Rétinol traditionnel & Acide Rétinoïque',
    reasonForCaution: 'Tératogène (strictement interdit femme enceinte), hautement desquamant, rougeurs, photosensibilisant en institut.',
    cleanAlternative: 'Bakuchiol 1% ou Granactive Retinoid (HPR)',
    benefit: 'Zéro desquamation, utilisable en journée, 100% sûr pour la maternité, efficacité pro prouvée.',
  },
  {
    problematicIngredient: 'Sulfates agressifs (SLS / SLES)',
    reasonForCaution: 'Altèrent le ciment intercellulaire et dénaturent le microbiome cutané, provoquant sécheresse et réactivité.',
    cleanAlternative: 'Coco-Glucoside, Decyl Glucoside, Sodium Cocoyl Glutamate',
    benefit: 'Mousse onctueuse d’origine sucrière ou d’acides aminés, préserve 100% du film hydrolipidique.',
  },
  {
    problematicIngredient: 'Silicones occlusifs (Dimethicone, Cyclopentasiloxane)',
    reasonForCaution: 'Effet lissant trompeur en surface mais créent un film imperméable polluant et asphyxiant les pores comédoniens.',
    cleanAlternative: 'Squalane végétal d’olive ou Hémisqualane fermenté',
    benefit: 'Lipide biomimétique naturellement présent dans le sébum humain, pénètre sans effet gras ni comédons.',
  },
  {
    problematicIngredient: 'BHT, BHA & Parabènes synthétiques',
    reasonForCaution: 'Perturbateurs endocriniens avérés ou sous enquête européenne, toxicité cellulaire potentielle.',
    cleanAlternative: 'Tocophérol végétal (Vitamine E naturelle) + Extrait de Romarin CO2',
    benefit: 'Antioxydant naturel remarquable, stabilise les formules sans aucun impact hormonal.',
  },
  {
    problematicIngredient: 'Huiles minérales (Paraffinum Liquidum, Petrolatum)',
    reasonForCaution: 'Dérivés pétrochimiques fossiles inertes, barrière occlusive artificielle sans aucun apport vitaminique.',
    cleanAlternative: 'Huile de Jojoba vierge, Beurre de Karité brut, Huile de Bourrache',
    benefit: 'Riches en acides gras oméga-3, 6, 9 et phytostérols biocompatibles renforçant l’élasticité.',
  },
];
