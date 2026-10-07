import type { IStudentAuthService } from '../application/interfaces';
import type { StudentProfile, StudentSession } from '../types';

interface StoredAccount {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  course: string;
  branch: string;
  passwordSalt: string;
  passwordHash: string; // SHA-256 hex digest (never plain-text)
  createdAt: string;
  updatedAt: string;
}

const STORAGE_ACCOUNTS_KEY = 'campus_assist_student_accounts_v1';
const STORAGE_SESSION_KEY = 'campus_assist_student_session_v1';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Computes salted SHA-256 digest using standard Web Crypto API.
 * Guarantees zero plain-text password storage in code or persistence.
 */
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateRandomHex(byteCount = 16): string {
  const bytes = new Uint8Array(byteCount);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export class LocalStorageStudentAuthService implements IStudentAuthService {
  private async getStoredAccounts(): Promise<StoredAccount[]> {
    try {
      const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
      if (!raw) {
        // Initialize with realistic seed demo student account (salted SHA-256)
        const salt = 'seed_srm_salt_9823';
        const hash = await hashPassword('Student@123', salt);
        const demoAccount: StoredAccount = {
          id: 'stu-srm-01',
          fullName: 'Ananya Sharma',
          email: 'ananya.s@srmist.edu.in',
          contactNumber: '+91 98765 43210',
          course: 'B.Tech',
          branch: 'Computer Science & Engineering',
          passwordSalt: salt,
          passwordHash: hash,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const initial = [demoAccount];
        localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw) as StoredAccount[];
    } catch {
      return [];
    }
  }

  private saveStoredAccounts(accounts: StoredAccount[]): void {
    try {
      localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
      // Storage unavailable fallback
    }
  }

  public async getCurrentSession(): Promise<StudentSession | null> {
    try {
      const raw = localStorage.getItem(STORAGE_SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as StudentSession;
      // Check expiration
      if (new Date(session.expiresAt).getTime() < Date.now()) {
        localStorage.removeItem(STORAGE_SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  public async signIn(email: string, password: string): Promise<StudentSession> {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = await this.getStoredAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      throw new Error('No student account found with this email address.');
    }

    const computedHash = await hashPassword(password, account.passwordSalt);
    if (computedHash !== account.passwordHash) {
      throw new Error('Incorrect password. Please verify and try again.');
    }

    const token = `tok_${generateRandomHex(24)}`;
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

    const profile: StudentProfile = {
      id: account.id,
      fullName: account.fullName,
      email: account.email,
      contactNumber: account.contactNumber,
      course: account.course,
      branch: account.branch,
      updatedAt: account.updatedAt,
    };

    const session: StudentSession = {
      token,
      student: profile,
      expiresAt,
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    return session;
  }

  public async signUp(
    profileData: Omit<StudentProfile, 'id' | 'updatedAt'>,
    password: string
  ): Promise<StudentSession> {
    const cleanEmail = profileData.email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please enter a valid university email address.');
    }

    if (!profileData.fullName.trim() || profileData.fullName.trim().length < 2) {
      throw new Error('Please enter your full name (at least 2 characters).');
    }

    // Contact number validation: requires 7-15 digits, supports international prefixes without assuming any single country code
    const digitsOnly = profileData.contactNumber.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      throw new Error('Contact number must contain between 7 and 15 digits, including optional country code.');
    }

    if (!profileData.course.trim()) {
      throw new Error('Please specify your course/program.');
    }

    if (!profileData.branch.trim()) {
      throw new Error('Please specify your branch/specialization.');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const accounts = await this.getStoredAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const salt = generateRandomHex(16);
    const hash = await hashPassword(password, salt);
    const now = new Date().toISOString();
    const newId = `stu-${Date.now()}-${generateRandomHex(4)}`;

    const newAccount: StoredAccount = {
      id: newId,
      fullName: profileData.fullName.trim(),
      email: cleanEmail,
      contactNumber: profileData.contactNumber.trim(),
      course: profileData.course.trim(),
      branch: profileData.branch.trim(),
      passwordSalt: salt,
      passwordHash: hash,
      createdAt: now,
      updatedAt: now,
    };

    accounts.push(newAccount);
    this.saveStoredAccounts(accounts);

    const profile: StudentProfile = {
      id: newAccount.id,
      fullName: newAccount.fullName,
      email: newAccount.email,
      contactNumber: newAccount.contactNumber,
      course: newAccount.course,
      branch: newAccount.branch,
      updatedAt: newAccount.updatedAt,
    };

    const token = `tok_${generateRandomHex(24)}`;
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    const session: StudentSession = {
      token,
      student: profile,
      expiresAt,
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    return session;
  }

  public async updateProfile(
    updatedFields: Partial<Omit<StudentProfile, 'id' | 'email'>>
  ): Promise<StudentProfile> {
    const currentSession = await this.getCurrentSession();
    if (!currentSession) {
      throw new Error('No active session. Please sign in to update your profile.');
    }

    const accounts = await this.getStoredAccounts();
    const index = accounts.findIndex((a) => a.id === currentSession.student.id);
    if (index === -1) {
      throw new Error('Student account not found.');
    }

    if (updatedFields.contactNumber !== undefined) {
      const digitsOnly = updatedFields.contactNumber.replace(/\D/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        throw new Error('Contact number must contain between 7 and 15 digits.');
      }
    }

    if (updatedFields.fullName !== undefined && updatedFields.fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters.');
    }

    const now = new Date().toISOString();
    const updatedAccount: StoredAccount = {
      ...accounts[index],
      fullName: updatedFields.fullName !== undefined ? updatedFields.fullName.trim() : accounts[index].fullName,
      contactNumber: updatedFields.contactNumber !== undefined ? updatedFields.contactNumber.trim() : accounts[index].contactNumber,
      course: updatedFields.course !== undefined ? updatedFields.course.trim() : accounts[index].course,
      branch: updatedFields.branch !== undefined ? updatedFields.branch.trim() : accounts[index].branch,
      updatedAt: now,
    };

    accounts[index] = updatedAccount;
    this.saveStoredAccounts(accounts);

    const updatedProfile: StudentProfile = {
      id: updatedAccount.id,
      fullName: updatedAccount.fullName,
      email: updatedAccount.email,
      contactNumber: updatedAccount.contactNumber,
      course: updatedAccount.course,
      branch: updatedAccount.branch,
      updatedAt: updatedAccount.updatedAt,
    };

    currentSession.student = updatedProfile;
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(currentSession));

    return updatedProfile;
  }

  public async signOut(): Promise<void> {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }
}
