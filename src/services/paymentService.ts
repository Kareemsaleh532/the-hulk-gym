import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import type { Payment } from '../types';

export const paymentService = {
  subscribeToPayments(callback: (payments: Payment[], error?: Error) => void): () => void {
    const q = query(collection(db, 'payments'), orderBy('created_at', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const paymentsList: Payment[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        paymentsList.push({
          id: docSnap.id,
          memberId: data.member_id,
          memberName: data.member_name || 'غير معروف',
          amount: data.amount,
          date: data.payment_date,
          method: data.payment_method,
          status: data.payment_status,
        });
      });
      callback(paymentsList);
    }, (error) => {
      callback([], error);
    });
  },

  async createPayment(payment: Omit<Payment, 'id' | 'date' | 'memberName'>): Promise<void> {
    const paymentId = crypto.randomUUID();
    const now = new Date().toISOString();
    const paymentRef = doc(db, 'payments', paymentId);
    
    const memberDoc = await getDoc(doc(db, 'members', payment.memberId));
    const memberData = memberDoc.data();
    const memberName = memberData?.full_name || 'غير معروف';
    
    await setDoc(paymentRef, {
      member_id: payment.memberId,
      member_name: memberName,
      amount: Number(payment.amount),
      payment_method: payment.method,
      payment_date: now.split('T')[0],
      payment_status: payment.status,
      created_at: now,
    });

    // If payment is paid, create a transaction record
    if (payment.status === 'paid') {
      const currentAdminStr = localStorage.getItem('hulk_v2_admin');
      const operator = currentAdminStr ? JSON.parse(currentAdminStr).name : 'System';
      const txId = `tx-${crypto.randomUUID().slice(0, 8)}`;
      const txRef = doc(db, 'transactions', txId);
      
      await setDoc(txRef, {
        type: 'income',
        category: 'membership',
        amount: Number(payment.amount),
        date: now.split('T')[0],
        description: `دفعة مستلمة: ${memberName}`,
        reference_id: paymentId,
        created_by: operator,
        created_at: now,
      });
    }
  },

  async updatePaymentStatus(id: string, status: Payment['status']): Promise<void> {
    const paymentRef = doc(db, 'payments', id);
    const paymentSnap = await getDoc(paymentRef);
    const paymentData = paymentSnap.data();
    
    await updateDoc(paymentRef, {
      payment_status: status
    });

    // If changing to 'paid', add a transaction
    if (status === 'paid' && paymentData && paymentData.payment_status !== 'paid') {
      const currentAdminStr = localStorage.getItem('hulk_v2_admin');
      const operator = currentAdminStr ? JSON.parse(currentAdminStr).name : 'System';
      const txId = `tx-${crypto.randomUUID().slice(0, 8)}`;
      const txRef = doc(db, 'transactions', txId);
      
      await setDoc(txRef, {
        type: 'income',
        category: 'membership',
        amount: Number(paymentData.amount),
        date: new Date().toISOString().split('T')[0],
        description: `تحديث دفعة إلى مدفوعة: ${paymentData.member_name || 'غير معروف'}`,
        reference_id: id,
        created_by: operator,
        created_at: new Date().toISOString(),
      });
    }
  },

  async deletePayment(id: string): Promise<void> {
    const paymentRef = doc(db, 'payments', id);
    await deleteDoc(paymentRef);
  },
};
