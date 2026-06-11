import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore';
import type { DbTransaction } from '../types';

export interface AccountingStats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  lastMonthIncome: number;
  lastMonthExpense: number;
  lastMonthProfit: number;
}

export const accountingService = {
  async getTransactions(filters?: {
    type?: 'income' | 'expense';
    startDate?: string;
    endDate?: string;
  }): Promise<DbTransaction[]> {
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    
    let transactions: DbTransaction[] = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        type: data.type,
        category: data.category,
        amount: data.amount,
        date: data.date,
        description: data.description,
        reference_id: data.reference_id,
        created_by: data.created_by,
        created_at: data.created_at,
      };
    });

    if (filters?.type) {
      transactions = transactions.filter(t => t.type === filters.type);
    }
    if (filters?.startDate) {
      transactions = transactions.filter(t => t.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      transactions = transactions.filter(t => t.date <= filters.endDate!);
    }

    return transactions;
  },

  async addTransaction(
    data: Omit<DbTransaction, 'id' | 'created_at'>
  ): Promise<DbTransaction> {
    const id = `tx-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    
    const transaction: DbTransaction = {
      ...data,
      id,
      created_at: now
    };

    const txRef = doc(db, 'transactions', id);
    await setDoc(txRef, {
      type: data.type,
      category: data.category,
      amount: Number(data.amount),
      date: data.date,
      description: data.description,
      reference_id: data.reference_id || '',
      created_by: data.created_by,
      created_at: now,
    });

    return transaction;
  },

  async deleteTransaction(id: string): Promise<void> {
    const txRef = doc(db, 'transactions', id);
    await deleteDoc(txRef);
  },

  async getStats(): Promise<AccountingStats> {
    const transactions = await this.getTransactions();
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let totalIncome = 0;
    let totalExpense = 0;
    let lastMonthIncome = 0;
    let lastMonthExpense = 0;

    for (const tx of transactions) {
      const txDate = new Date(tx.date);
      const isCurrentMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      const isLastMonth = txDate.getMonth() === lastMonth && txDate.getFullYear() === lastMonthYear;

      if (isCurrentMonth) {
        if (tx.type === 'income') totalIncome += Number(tx.amount);
        else totalExpense += Number(tx.amount);
      } else if (isLastMonth) {
        if (tx.type === 'income') lastMonthIncome += Number(tx.amount);
        else lastMonthExpense += Number(tx.amount);
      }
    }

    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      lastMonthIncome,
      lastMonthExpense,
      lastMonthProfit: lastMonthIncome - lastMonthExpense,
    };
  }
};
