import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, query, orderBy, onSnapshot, getDocs, where, getCountFromServer } from 'firebase/firestore';
import type { Coach } from '../types';

export const coachService = {
  async getCoaches(): Promise<Coach[]> {
    const q = query(collection(db, 'coaches'), orderBy('created_at', 'asc'));
    const snapshot = await getDocs(q);
    const coachesList: Coach[] = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const membersQuery = query(collection(db, 'members'), where('coach_id', '==', docSnap.id));
      const snapshotCount = await getCountFromServer(membersQuery);
      const assignedMembersCount = snapshotCount.data().count;
      coachesList.push({
        id: docSnap.id,
        name: data.name,
        phone: data.phone,
        specialty: data.specialty,
        avatar: data.avatar,
        gender: data.gender || undefined,
        assignedMembersCount: assignedMembersCount,
      });
    }
    return coachesList;
  },

  subscribeToCoaches(callback: (coaches: Coach[], error?: Error) => void): () => void {
    const q = query(collection(db, 'coaches'), orderBy('created_at', 'asc'));
    
    return onSnapshot(q, async (snapshot) => {
      try {
        const coachesList: Coach[] = [];
        
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          
          // Compute assigned members for each coach using Firestore aggregate query
          const membersQuery = query(collection(db, 'members'), where('coach_id', '==', docSnap.id));
          const snapshotCount = await getCountFromServer(membersQuery);
          const assignedMembersCount = snapshotCount.data().count;

          coachesList.push({
            id: docSnap.id,
            name: data.name,
            phone: data.phone,
            specialty: data.specialty,
            avatar: data.avatar,
            gender: data.gender || undefined,
            assignedMembersCount: assignedMembersCount,
          });
        }
        
        callback(coachesList);
      } catch (err) {
        callback([], err instanceof Error ? err : new Error('Unknown error in coach subscription'));
      }
    }, (error) => {
      callback([], error);
    });
  },

  async createCoach(coach: Omit<Coach, 'id' | 'assignedMembersCount'>): Promise<void> {
    const coachId = crypto.randomUUID();
    const coachRef = doc(db, 'coaches', coachId);
    
    await setDoc(coachRef, {
      name: coach.name,
      phone: coach.phone,
      specialty: coach.specialty,
      avatar: coach.avatar,
      gender: coach.gender || undefined,
      created_at: new Date().toISOString(),
    });
  },

  async updateCoach(id: string, coach: Partial<Omit<Coach, 'id' | 'assignedMembersCount'>>): Promise<void> {
    const coachRef = doc(db, 'coaches', id);
    await updateDoc(coachRef, {
      ...coach,
    });
  },

  async deleteCoach(id: string): Promise<void> {
    const coachRef = doc(db, 'coaches', id);
    await deleteDoc(coachRef);
  },
};
