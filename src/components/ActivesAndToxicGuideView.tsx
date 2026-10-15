import React, { useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Heart,
  Droplets,
  Layers,
  ArrowRight,
  Info,
  ShieldCheck
} from 'lucide-react';
import { ACTIVES_ENCYCLOPEDIA, TOXIC_SUBSTITUTIONS_GUIDE } from '../data/activesGuide';
import { INCI_HAZARD_DICTIONARY } from '../data/cosmeticsDatabase';

export const ActivesAndToxicGuideView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'actives' | 'toxics' | 'substitutions'>('actives');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [toxicCategoryFilter, setToxicCategoryFilter] = useState<string>('all');

  // Filter actives
  const filteredActives = ACTIVES_ENCYCLOPEDIA.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.benefits.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.targetConcerns.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      activeCategoryFilter === 'all' || item.category === activeCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filter toxics
  const toxicList = Object.entries(INCI_HAZARD_DICTIONARY).map(([id, val]) => ({
    id,
    ...val,
  }));

  const filteredToxics = toxicList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dangerDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.scientificContext.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      toxicCategoryFilter === 'all' || item.category === toxicCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="border-b border-stone-200/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-700 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Guide de Formulation & Toxicologie Esthétique</span>
        </div>
        <h1 className="text-3xl font-serif text-stone-900 font-bold">
          Encyclopédie des Meilleurs Actifs & Dictionnaire des Substances à Risque
        </h1>
        <p className="text-sm text-stone-600 mt-1 max-w-3xl">
          Référentiel professionnel pour conseiller vos clientes : découvrez les molécules biocompatibles les plus
          performantes et identifiez les perturbateurs endocriniens, silicones occlusifs et conservateurs controversés.
        </p>
      </div>

      {/* Sub Tabs Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex p-1 bg-stone-100 rounded-xl max-w-md">
          <button
            onClick={() => {
              setActiveSubTab('actives');
              setSearchTerm('');
            }}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'actives'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Meilleurs Actifs Pro ({ACTIVES_ENCYCLOPEDIA.length})
          </button>
          <button
            onClick={() => {
              setActiveSubTab('toxics');
              setSearchTerm('');
            }}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'toxics'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            Substances à Bannir ({toxicList.length})
          </button>
          <button
            onClick={() => {
              setActiveSubTab('substitutions');
              setSearchTerm('');
            }}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'substitutions'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
            Guide Alternatives Clean
          </button>
        </div>

        {/* Search bar */}
        {activeSubTab !== 'substitutions' && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Rechercher une molécule, un risque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
        )}
      </div>

      {/* TAB 1: Best Actives Encyclopedia */}
      {activeSubTab === 'actives' && (
        <div className="space-y-6">
          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium mr-1">Filtrer par action :</span>
            {[
              { id: 'all', label: 'Tous les actifs' },
              { id: 'anti_age', label: 'Anti-Âge & Fermeté' },
              { id: 'apaisant', label: 'Apaisant & Anti-Rougeurs' },
              { id: 'hydratant', label: 'Hydratation Profonde' },
              { id: 'purifiant', label: 'Purifiant & Anti-Imperfections' },
              { id: 'fermete_corps', label: 'Minceur & Fermeté Corps' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeCategoryFilter === cat.id
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActives.map((active) => (
              <div
                key={active.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4 flex flex-col justify-between hover:border-stone-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
                      {active.name}
                    </h3>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                      {active.recommendedConcentration}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">{active.benefits}</p>

                  {/* Target concerns */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Indications Cabine :
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {active.targetConcerns.map((tc, idx) => (
                        <span
                          key={idx}
                          className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[10px] font-medium"
                        >
                          {tc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Biological Mechanism */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-xs space-y-1">
                    <span className="font-semibold text-stone-800 text-[11px] block">Mécanisme d’action :</span>
                    <p className="text-stone-600 text-[11px] leading-relaxed">{active.mechanismOfAction}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                  <div className="text-[11px] text-stone-700">
                    <strong className="text-stone-900">Conseil d’application :</strong> {active.usageTips}
                  </div>
                  {active.contraindications && (
                    <div className="text-[11px] text-amber-900 bg-amber-50/60 p-2 rounded-lg border border-amber-200/50">
                      <strong>Précautions :</strong> {active.contraindications}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Hazardous INCI Dictionary */}
      {activeSubTab === 'toxics' && (
        <div className="space-y-6">
          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium mr-1">Filtrer par danger :</span>
            {[
              { id: 'all', label: 'Toutes les substances' },
              { id: 'perturbateur_endocrinien', label: 'Perturbateurs Endocriniens' },
              { id: 'cancérogène_suspecté', label: 'Cancérogènes & Formaldéhyde' },
              { id: 'irritant_sulfate', label: 'Sulfates Décapants (SLS)' },
              { id: 'huile_minérale_occlusive', label: 'Huiles Minérales Occlusives' },
              { id: 'polluant_silicone_peg', label: 'Silicones & PEG' },
              { id: 'allergène_parfum', label: 'Allergènes de Parfum' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setToxicCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  toxicCategoryFilter === cat.id
                    ? 'bg-rose-950 text-white shadow-2xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Toxic List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredToxics.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">{item.name}</h3>
                    <span className="text-[11px] text-stone-500 capitalize">
                      Catégorie : {item.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase shrink-0 ${
                      item.severity === 'haute'
                        ? 'bg-rose-100 text-rose-900 border border-rose-200'
                        : item.severity === 'moyenne'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-stone-100 text-stone-800 border border-stone-200'
                    }`}
                  >
                    Danger {item.severity}
                  </span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200/70">
                  {item.dangerDescription}
                </p>

                <div className="text-[11px] text-stone-500 italic flex items-start gap-1.5 pt-1">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-stone-400" />
                  <span>Contexte scientifique : {item.scientificContext}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Clean Substitutions Guide */}
      {activeSubTab === 'substitutions' && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <strong className="block text-sm">Le Guide de Substitution Clean de l'Institut :</strong>
              Remplacez les ingrédients polluants ou irritants par des molécules nobles d’origine naturelle ou biotechnologique ayant une efficacité clinique prouvée.
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="divide-y divide-stone-100">
              {TOXIC_SUBSTITUTIONS_GUIDE.map((sub, i) => (
                <div key={i} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center hover:bg-stone-50/40 transition-colors">
                  {/* Left: Problematic Ingredient */}
                  <div className="md:col-span-5 space-y-1.5">
                    <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Ingrédient Problématique</span>
                    </div>
                    <div className="font-bold text-stone-900 text-base">{sub.problematicIngredient}</div>
                    <p className="text-xs text-stone-600 leading-relaxed">{sub.reasonForCaution}</p>
                  </div>

                  {/* Middle Arrow */}
                  <div className="md:col-span-1 flex justify-center text-stone-400">
                    <ArrowRight className="w-6 h-6 hidden md:block" />
                  </div>

                  {/* Right: Clean Alternative */}
                  <div className="md:col-span-6 space-y-1.5 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80">
                    <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold uppercase">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Alternative Pro Recommandée</span>
                    </div>
                    <div className="font-bold text-emerald-950 text-base">{sub.cleanAlternative}</div>
                    <p className="text-xs text-emerald-900/90 leading-relaxed">{sub.benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
