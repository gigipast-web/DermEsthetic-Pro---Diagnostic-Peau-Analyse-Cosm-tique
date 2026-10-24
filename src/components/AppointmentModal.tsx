import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Sparkles, MapPin, DollarSign, User, FileText, CheckCircle2 } from 'lucide-react';
import { Appointment, ClientProfile, AppointmentStatus, AppointmentCareType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => void;
  clients: ClientProfile[];
  initialClient?: ClientProfile;
  initialDate?: string;
  initialAppointment?: Appointment | null;
}

const SERVICE_PRESETS = [
  { title: 'Soin Réparateur Barrière Cutanée & Quartz Rose', type: 'visage' as AppointmentCareType, duration: 60, price: 85 },
  { title: 'Soin Anti-Âge Repulpant Ovale & Décolleté', type: 'visage' as AppointmentCareType, duration: 75, price: 95 },
  { title: 'Bilan Dermo-Analytique IA & Diagnostic Visage', type: 'diagnostic' as AppointmentCareType, duration: 45, price: 65 },
  { title: 'Peeling Enzymatique & Luminothérapie LED', type: 'visage' as AppointmentCareType, duration: 50, price: 80 },
  { title: 'Drainage Lymphatique & Jambes Légères', type: 'corps' as AppointmentCareType, duration: 60, price: 75 },
  { title: 'Cure Madérothérapie & Anti-Cellulite', type: 'corps' as AppointmentCareType, duration: 75, price: 95 },
  { title: 'Flash Hydratation & Contrôle Cornéométrie', type: 'cure_suivi' as AppointmentCareType, duration: 30, price: 40 },
  { title: 'Nettoyage Profond & Désincrustation Pureté', type: 'visage' as AppointmentCareType, duration: 60, price: 70 },
];

const CABIN_OPTIONS = [
  'Cabine 1 - Rose Poudrée (Visage & LED)',
  'Cabine 2 - Haute Technologie (Diagnostic & Radiofréquence)',
  'Cabine 3 - Espace Corps & Spa (Madérothérapie & Soins)',
];

