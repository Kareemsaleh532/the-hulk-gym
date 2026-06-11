import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Plan } from '../types';

export const planService = {
  async getPlans(): Promise<Plan[]> {
    const q = query(collection(db, 'plans'), orderBy('created_at', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        durationMonths: data.duration_months,
        price: data.price,
        features: typeof data.features === 'string' ? JSON.parse(data.features) : (data.features || []),
      };
    });
  },

  async createPlan(plan: Omit<Plan, 'id'>): Promise<Plan> {
    const id = `plan-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const planRef = doc(db, 'plans', id);
    
    await setDoc(planRef, {
      name: plan.name,
      duration_months: plan.durationMonths,
      price: plan.price,
      features: plan.features,
      created_at: now,
    });
    
    return { ...plan, id };
  },

  async updatePlan(id: string, plan: Partial<Plan>): Promise<void> {
    const planRef = doc(db, 'plans', id);
    const updateData: any = {};
    if (plan.name !== undefined) updateData.name = plan.name;
    if (plan.durationMonths !== undefined) updateData.duration_months = plan.durationMonths;
    if (plan.price !== undefined) updateData.price = plan.price;
    if (plan.features !== undefined) updateData.features = plan.features;
    
    await updateDoc(planRef, updateData);
  },

  async deletePlan(id: string): Promise<void> {
    const planRef = doc(db, 'plans', id);
    await deleteDoc(planRef);
  },
};
