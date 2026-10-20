import { PractitionerUser } from '../types';

const STORAGE_USERS_KEY = 'dermesthetic_practitioners_v1';
const STORAGE_CURRENT_USER_KEY = 'dermesthetic_current_user_v1';

export const DEMO_PRACTITIONER: PractitionerUser = {
  id: 'user-demo-clara',
  fullName: 'Clara Valmont',
  email: 'clara.valmont@institut-rosepoudree.fr',
  role: 'Esthéticienne D.E. & Cornéothérapeute',
  instituteName: 'Institut Rose Poudrée & Spa',
  phone: '06 12 34 56 78',
  address: '14 rue de la Beauté',
  city: 'Bordeaux',
  certifications: [
    'BTS Métiers de l’Esthétique',
    'Certification Cornéothérapie & Analyse Barrière Cutanée',
    'Spécialisation Soins Haute Fréquence & LED',
  ],
  avatarColor: 'bg-rose-900',
  registeredAt: '2026-01-15T09:00:00Z',
  lastLoginAt: new Date().toISOString(),
  isDemo: true,
};

export const ESTHETICIAN_ROLES = [
  'Esthéticienne Diplômée d’État (CAP/BP/BTS)',
  'Cornéothérapeute & Dermo-Analyste',
  'Gérante d’Institut de Beauté',
  'Spa Thérapeute & Praticienne Bien-Être',
  'Dermo-Cosmétologue & Formulatrice',
  'Praticienne Anti-Âge & Technologies Cutanées',
  'Esthéticienne à Domicile / Indépendante',
  'Étudiante / Stagiaire en Esthétique',
];

export function getRegisteredUsers(): PractitionerUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      // Initialize with demo practitioner
      const initial = [DEMO_PRACTITIONER];
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEMO_PRACTITIONER];
  } catch (e) {
    console.error('Error reading registered users from storage:', e);
    return [DEMO_PRACTITIONER];
  }
}

export function getCurrentUser(): PractitionerUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PractitionerUser;
  } catch (e) {
    console.error('Error reading current user from storage:', e);
    return null;
  }
}

export function registerUser(params: {
  fullName: string;
  email: string;
  password: string;
  role: string;
  instituteName: string;
  phone?: string;
  city?: string;
}): { success: boolean; user?: PractitionerUser; error?: string } {
  const normalizedEmail = params.email.trim().toLowerCase();

  if (!params.fullName.trim()) {
    return { success: false, error: 'Veuillez saisir votre nom et prénom.' };
  }
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { success: false, error: 'Veuillez saisir une adresse email professionnelle valide.' };
  }
  if (!params.password || params.password.length < 5) {
    return { success: false, error: 'Le mot de passe doit comporter au moins 5 caractères.' };
  }
  if (!params.instituteName.trim()) {
    return { success: false, error: 'Veuillez renseigner le nom de votre institut ou cabinet.' };
  }

  const users = getRegisteredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (existing) {
    return {
      success: false,
      error: 'Un compte avec cet email existe déjà. Veuillez vous connecter ou utiliser un autre email.',
    };
  }

  const colors = ['bg-rose-900', 'bg-stone-900', 'bg-amber-900', 'bg-emerald-950', 'bg-indigo-950'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const newUser: PractitionerUser = {
    id: 'user-' + Date.now(),
    fullName: params.fullName.trim(),
    email: normalizedEmail,
    password: params.password, // In client storage
    role: params.role || 'Esthéticienne Diplômée d’État',
    instituteName: params.instituteName.trim(),
    phone: params.phone?.trim() || '',
    city: params.city?.trim() || '',
    certifications: ['Praticienne Certifiée DermEsthetic'],
    avatarColor: randomColor,
    registeredAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    isDemo: false,
  };

  const updatedList = [newUser, ...users];
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updatedList));
  localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));

  return { success: true, user: newUser };
}

export function loginUser(
  email: string,
  password?: string
): { success: boolean; user?: PractitionerUser; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers();

  const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!found) {
    return {
      success: false,
      error: 'Aucun compte trouvé avec cet email. Veuillez vérifier votre saisie ou créer un compte.',
    };
  }

  // If user has a password set and password was provided, verify it (demo account bypasses)
  if (found.password && password && found.password !== password && !found.isDemo) {
    return {
      success: false,
      error: 'Mot de passe incorrect. Veuillez réessayer.',
    };
  }

  const updatedUser: PractitionerUser = {
    ...found,
    lastLoginAt: new Date().toISOString(),
  };

  // Update in array
  const updatedList = users.map((u) => (u.id === found.id ? updatedUser : u));
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updatedList));
  localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updatedUser));

  return { success: true, user: updatedUser };
}

export function loginAsDemo(): PractitionerUser {
  const users = getRegisteredUsers();
  const demoFound = users.find((u) => u.isDemo || u.email === DEMO_PRACTITIONER.email) || DEMO_PRACTITIONER;
  const updatedUser: PractitionerUser = {
    ...demoFound,
    lastLoginAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
}

export function logoutUser(): void {
  localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
}

export function updateUserProfile(user: PractitionerUser): void {
  const users = getRegisteredUsers();
  const updatedList = users.map((u) => (u.id === user.id ? user : u));
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updatedList));
  localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
}

export function deleteUserAccount(userId: string): void {
  const users = getRegisteredUsers().filter((u) => u.id !== userId);
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  const current = getCurrentUser();
  if (current?.id === userId) {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  }
}
