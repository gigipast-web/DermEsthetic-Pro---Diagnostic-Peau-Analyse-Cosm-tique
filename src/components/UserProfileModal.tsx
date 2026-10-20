import React, { useState } from 'react';
import {
  X,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Award,
  LogOut,
  UserPlus,
  Save,
  CheckCircle2,
  Download,
  Trash2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { PractitionerUser, ClientProfile, DiagnosticReport } from '../types';
import {
  updateUserProfile,
  getRegisteredUsers,
  loginUser,
  ESTHETICIAN_ROLES,
} from '../services/authService';

interface Props {
  currentUser: PractitionerUser;
  clients: ClientProfile[];
  diagnostics: DiagnosticReport[];
  onClose: () => void;
  onUserUpdated: (user: PractitionerUser) => void;
  onLogout: () => void;
  onSwitchAccount: (user: PractitionerUser) => void;
  onOpenNewAccountModal: () => void;
}

export const UserProfileModal: React.FC<Props> = ({
  currentUser,
  clients,
  diagnostics,
  onClose,
  onUserUpdated,
  onLogout,
  onSwitchAccount,
  onOpenNewAccountModal,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'backup'>('profile');
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [instituteName, setInstituteName] = useState(currentUser.instituteName);
  const [role, setRole] = useState(currentUser.role);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [city, setCity] = useState(currentUser.city || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const registeredUsers = getRegisteredUsers();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PractitionerUser = {
      ...currentUser,
      fullName: fullName.trim(),
      instituteName: instituteName.trim(),
      role: role.trim(),
      phone: phone.trim(),
      city: city.trim(),
    };
    updateUserProfile(updated);
    onUserUpdated(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const backupData = {
      app: 'DermEsthetic Pro',
      exportDate: new Date().toISOString(),
      practitioner: currentUser,
      clientsCount: clients.length,
      diagnosticsCount: diagnostics.length,
      clients,
      diagnostics,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dermesthetic-sauvegarde-${currentUser.instituteName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg text-rose-200 shadow-inner">
              {currentUser.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg text-white">
                  {currentUser.fullName}
                </h2>
                {currentUser.isDemo && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                    Mode Démo
                  </span>
                )}
              </div>
              <p className="text-xs text-rose-200/90 font-medium">
                {currentUser.instituteName} · {currentUser.role}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-rose-900 text-rose-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Mon Profil & Institut
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'team'
                ? 'border-rose-900 text-rose-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Praticiennes & Comptes ({registeredUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'backup'
                ? 'border-rose-900 text-rose-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Sauvegarde & Export RGPD
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {savedSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Vos modifications ont été enregistrées avec succès.</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Nom & Prénom de la praticienne
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-rose-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Nom de l'Institut / Cabinet
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={instituteName}
                      onChange={(e) => setInstituteName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-rose-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Rôle & Qualification (apparaît sur les ordonnances imprimées)
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Ex: Esthéticienne D.E. & Cornéothérapeute"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-rose-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Téléphone de contact
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 XX XX XX XX"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-rose-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Ville d'exercice
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: Bordeaux"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-rose-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Email de connexion (non modifiable)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full pl-9 pr-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-4 py-2 text-rose-800 hover:text-rose-950 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se déconnecter de ce compte</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-950 hover:bg-rose-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                    Praticiennes enregistrées sur cet appareil
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Basculez facilement entre les esthéticiennes du salon sans perdre vos données.
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenNewAccountModal();
                  }}
                  className="px-3 py-1.5 bg-rose-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-rose-900 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Inscrire une nouvelle praticienne</span>
                </button>
              </div>

              <div className="space-y-2">
                {registeredUsers.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  return (
                    <div
                      key={user.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200'
                          : 'bg-stone-50 hover:bg-stone-100/80 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-950 text-rose-100 font-bold text-xs flex items-center justify-center">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-900">
                              {user.fullName}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-rose-800 bg-white border border-rose-200 px-2 py-0.2 rounded-full">
                                Actif
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {user.instituteName} · {user.role}
                          </div>
                        </div>
                      </div>

                      {!isCurrent && (
                        <button
                          onClick={() => onSwitchAccount(user)}
                          className="px-3 py-1.5 bg-white hover:bg-rose-900 hover:text-white border border-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
                        >
                          Basculer sur ce compte
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Souveraineté des Données & Secret d'Institut (RGPD)</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Toutes vos fiches clientes, diagnostics cutanés et notes d'observations sont stockées localement dans votre navigateur. Aucune donnée personnelle de vos clientes n'est vendue ou partagée avec des tiers.
                </p>
              </div>

              <div className="border border-stone-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">Nombre de fiches clientes actives :</span>
                  <strong className="text-stone-900 font-bold">{clients.length}</strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">Nombre de diagnostics cutanés archivés :</span>
                  <strong className="text-stone-900 font-bold">{diagnostics.length}</strong>
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleExportBackup}
                    className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4 text-rose-300" />
                    <span>Télécharger la Sauvegarde Complète de l'Institut (.JSON)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
