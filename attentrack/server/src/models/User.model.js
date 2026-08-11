import bcrypt from 'bcryptjs';
import { rtdb } from '../config/db.js';
import { generateId } from '../utils/generateId.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const isValidEmail = (email) => {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  if (normalized.length > 254) return false;
  return EMAIL_REGEX.test(normalized);
};

const refGet = async (path) => {
  const snap = await rtdb.ref(path).get();
  return snap.exists() ? snap.val() : null;
};

const listGet = async (path) => {
  const snap = await rtdb.ref(path).get();
  if (!snap.exists()) return [];
  const val = snap.val();
  return Object.values(val);
};

export const UserModel = {
  findByEmail: async (email) => {
    if (!isValidEmail(email)) return null;
    const normalized = normalizeEmail(email);
    const users = await listGet('users');
    return users.find((u) => u.email === normalized) || null;
  },

  findById: async (id) => {
    const users = await listGet('users');
    return users.find((u) => String(u.id) === String(id)) || null;
  },

  create: async ({ name, email, password, role = 'employee', department = 'General', avatar }) => {
    if (!isValidEmail(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
    const normalizedEmail = normalizeEmail(email);

    const trimmedName = String(name || '').trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      throw new Error('Name must be between 2 and 100 characters long');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const existing = await UserModel.findByEmail(normalizedEmail);
    if (existing) {
      throw new Error(`User with email ${normalizedEmail} already exists`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = generateId();
    const newUser = {
      id,
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'employee',
      department: department || 'General',
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trimmedName)}`,
      createdAt: new Date().toISOString()
    };
    await rtdb.ref(`users/${id}`).set(newUser);
    return newUser;
  },

  matchPassword: async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  },

  updatePassword: async (userId, newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }
    const snap = await rtdb.ref('users').get();
    if (!snap.exists()) return false;
    
    const data = snap.val();
    let fbKey = null;
    for (const key in data) {
      if (String(data[key].id) === String(userId)) {
        fbKey = key;
        break;
      }
    }
    
    if (!fbKey) return false;

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    await rtdb.ref(`users/${fbKey}`).update({ password: hashed, mustChangePassword: false });
    return true;
  }
};
