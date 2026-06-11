import { db } from '../lib/firebase';
import { collection, doc, updateDoc, deleteDoc, writeBatch, query, orderBy, onSnapshot } from 'firebase/firestore';
import type { Member, MemberStatus, Payment } from '../types';
import { planService } from './planService';

export const memberService = {
  subscribeToMembers(callback: (members: Member[], error?: Error) => void): () => void {
    const q = query(collection(db, 'members'), orderBy('created_at', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(today.getDate() + 7);

      const membersList: Member[] = [];
      const batch = writeBatch(db);
      let needsUpdate = false;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let status = data.status as MemberStatus;
        
        // Auto-update status based on dates if needed
        if (status === 'active' || status === 'expiring') {
          const endDate = new Date(data.end_date);
          if (endDate < today) {
            status = 'expired';
            batch.update(docSnap.ref, { status: 'expired' });
            needsUpdate = true;
          } else if (endDate <= sevenDaysLater && status !== 'expiring') {
            status = 'expiring';
            batch.update(docSnap.ref, { status: 'expiring' });
            needsUpdate = true;
          }
        }

        membersList.push({
          id: docSnap.id,
          name: data.full_name || '',
          phone: data.phone || '',
          gender: data.gender || 'Male',
          dob: data.birth_date || '',
          planId: data.active_plan_id || '',
          startDate: data.start_date || '',
          endDate: data.end_date || '',
          status: status,
          notes: data.notes || '',
          coachId: data.coach_id || '',
        });
      });

      if (needsUpdate) {
        batch.commit().catch(console.error);
      }

      callback(membersList);
    }, (error) => {
      callback([], error);
    });

    return unsubscribe;
  },

  async createMember(
    member: Omit<Member, 'id' | 'status' | 'endDate'>,
    paymentInfo?: { method: Payment['method']; status: Payment['status'] }
  ): Promise<void> {
    const memberId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // In a real app, you get this from Firebase Auth Context, but we use localStorage for quick access here
    const currentAdminStr = localStorage.getItem('hulk_v2_admin');
    const operator = currentAdminStr ? JSON.parse(currentAdminStr).name : 'System';

    const plans = await planService.getPlans();
    const plan = plans.find((p) => p.id === member.planId);
    const durationMonths = plan ? plan.durationMonths : 1;
    const price = plan ? plan.price : 0;

    const start = new Date(member.startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + durationMonths);
    const endDate = end.toISOString().split('T')[0];

    const batch = writeBatch(db);

    // 1. Insert member
    const memberRef = doc(db, 'members', memberId);
    batch.set(memberRef, {
      full_name: member.name,
      phone: member.phone,
      gender: member.gender,
      birth_date: member.dob,
      notes: member.notes || '',
      coach_id: member.coachId || '',
      active_plan_id: member.planId,
      start_date: member.startDate,
      end_date: endDate,
      status: 'active',
      created_at: now,
    });

    // 2. Insert membership history record
    const membershipRef = doc(db, 'memberships_history', crypto.randomUUID());
    batch.set(membershipRef, {
      member_id: memberId,
      plan_name: member.planId,
      start_date: member.startDate,
      end_date: endDate,
      price,
      created_at: now,
    });

    // 3. Insert payment & transaction (optional)
    if (paymentInfo) {
      const paymentId = crypto.randomUUID();
      const paymentRef = doc(db, 'payments', paymentId);
      batch.set(paymentRef, {
        member_id: memberId,
        member_name: member.name,
        amount: price,
        payment_method: paymentInfo.method,
        payment_date: member.startDate,
        payment_status: paymentInfo.status,
        notes: 'First subscription payment',
        created_at: now,
      });

      if (paymentInfo.status === 'paid') {
        const txRef = doc(db, 'transactions', `tx-${crypto.randomUUID().slice(0, 8)}`);
        batch.set(txRef, {
          type: 'income',
          category: 'membership',
          amount: price,
          date: member.startDate,
          description: `تسجيل عضوية جديدة: ${member.name} (${plan?.name || ''})`,
          reference_id: paymentId,
          created_by: operator,
          created_at: now,
        });
      }
    }

    await batch.commit();
  },

  async updateMember(id: string, member: Partial<Member>): Promise<void> {
    const updateData: any = {};

    if (member.name !== undefined) updateData.full_name = member.name;
    if (member.phone !== undefined) updateData.phone = member.phone;
    if (member.gender !== undefined) updateData.gender = member.gender;
    if (member.dob !== undefined) updateData.birth_date = member.dob;
    if (member.notes !== undefined) updateData.notes = member.notes;
    if (member.coachId !== undefined) updateData.coach_id = member.coachId;

    if (Object.keys(updateData).length > 0) {
      const memberRef = doc(db, 'members', id);
      await updateDoc(memberRef, updateData);
    }
  },

  async deleteMember(id: string): Promise<void> {
    const memberRef = doc(db, 'members', id);
    await deleteDoc(memberRef);
    // Note: To truly cascade delete payments and transactions in Firestore, 
    // we would need to query them first and delete them in a batch. 
    // For simplicity in this migration, we just delete the member document.
  },
};
