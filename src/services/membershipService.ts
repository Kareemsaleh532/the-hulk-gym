import { db } from '../lib/firebase';
import { collection, doc, getDocs, getDoc, query, where, writeBatch, orderBy } from 'firebase/firestore';
import type { DbMembership } from '../types';
import { planService } from './planService';

export const membershipService = {
  async getMemberships(): Promise<DbMembership[]> {
    const q = query(collection(db, 'memberships'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        member_id: data.member_id,
        plan_name: data.plan_name,
        start_date: data.start_date,
        end_date: data.end_date,
        price: data.price,
        status: data.status,
        created_at: data.created_at,
      };
    });
  },

  async renewMembership(
    memberId: string,
    planId: string,
    customStartDate?: string,
    paymentInfo?: { method: string; status: string }
  ): Promise<void> {
    const plans = await planService.getPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) throw new Error('Plan not found');

    const baseDate = customStartDate ? new Date(customStartDate) : new Date();
    const startDate = baseDate.toISOString().split('T')[0];

    const end = new Date(baseDate);
    end.setMonth(end.getMonth() + plan.durationMonths);
    const endDate = end.toISOString().split('T')[0];

    const now = new Date().toISOString();
    const currentAdminStr = localStorage.getItem('hulk_v2_admin');
    const operator = currentAdminStr ? JSON.parse(currentAdminStr).name : 'System';

    // Mark existing active memberships as expired
    const membershipsRef = collection(db, 'memberships');
    const activeQuery = query(membershipsRef, where('member_id', '==', memberId));
    const activeSnapshot = await getDocs(activeQuery);

    const batch = writeBatch(db);

    activeSnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.status === 'active' || data.status === 'expiring') {
        batch.update(docSnap.ref, { status: 'expired' });
      }
    });

    // Insert new membership
    const membershipId = crypto.randomUUID();
    const newMembershipRef = doc(db, 'memberships', membershipId);
    batch.set(newMembershipRef, {
      member_id: memberId,
      plan_name: planId,
      start_date: startDate,
      end_date: endDate,
      price: plan.price,
      status: 'active',
      created_at: now,
    });

    // Update member's own status, dates, and plan ID directly in the members collection
    const memberRef = doc(db, 'members', memberId);
    batch.update(memberRef, {
      status: 'active',
      active_plan_id: planId,
      start_date: startDate,
      end_date: endDate,
    });

    // Insert payment record
    if (paymentInfo) {
      const memberDoc = await getDoc(memberRef);
      const memberData = memberDoc.data();
      const memberName = memberData?.full_name || 'عضو';

      const paymentId = crypto.randomUUID();
      const paymentRef = doc(db, 'payments', paymentId);
      batch.set(paymentRef, {
        member_id: memberId,
        member_name: memberName,
        amount: plan.price,
        payment_method: paymentInfo.method,
        payment_date: startDate,
        payment_status: paymentInfo.status,
        notes: `Membership renewal - ${plan.name}`,
        created_at: now,
      });

      if (paymentInfo.status === 'paid') {
        const txId = `tx-${crypto.randomUUID().slice(0, 8)}`;
        const txRef = doc(db, 'transactions', txId);
        batch.set(txRef, {
          type: 'income',
          category: 'membership',
          amount: plan.price,
          date: startDate,
          description: `تجديد اشتراك: ${memberName} (${plan.name})`,
          reference_id: paymentId,
          created_by: operator,
          created_at: now,
        });
      }
    }

    await batch.commit();
  },
};