export const AppointmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  initialClient,
  initialDate,
  initialAppointment,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('14:30');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [endTime, setEndTime] = useState<string>('15:30');
  const [serviceType, setServiceType] = useState<AppointmentCareType>('visage');
  const [serviceTitle, setServiceTitle] = useState<string>('Soin Réparateur Barrière Cutanée & Quartz Rose');
  const [cabin, setCabin] = useState<string>(CABIN_OPTIONS[0]);
  const [price, setPrice] = useState<number>(85);
  const [status, setStatus] = useState<AppointmentStatus>('confirme');
  const [notes, setNotes] = useState<string>('');

  // Calculate end time helper
  const calculateEndTime = (start: string, duration: number): string => {
    if (!start) return '';
    const [hStr, mStr] = start.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return '';
    const totalMinutes = h * 60 + m + duration;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isOpen) {
      if (initialAppointment) {
        // Edit existing appointment
        setSelectedClientId(initialAppointment.clientId);
        setClientName(initialAppointment.clientName);
        setClientPhone(initialAppointment.clientPhone || '');
        setClientEmail(initialAppointment.clientEmail || '');
        setDate(initialAppointment.date);
        setStartTime(initialAppointment.startTime);
        setDurationMinutes(initialAppointment.durationMinutes);
        setEndTime(initialAppointment.endTime || calculateEndTime(initialAppointment.startTime, initialAppointment.durationMinutes));
        setServiceType(initialAppointment.serviceType);
        setServiceTitle(initialAppointment.serviceTitle);
        setCabin(initialAppointment.cabin || CABIN_OPTIONS[0]);
        setPrice(initialAppointment.price ?? 85);
        setStatus(initialAppointment.status);
        setNotes(initialAppointment.notes || '');
      } else {
        // New appointment
        const client = initialClient || clients[0];
        if (client) {
          setSelectedClientId(client.id);
          setClientName(client.fullName);
          setClientPhone(client.phone || '');
          setClientEmail(client.email || '');
        } else {
          setSelectedClientId('');
          setClientName('');
          setClientPhone('');
          setClientEmail('');
        }

        const targetDate = initialDate || new Date().toISOString().split('T')[0];
        setDate(targetDate);
        setStartTime('14:30');
        setDurationMinutes(60);
        setEndTime(calculateEndTime('14:30', 60));
        setServiceType('visage');
        setServiceTitle('Soin Réparateur Barrière Cutanée & Quartz Rose');
        setCabin(CABIN_OPTIONS[0]);
        setPrice(85);
        setStatus('confirme');
        setNotes('');
      }
    }
  }, [isOpen, initialAppointment, initialClient, initialDate, clients]);

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setClientName(client.fullName);
      setClientPhone(client.phone || '');
      setClientEmail(client.email || '');
    }
  };

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    setEndTime(calculateEndTime(newStart, durationMinutes));
  };

  const handleDurationChange = (minutes: number) => {
    setDurationMinutes(minutes);
    setEndTime(calculateEndTime(startTime, minutes));
  };

  const handleApplyPreset = (preset: typeof SERVICE_PRESETS[0]) => {
    setServiceTitle(preset.title);
    setServiceType(preset.type);
    setDurationMinutes(preset.duration);
    setPrice(preset.price);
    setEndTime(calculateEndTime(startTime, preset.duration));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !date || !startTime) return;

    const appointmentToSave: Appointment = {
      id: initialAppointment?.id || 'apt-' + Date.now(),
      clientId: selectedClientId || 'custom-' + Date.now(),
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || undefined,
      clientEmail: clientEmail.trim() || undefined,
      date,
      startTime,
      endTime: endTime || calculateEndTime(startTime, durationMinutes),
      durationMinutes,
      serviceType,
      serviceTitle: serviceTitle.trim(),
      cabin,
      price,
      status,
      notes: notes.trim() || undefined,
      createdAt: initialAppointment?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(appointmentToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-auto border border-stone-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-800">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                {initialAppointment ? 'Modifier le Rendez-vous' : 'Planifier un Rendez-vous Cabine'}
              </h3>
              <p className="text-[11px] text-stone-500">
                Définition du créneau horaire, de la cabine et du protocole de soin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Cliente Selection */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-stone-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-rose-700" />
              <span>Cliente Associée *</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={selectedClientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="">-- Choisir une cliente existante --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Nom complet de la cliente"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
              />
            </div>

            {/* Quick contact info */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <input
                type="tel"
                placeholder="Téléphone (ex: 06 12 34 56 78)"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
              <input
                type="email"
                placeholder="Email (ex: client@email.com)"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Date, Heure & Durée */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-rose-700" />
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-500" />
                  Heure de début *
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-500" />
                  Heure de fin
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs shadow-2xs"
                />
              </div>
            </div>

            {/* Quick duration presets */}
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-500 block mb-1">
                Durée du créneau : {durationMinutes} min
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[30, 45, 50, 60, 75, 90, 120].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => handleDurationChange(dur)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      durationMinutes === dur
                        ? 'bg-rose-900 text-white font-semibold shadow-2xs'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {dur} min
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prestation / Protocole */}
          <div className="space-y-2">
            <label className="block font-semibold text-stone-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-700" />
              <span>Prestation & Protocole Cabine *</span>
            </label>

            {/* Quick service suggestions */}
            <div>
              <span className="text-[10px] text-stone-500 block mb-1">Suggestions rapides de soins :</span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-stone-50 rounded-xl border border-stone-200">
                {SERVICE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2 py-1 rounded bg-white hover:bg-rose-50 border border-stone-200 text-stone-700 hover:text-rose-900 text-[10px] text-left transition-colors cursor-pointer"
                  >
                    {preset.title} ({preset.duration}m · {preset.price}€)
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  placeholder="Intitulé précis du soin..."
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as AppointmentCareType)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                >
                  <option value="visage">Soin Visage</option>
                  <option value="corps">Soin Corps</option>
                  <option value="diagnostic">Diagnostic Cutané IA</option>
                  <option value="cure_suivi">Cure & Suivi</option>
                  <option value="peeling">Peeling & Rénovation</option>
                  <option value="autre">Autre Prestation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cabine, Statut & Tarif */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-500" />
                Cabine
              </label>
              <select
                value={cabin}
                onChange={(e) => setCabin(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
              >
                {CABIN_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-stone-500" />
                Tarif Prévu (€)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-stone-500" />
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
              >
                <option value="confirme">Confirmé</option>
                <option value="en_attente">En attente</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>
          </div>

          {/* Notes / Objectifs cabine */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-stone-500" />
              Notes / Objectifs & Préparations de la séance
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Prévoir le masque biocellulose et sérum céramides. Vérifier l'état de sécheresse des pommettes."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-950 hover:bg-rose-900 text-white rounded-xl font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{initialAppointment ? 'Enregistrer les Modifications' : 'Confirmer le Rendez-vous'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
