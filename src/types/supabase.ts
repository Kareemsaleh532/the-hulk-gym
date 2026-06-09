export interface DbMember {
  id: string; // uuid
  full_name: string;
  phone: string;
  gender: string;
  birth_date: string; // date
  notes: string;
  created_at?: string; // timestamptz
}

export interface DbMembership {
  id: string; // uuid
  member_id: string; // uuid
  plan_name: string;
  start_date: string; // date
  end_date: string; // date
  price: number; // numeric
  status: string;
  created_at?: string; // timestamptz
}

export interface DbPayment {
  id: string; // uuid
  member_id: string; // uuid
  amount: number; // numeric
  payment_method: string;
  payment_date: string; // date
  notes: string;
  created_at?: string; // timestamptz
}

// Helper types for inserts
export type DbMemberInsert = Omit<DbMember, 'created_at'>;
export type DbMembershipInsert = Omit<DbMembership, 'created_at'>;
export type DbPaymentInsert = Omit<DbPayment, 'created_at'>;
