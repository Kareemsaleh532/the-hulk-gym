import { supabase } from '../lib/supabase';
import type { Member, MemberStatus, Payment } from '../types';
import { INITIAL_PLANS } from '../mockData';

export const memberService = {
  async getMembers(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        memberships (
          plan_name,
          start_date,
          end_date,
          status
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return (data || []).map(row => {
      // Find active membership or just the most recent one
      const memberships = Array.isArray(row.memberships) ? row.memberships : [];
      const activeMembership = memberships.find((m: any) => m.status === 'active') || memberships[0] || null;
      
      return {
        id: row.id,
        name: row.full_name,
        phone: row.phone || '',
        gender: row.gender as any,
        dob: row.birth_date || '',
        planId: activeMembership?.plan_name || '', // using plan_name as id for backwards compatibility
        startDate: activeMembership?.start_date || '',
        endDate: activeMembership?.end_date || '',
        status: (activeMembership?.status || 'expired') as MemberStatus,
        notes: row.notes || '',
      };
    });
  },

  async createMember(
    member: Omit<Member, 'id' | 'status' | 'endDate'>, 
    paymentInfo?: { method: Payment['method'], status: Payment['status'] }
  ): Promise<void> {
    const memberId = crypto.randomUUID();
    
    // Find plan details from constants
    const plan = INITIAL_PLANS.find(p => p.id === member.planId);
    const durationMonths = plan ? plan.durationMonths : 1;
    const price = plan ? plan.price : 0;

    const start = new Date(member.startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + durationMonths);
    const endDate = end.toISOString().split('T')[0];
    
    // 1. Insert member
    const { error: memberError } = await supabase
      .from('members')
      .insert({
        id: memberId,
        full_name: member.name,
        phone: member.phone,
        gender: member.gender,
        birth_date: member.dob,
        notes: member.notes
      });
      
    if (memberError) throw memberError;

    // 2. Insert membership
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        id: crypto.randomUUID(),
        member_id: memberId,
        plan_name: member.planId,
        start_date: member.startDate,
        end_date: endDate,
        price: price,
        status: 'active'
      });
      
    if (membershipError) throw membershipError;

    // 3. Insert payment
    if (paymentInfo) {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          id: crypto.randomUUID(),
          member_id: memberId,
          amount: price,
          payment_method: paymentInfo.method,
          payment_date: member.startDate,
          payment_status: paymentInfo.status,
          notes: 'First subscription payment',
        });
        
      if (paymentError) throw paymentError;
    }
  },

  async updateMember(id: string, member: Partial<Member>): Promise<void> {
    const updateData: any = {};
    if (member.name !== undefined) updateData.full_name = member.name;
    if (member.phone !== undefined) updateData.phone = member.phone;
    if (member.gender !== undefined) updateData.gender = member.gender;
    if (member.dob !== undefined) updateData.birth_date = member.dob;
    if (member.notes !== undefined) updateData.notes = member.notes;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('members')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    }
  },

  async deleteMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
