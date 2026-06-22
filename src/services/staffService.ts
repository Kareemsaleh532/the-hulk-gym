import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query, where, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import type { StaffGender } from '../types';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'staff';
  gender?: StaffGender;
  created_at: string;
}

export const staffService = {
  async getStaff(): Promise<StaffMember[]> {
    const q = query(collection(db, 'staff'), orderBy('created_at', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        gender: data.gender || undefined,
        created_at: data.created_at,
      };
    });
  },

  async createStaff(member: Omit<StaffMember, 'id' | 'created_at'>): Promise<StaffMember> {
    // Check email uniqueness
    const q = query(collection(db, 'staff'), where('email', '==', member.email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) throw new Error('البريد الإلكتروني مستخدم بالفعل');

    const id = `staff-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const staffRef = doc(db, 'staff', id);
    const newStaff: StaffMember = { ...member, id, created_at: now };
    
    await setDoc(staffRef, {
      name: member.name,
      email: member.email,
      password: member.password,
      role: member.role,
      gender: member.gender || undefined,
      created_at: now,
    });
    
    return newStaff;
  },

  async updateStaff(id: string, data: Partial<Omit<StaffMember, 'id' | 'created_at'>>): Promise<void> {
    if (data.email) {
      const q = query(collection(db, 'staff'), where('email', '==', data.email));
      const snapshot = await getDocs(q);
      const existing = snapshot.docs.find(d => d.id !== id);
      if (existing) throw new Error('البريد الإلكتروني مستخدم بالفعل');
    }
    const staffRef = doc(db, 'staff', id);
    await updateDoc(staffRef, { ...data });
  },

  async deleteStaff(id: string): Promise<void> {
    const allStaff = await this.getStaff();
    const admins = allStaff.filter(s => s.role === 'admin');
    const target = allStaff.find(s => s.id === id);
    if (target?.role === 'admin' && admins.length <= 1) {
      throw new Error('لا يمكن حذف آخر مسؤول في النظام');
    }
    const staffRef = doc(db, 'staff', id);
    await deleteDoc(staffRef);
  },

  async validateLogin(email: string, password: string): Promise<StaffMember | null> {
    const q = query(collection(db, 'staff'), where('email', '==', email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    if (data.password !== password) return null;
    return {
      id: docSnap.id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      gender: data.gender || undefined,
      created_at: data.created_at,
    };
  },
};
