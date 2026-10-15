import React from 'react';
import { DiagnosticReport } from '../types';
import { Printer, X, Sparkles, ShieldAlert, CheckCircle2, HeartHandshake } from 'lucide-react';

interface Props {
  report: DiagnosticReport;
  onClose: () => void;
  instituteName?: string;
  estheticianName?: string;
}

export const PrintablePrescriptionModal: React.FC<Props> = ({
  report,
  onClose,
  instituteName = "Institut Derm'Esthétique & Bien-Être",
  estheticianName = "Émilie - Dermo-Esthéticienne Conseil",
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex justify-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto border border-stone-200">
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print bg-stone-100 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-700">
            <Sparkles className="w-5 h-5 text-rose-600" />
            <span className="font-semibold text-sm">Fiche Bilan & Ordonnance Beauté Personnalisée</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimer / Enregistrer PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="p-8 sm:p-12 text-stone-800 space-y-8 bg-white printable-content" id="printable-prescription">
          {/* Header */}
          <div className="border-b border-stone-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-rose-800">
                Protocole Dermo-Esthétique Professionnel
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-stone-900 font-bold mt-1">
                {instituteName}
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Diagnostic Clinique Cutané & Ordonnance de Soin Visage / Corps
              </p>
            </div>
            <div className="text-left sm:text-right text-xs text-stone-600 space-y-1 bg-stone-50 p-3 rounded-lg border border-stone-200/60">
              <div><span className="font-semibold text-stone-800">Date du bilan :</span> {report.date}</div>
              <div><span className="font-semibold text-stone-800">Praticienne :</span> {estheticianName}</div>
              <div><span className="font-semibold text-stone-800">Réf. dossier :</span> {report.id}</div>
            </div>
          </div>

          {/* Client Information Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-rose-50/60 border border-rose-100 text-xs">
            <div>
              <span className="text-stone-500 block">Cliente</span>
              <span className="font-semibold text-stone-900 text-sm">{report.clientName}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Âge</span>
              <span className="font-medium text-stone-800">{report.clientAge ? `${report.clientAge} ans` : 'Non renseigné'}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Type de Soin</span>
              <span className="font-semibold text-rose-900 uppercase">
                {report.treatmentArea === 'corps' ? 'Soin Corporel' : 'Soin du Visage'}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">Zone Ciblée</span>
              <span className="font-medium text-stone-800">{report.specificZone}</span>
            </div>
          </div>

          {/* Diagnostic Summary */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              Synthèse du Diagnostic de Peau & Biométrie Cutanée
            </h2>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 text-sm leading-relaxed text-stone-700 italic">
              "{report.diagnosticSummary}"
            </div>

            {report.metrics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white border border-stone-200 p-2 rounded-lg text-stone-700">
                  <span className="text-[10px] text-stone-400 block">Hydratation</span>
                  <span className="font-bold text-stone-900">{report.metrics.hydrationScore}%</span>
                </div>
                <div className="bg-white border border-stone-200 p-2 rounded-lg text-stone-700">
                  <span className="text-[10px] text-stone-400 block">Sébum & Lipides</span>
                  <span className="font-bold text-stone-900">{report.metrics.sebumScore}%</span>
                </div>
                <div className="bg-white border border-stone-200 p-2 rounded-lg text-stone-700">
                  <span className="text-[10px] text-stone-400 block">Fermeté / Élasticité</span>
                  <span className="font-bold text-stone-900">{report.metrics.elasticityFirmnessScore}%</span>
                </div>
                <div className="bg-white border border-stone-200 p-2 rounded-lg text-stone-700">
                  <span className="text-[10px] text-stone-400 block">Rougeurs / Réactivité</span>
                  <span className="font-bold text-stone-900">{report.metrics.rednessSensitivityScore}%</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-xs pt-1">
              <span className="bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-stone-700">
                <strong className="text-stone-900">Type :</strong> {report.skinTypeAssessment.mainType}
              </span>
              <span className="bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-stone-700">
                <strong className="text-stone-900">Hydratation :</strong> {report.skinTypeAssessment.hydrationLevel}
              </span>
              <span className="bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-stone-700">
                <strong className="text-stone-900">Lipides épidermiques :</strong> {report.skinTypeAssessment.lipidLevel}
              </span>
            </div>
          </div>

          {/* Cabin Protocol Realized / Recommended */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-stone-900"></span>
                Protocole Réalisé en Institut ({report.cabinProtocol.duration})
              </h2>
              <span className="text-xs font-serif italic text-rose-800 font-medium">
                {report.cabinProtocol.title}
              </span>
            </div>
            <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
              <div className="divide-y divide-stone-100">
                {report.cabinProtocol.steps.map((st) => (
                  <div key={st.stepNumber} className="p-3 flex items-start gap-3 hover:bg-stone-50/50">
                    <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {st.stepNumber}
                    </span>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-stone-900">{st.actionName}</span>
                        <span className="text-[11px] text-stone-500">{st.phase}</span>
                      </div>
                      <p className="text-stone-600 text-[11px]">{st.equipmentOrTechnique}</p>
                      {st.activeIngredients && st.activeIngredients.length > 0 && (
                        <div className="text-[10px] text-rose-800">
                          <span className="font-medium">Actifs infusés :</span> {st.activeIngredients.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Home Care Prescription (Ordonnance beauté) */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Ordonnance Beauté & Routine Domicile Personnalisée
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Matin */}
              <div className="border border-amber-200/80 bg-amber-50/30 rounded-xl p-4 space-y-3">
                <span className="font-semibold text-amber-950 uppercase tracking-wider text-[11px] block">
                  Routine du Matin (Protection & Éveil)
                </span>
                <div className="space-y-2">
                  {report.homePrescription.morning.map((m, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-amber-100 shadow-2xs">
                      <div className="font-semibold text-stone-900 text-[11px]">{m.step}</div>
                      <div className="text-stone-600 text-[11px] mt-0.5">{m.category}</div>
                      <div className="text-[10px] text-amber-900 mt-1">
                        <strong>Actifs cibles :</strong> {m.keyActives}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Soir */}
              <div className="border border-indigo-200/80 bg-indigo-50/30 rounded-xl p-4 space-y-3">
                <span className="font-semibold text-indigo-950 uppercase tracking-wider text-[11px] block">
                  Routine du Soir (Régénération & Réparation)
                </span>
                <div className="space-y-2">
                  {report.homePrescription.evening.map((e, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
                      <div className="font-semibold text-stone-900 text-[11px]">{e.step}</div>
                      <div className="text-stone-600 text-[11px] mt-0.5">{e.category}</div>
                      <div className="text-[10px] text-indigo-900 mt-1">
                        <strong>Actifs cibles :</strong> {e.keyActives}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Care & Lifestyle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="font-semibold text-stone-800 block mb-1">Soin Hebdomadaire Recommandé</span>
                <p className="text-stone-600 leading-relaxed text-[11px]">{report.homePrescription.weeklyCare}</p>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="font-semibold text-stone-800 block mb-1">Conseils d’Hygiène de Vie & Nutrition</span>
                <ul className="text-stone-600 space-y-1 list-disc pl-4 text-[11px]">
                  {report.homePrescription.lifestyleAdvice.map((adv, i) => (
                    <li key={i}>{adv}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Actives to seek vs Actives to avoid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-1.5 text-emerald-900 font-semibold mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ingrédients Recommandés pour Votre Peau</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {report.recommendedActiveIngredients.map((ing, i) => (
                  <span key={i} className="bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <div className="flex items-center gap-1.5 text-rose-900 font-semibold mb-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Substances à Proscrire / Scanner Avant Achat</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {report.activesToAvoid.map((bad, i) => (
                  <span key={i} className="bg-white text-rose-800 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                    {bad}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="border-t border-stone-200 pt-6 flex justify-between items-end text-xs text-stone-500">
            <div className="space-y-1 max-w-sm">
              <div className="flex items-center gap-2 text-stone-800 font-medium">
                <HeartHandshake className="w-4 h-4 text-rose-600" />
                <span>Votre institut partenaire beauté & santé cutanée</span>
              </div>
              <p className="text-[10px] text-stone-400">
                Ce document constitue un protocole cosmétique personnalisé et ne se substitue pas à une consultation médicale dermatologique.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-stone-400 mb-6">Signature de l’esthéticienne :</div>
              <div className="font-serif italic font-semibold text-sm text-stone-800 border-b border-stone-400 pb-1 inline-block min-w-36">
                {estheticianName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
