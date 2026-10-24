import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  DollarSign,
  Filter,
  Check,
  Search,
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Appointment, ClientProfile, AppointmentStatus, AppointmentCareType } from '../types';

interface Props {
  appointments: Appointment[];
  clients: ClientProfile[];
  onAddAppointment: (appointment: Appointment) => void;
  onUpdateAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onSelectClientDossier: (client: ClientProfile) => void;
  onOpenNewAppointmentModal: (presetDate?: string, presetClient?: ClientProfile) => void;
  onEditAppointment: (appointment: Appointment) => void;
}

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAYS_HEADER_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const AppointmentsCalendarView: React.FC<Props> = ({
  appointments,
  clients,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onSelectClientDossier,
  onOpenNewAppointmentModal,
  onEditAppointment,
}) => {
  // Calendar month state - defaults to October 2026 based on app current demo date
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Check if there are appointments to base month on
    if (appointments.length > 0) {
      const firstDate = new Date(appointments[0].date);
      if (!isNaN(firstDate.getTime())) return firstDate;
    }
    return new Date();
  });

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'selected'>('all');
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<AppointmentCareType | 'all'>('all');
  const [clientSearch, setClientSearch] = useState<string>('');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(now.toISOString().split('T')[0]);
    setFilterPeriod('today');
  };

  // Build calendar matrix (Monday-based)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const totalDaysInMonth = lastDayOfMonth.getDate();
    // getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
    // In French calendar Monday is 0
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month filler days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const prevDay = prevMonthLastDay - i;
      const prevDate = new Date(currentYear, currentMonth - 1, prevDay);
      const dateStr = prevDate.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayNumber: prevDay,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      // Format as YYYY-MM-DD local
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
      days.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Trailing days from next month to complete standard 35 or 42 cells grid
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i);
      const dateStr = nextDate.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Appointments map by date
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const apt of appointments) {
      if (!map[apt.date]) {
        map[apt.date] = [];
      }
      map[apt.date].push(apt);
    }
    // Sort each day by startTime
    for (const date in map) {
      map[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [appointments]);

  // KPIs
  const totalUpcoming = appointments.filter((a) => a.status === 'confirme' || a.status === 'en_attente').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const appointmentsToday = appointments.filter((a) => a.date === todayStr);

  // This week calculation
  const appointmentsThisWeek = useMemo(() => {
    const now = new Date();
    const currDay = (now.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - currDay);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const monStr = monday.toISOString().split('T')[0];
    const sunStr = sunday.toISOString().split('T')[0];

    return appointments.filter((a) => a.date >= monStr && a.date <= sunStr);
  }, [appointments]);

  const estimatedRevenue = useMemo(() => {
    return appointments
      .filter((a) => a.status === 'confirme' || a.status === 'termine')
      .reduce((acc, a) => acc + (a.price || 0), 0);
  }, [appointments]);

  // Filtered appointments list
  const filteredAppointments = useMemo(() => {
    let list = [...appointments];

    // Filter by period / date
    if (filterPeriod === 'today') {
      list = list.filter((a) => a.date === todayStr);
    } else if (filterPeriod === 'week') {
      const now = new Date();
      const currDay = (now.getDay() + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - currDay);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const monStr = monday.toISOString().split('T')[0];
      const sunStr = sunday.toISOString().split('T')[0];
      list = list.filter((a) => a.date >= monStr && a.date <= sunStr);
    } else if (filterPeriod === 'selected' && selectedDateStr) {
      list = list.filter((a) => a.date === selectedDateStr);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      list = list.filter((a) => a.status === filterStatus);
    }

    // Filter by type
    if (filterType !== 'all') {
      list = list.filter((a) => a.serviceType === filterType);
    }

    // Filter by client search
    if (clientSearch.trim()) {
      const q = clientSearch.toLowerCase();
      list = list.filter(
        (a) =>
          a.clientName.toLowerCase().includes(q) ||
          (a.serviceTitle && a.serviceTitle.toLowerCase().includes(q)) ||
          (a.cabin && a.cabin.toLowerCase().includes(q)) ||
          (a.clientPhone && a.clientPhone.includes(q))
      );
    }

    // Sort chronologically by date then startTime
    return list.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [appointments, filterPeriod, filterStatus, filterType, selectedDateStr, todayStr, clientSearch]);

  const handleStatusChange = (apt: Appointment, newStatus: AppointmentStatus) => {
    onUpdateAppointment({
      ...apt,
      status: newStatus,
    });
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirme':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Confirmé
          </span>
        );
      case 'en_attente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3" />
            En attente
          </span>
        );
      case 'termine':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Check className="w-3 h-3" />
            Effectué
          </span>
        );
      case 'annule':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-500 border border-stone-200 line-through">
            <XCircle className="w-3 h-3" />
            Annulé
          </span>
        );
    }
  };

  const getTypeColor = (type: AppointmentCareType) => {
    switch (type) {
      case 'visage':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'corps':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'diagnostic':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'cure_suivi':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'peeling':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  const getTypeDotColor = (type: AppointmentCareType) => {
    switch (type) {
      case 'visage':
        return 'bg-rose-500';
      case 'corps':
        return 'bg-emerald-500';
      case 'diagnostic':
        return 'bg-indigo-500';
      case 'cure_suivi':
        return 'bg-amber-500';
      case 'peeling':
        return 'bg-purple-500';
      default:
        return 'bg-stone-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 font-medium block">Rendez-vous programmés</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-serif text-stone-900">{totalUpcoming}</span>
              <span className="text-[10px] text-stone-400">à venir</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 font-medium block">Visites Aujourd'hui</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-serif text-stone-900">{appointmentsToday.length}</span>
              <span className="text-[10px] text-amber-700 font-medium">en cabine</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 font-medium block">Visites Cette Semaine</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-serif text-stone-900">{appointmentsThisWeek.length}</span>
              <span className="text-[10px] text-emerald-700 font-medium">créneaux</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 font-medium block">Prestations Prévisionnelles</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-serif text-stone-900">{estimatedRevenue} €</span>
              <span className="text-[10px] text-stone-400">confirmé</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Planning Grid: Left Calendar (Month View), Right Upcoming Visits Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Month Calendar (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          {/* Calendar Header with navigation */}
          <div className="p-4 sm:p-5 border-b border-stone-200/80 bg-stone-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                {MONTH_NAMES_FR[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={handleGoToday}
                className="px-2.5 py-1 text-[11px] font-semibold text-rose-900 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
              >
                Aujourd'hui
              </button>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center bg-white border border-stone-200 rounded-xl p-0.5 shadow-2xs">
                <button
                  onClick={handlePrevMonth}
                  aria-label="Mois précédent"
                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  aria-label="Mois suivant"
                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => onOpenNewAppointmentModal(selectedDateStr || todayStr)}
                className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau Créneau</span>
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-stone-200 text-center text-xs font-semibold text-stone-500 bg-stone-50/50 py-2.5">
            {DAYS_HEADER_FR.map((d, i) => (
              <div key={i} className={i >= 5 ? 'text-rose-900/70' : ''}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-stone-100 text-xs">
            {calendarDays.map((cell, idx) => {
              const dayApts = appointmentsByDate[cell.dateStr] || [];
              const isSelected = selectedDateStr === cell.dateStr;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedDateStr(cell.dateStr);
                    setFilterPeriod('selected');
                  }}
                  className={`min-h-[92px] sm:min-h-[110px] p-1.5 sm:p-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-stone-50/40 text-stone-300'
                  } ${
                    cell.isToday
                      ? 'ring-2 ring-inset ring-rose-400 bg-rose-50/20'
                      : ''
                  } ${
                    isSelected
                      ? 'bg-rose-50/60 ring-2 ring-inset ring-rose-900 z-10'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  {/* Day number & Quick add on hover */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-rose-900 text-white font-bold'
                          : isSelected
                          ? 'bg-rose-200 text-rose-950 font-bold'
                          : cell.isCurrentMonth
                          ? 'text-stone-800'
                          : 'text-stone-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Quick plus icon on hover for current month */}
                    {cell.isCurrentMonth && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenNewAppointmentModal(cell.dateStr);
                        }}
                        title={`Ajouter un créneau le ${cell.dateStr}`}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-stone-400 hover:text-rose-900 hover:bg-rose-100 transition-opacity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Day Appointment Chips */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {dayApts.slice(0, 2).map((apt) => (
                      <div
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditAppointment(apt);
                        }}
                        title={`${apt.startTime} - ${apt.clientName} (${apt.serviceTitle})`}
                        className={`px-1.5 py-0.5 rounded text-[10px] truncate flex items-center gap-1 border transition-transform hover:scale-[1.02] ${
                          apt.status === 'annule'
                            ? 'bg-stone-100 text-stone-400 border-stone-200 line-through'
                            : getTypeColor(apt.serviceType)
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getTypeDotColor(apt.serviceType)}`} />
                        <span className="font-semibold">{apt.startTime}</span>
                        <span className="truncate">{apt.clientName.split(' ')[0]}</span>
                      </div>
                    ))}

                    {dayApts.length > 2 && (
                      <div className="text-[9px] text-stone-500 font-medium px-1">
                        +{dayApts.length - 2} autre{dayApts.length - 2 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Dot indicator if appointments exist */}
                  {dayApts.length > 0 && (
                    <div className="flex gap-1 pt-0.5">
                      {dayApts.map((a, i) => (
                        <span
                          key={i}
                          className={`w-1 h-1 rounded-full ${getTypeDotColor(a.serviceType)}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendar footer legend */}
          <div className="p-3 bg-stone-50/80 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Soin Visage
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Soin Corps
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Diagnostic IA
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Cure / Suivi
              </span>
            </div>

            {selectedDateStr && (
              <button
                onClick={() => {
                  setSelectedDateStr(null);
                  setFilterPeriod('all');
                }}
                className="text-rose-900 font-semibold underline text-[11px] hover:text-rose-950 cursor-pointer"
              >
                Réinitialiser filtre date
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Timeline & Liste Récapitulative des Visites (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-800" />
                <h3 className="font-serif font-bold text-sm text-stone-900">
                  Récapitulatif des Visites ({filteredAppointments.length})
                </h3>
              </div>
              <button
                onClick={() => onOpenNewAppointmentModal(selectedDateStr || todayStr)}
                className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créneau</span>
              </button>
            </div>

            {/* Period Pills */}
            <div className="flex items-center gap-1 overflow-x-auto p-1 bg-stone-100 rounded-xl text-xs font-medium">
              <button
                onClick={() => {
                  setFilterPeriod('all');
                  setSelectedDateStr(null);
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  filterPeriod === 'all'
                    ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Toutes ({appointments.length})
              </button>
              <button
                onClick={() => setFilterPeriod('today')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  filterPeriod === 'today'
                    ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Aujourd'hui ({appointmentsToday.length})
              </button>
              <button
                onClick={() => setFilterPeriod('week')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  filterPeriod === 'week'
                    ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Cette semaine ({appointmentsThisWeek.length})
              </button>
              {selectedDateStr && (
                <button
                  onClick={() => setFilterPeriod('selected')}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    filterPeriod === 'selected'
                      ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Le {selectedDateStr}
                </button>
              )}
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Rechercher par cliente, soin ou cabine..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs placeholder:text-stone-400 focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            {/* Quick Status and Care Filter Dropdowns */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
              >
                <option value="all">Tous statuts</option>
                <option value="confirme">Confirmé</option>
                <option value="en_attente">En attente</option>
                <option value="termine">Effectué</option>
                <option value="annule">Annulé</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
              >
                <option value="all">Tous soins</option>
                <option value="visage">Visage</option>
                <option value="corps">Corps</option>
                <option value="diagnostic">Diagnostic IA</option>
                <option value="cure_suivi">Cure / Suivi</option>
                <option value="peeling">Peeling</option>
              </select>
            </div>
          </div>

          {/* Appointments List / Cards */}
          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt) => {
                const clientObj = clients.find(
                  (c) => c.id === apt.clientId || c.fullName.toLowerCase() === apt.clientName.toLowerCase()
                );

                return (
                  <div
                    key={apt.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 transition-all shadow-2xs space-y-3"
                  >
                    {/* Top Row: Date, Time & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-rose-800" />
                            {apt.startTime} - {apt.endTime}
                          </span>
                          <span className="text-[10px] text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded">
                            {apt.durationMinutes} min
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-600 block font-medium">
                          📅 {apt.date} {apt.date === todayStr ? "(Aujourd'hui)" : ''}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(apt.status)}
                        {apt.price && (
                          <span className="text-xs font-bold text-stone-800">
                            {apt.price} €
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cliente Info */}
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between gap-2">
                      <div className="space-y-0.5 truncate">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="font-semibold text-xs text-stone-900 truncate">
                            {apt.clientName}
                          </span>
                        </div>
                        {apt.clientPhone && (
                          <span className="text-[10px] text-stone-500 block truncate">
                            📞 {apt.clientPhone}
                          </span>
                        )}
                      </div>

                      {clientObj && (
                        <button
                          onClick={() => onSelectClientDossier(clientObj)}
                          title="Accéder au dossier client"
                          className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-900 border border-stone-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                        >
                          <span>Fiche</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Prestation Details */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getTypeColor(apt.serviceType)}`}>
                          {apt.serviceType}
                        </span>
                        <span className="font-bold text-stone-800">
                          {apt.serviceTitle}
                        </span>
                      </div>

                      {apt.cabin && (
                        <div className="flex items-center gap-1 text-[11px] text-stone-500">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{apt.cabin}</span>
                        </div>
                      )}

                      {apt.notes && (
                        <p className="text-[11px] text-stone-600 bg-amber-50/50 p-2 rounded-lg border border-amber-200/50 italic">
                          "{apt.notes}"
                        </p>
                      )}
                    </div>

                    {/* Quick Status Changer & Actions */}
                    <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        {apt.status !== 'confirme' && (
                          <button
                            onClick={() => handleStatusChange(apt, 'confirme')}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Confirmer
                          </button>
                        )}
                        {apt.status !== 'termine' && (
                          <button
                            onClick={() => handleStatusChange(apt, 'termine')}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Terminer
                          </button>
                        )}
                        {apt.status !== 'annule' && (
                          <button
                            onClick={() => handleStatusChange(apt, 'annule')}
                            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-[10px] font-medium transition-colors cursor-pointer"
                          >
                            Annuler
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onEditAppointment(apt)}
                          className="px-2 py-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Supprimer définitivement le créneau de ${apt.clientName} ?`)) {
                              onDeleteAppointment(apt.id);
                            }
                          }}
                          className="px-2 py-1 text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-400 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-stone-300" />
                <p className="font-medium text-stone-600">Aucun rendez-vous sur cette période.</p>
                <p className="text-[11px]">Cliquez sur "Nouveau Créneau" pour planifier une visite en cabine.</p>
                <button
                  onClick={() => onOpenNewAppointmentModal(selectedDateStr || todayStr)}
                  className="px-3 py-1.5 bg-rose-950 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 mt-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter un créneau</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
