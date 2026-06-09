import { supabase } from '../lib/supabase';
import type { Payment } from '../types';

export const paymentService = {
  async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        members ( full_name )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map((row: any) => ({
      id: row.id,
      memberId: row.member_id,
      memberName: row.members?.full_name || 'Unknown',
      amount: row.amount,
      date: row.payment_date,
      method: row.payment_method,
      status: (row.payment_status || 'paid') as Payment['status'],
    }));
  },

  async createPayment(paymentData: Omit<Payment, 'id' | 'date' | 'memberName'>): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .insert({
        id: crypto.randomUUID(),
        member_id: paymentData.memberId,
        amount: paymentData.amount,
        payment_method: paymentData.method,
        payment_date: new Date().toISOString().split('T')[0],
        payment_status: paymentData.status,
        notes: '',
      });

    if (error) throw error;
  }
};
