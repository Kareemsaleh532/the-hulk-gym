import { supabase } from '../lib/supabase';
import type { DbMembership } from '../types/supabase';
import { INITIAL_PLANS } from '../mockData';

export const membershipService = {
  async getMemberships(): Promise<DbMembership[]> {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async renewMembership(
    memberId: string, 
    planId: string, 
    customStartDate?: string, 
    paymentInfo?: { method: string, status: string }
  ): Promise<void> {
    const plan = INITIAL_PLANS.find(p => p.id === planId);
    if (!plan) throw new Error('Plan not found');

    const today = new Date();
    // In a real app we'd fetch the latest membership endDate to determine the baseDate.
    // For simplicity we just use customStartDate or today.
    const baseDate = customStartDate ? new Date(customStartDate) : today;
    const startDate = baseDate.toISOString().split('T')[0];

    const end = new Date(baseDate);
    end.setMonth(end.getMonth() + plan.durationMonths);
    const endDate = end.toISOString().split('T')[0];

    // Mark other memberships for this member as expired or just rely on newest being active
    // We update the current active membership to expired first
    await supabase
      .from('memberships')
      .update({ status: 'expired' })
      .eq('member_id', memberId)
      .eq('status', 'active');

    // 1. Insert new membership
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        id: crypto.randomUUID(),
        member_id: memberId,
        plan_name: planId,
        start_date: startDate,
        end_date: endDate,
        price: plan.price,
        status: 'active'
      });
      
    if (membershipError) throw membershipError;

    // 2. Insert payment
    if (paymentInfo) {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          id: crypto.randomUUID(),
          member_id: memberId,
          amount: plan.price,
          payment_method: paymentInfo.method,
          payment_date: startDate,
          notes: `Membership renewal payment - ${paymentInfo.status}`
        });
        
      if (paymentError) throw paymentError;
    }
  }
};
