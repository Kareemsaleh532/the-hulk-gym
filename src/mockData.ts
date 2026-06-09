import type { Plan, Member, Coach, Payment, ActivityLog } from './types';

export const INITIAL_PLANS: Plan[] = [
  {
    id: 'plan-1m',
    name: 'اشتراك شهر واحد',
    durationMonths: 1,
    price: 0,
    features: ['دخول صالة التمارين', 'منطقة الكارديو', 'استخدام الخزائن'],
  },
  {
    id: 'plan-2m',
    name: 'اشتراك شهرين',
    durationMonths: 2,
    price: 0,
    features: ['دخول صالة التمارين', 'منطقة الكارديو', 'استخدام الخزائن'],
  },
  {
    id: 'plan-3m',
    name: 'اشتراك ٣ أشهر',
    durationMonths: 3,
    price: 0,
    features: ['دخول صالة التمارين', 'منطقة الكارديو', 'استخدام الخزائن'],
  },
  {
    id: 'plan-4m',
    name: 'اشتراك ٤ أشهر',
    durationMonths: 4,
    price: 0,
    features: ['دخول صالة التمارين', 'منطقة الكارديو', 'استخدام الخزائن'],
  },
  {
    id: 'plan-5m',
    name: 'اشتراك ٥ أشهر',
    durationMonths: 5,
    price: 0,
    features: ['دخول صالة التمارين', 'منطقة الكارديو', 'استخدام الخزائن'],
  },
  {
    id: 'plan-6m',
    name: 'اشتراك ٦ أشهر',
    durationMonths: 6,
    price: 0,
    features: ['دخول صالة التمارين', 'منطقة الكارديو', 'استخدام الخزائن'],
  },
  {
    id: 'plan-7m',
    name: 'اشتراك ٧ أشهر',
    durationMonths: 7,
    price: 0,
    features: ['دخول صالة التمارين', 'منطقة الكارديو', 'استخدام الخزائن'],
  },
  {
    id: 'plan-8m',
    name: 'اشتراك ٨ أشهر',
    durationMonths: 8,
    price: 0,
    features: ['دخول صالة التمارين', 'منطقة الكارديو', 'استخدام الخزائن'],
  },
  {
    id: 'plan-9m',
    name: 'اشتراك ٩ أشهر',
    durationMonths: 9,
    price: 0,
    features: ['دخول صالة التمارين', 'منطقة الكارديو', 'استخدام الخزائن'],
  },
  {
    id: 'plan-10m',
    name: 'اشتراك ١٠ أشهر',
    durationMonths: 10,
    price: 0,
    features: ['دخول صالة التمارين', 'منطقة الكارديو', 'استخدام الخزائن'],
  },
  {
    id: 'plan-11m',
    name: 'اشتراك ١١ شهرًا',
    durationMonths: 11,
    price: 0,
    features: ['دخول صالة التمارين', 'منطقة الكارديو', 'استخدام الخزائن'],
  },
  {
    id: 'plan-12m',
    name: 'اشتراك ١٢ شهرًا',
    durationMonths: 12,
    price: 0,
    features: ['دخول صالة التمارين', 'منطقة الكارديو', 'استخدام الخزائن'],
  },
];

export const INITIAL_COACHES: Coach[] = [];

export const INITIAL_MEMBERS: Member[] = [];

export const INITIAL_PAYMENTS: Payment[] = [];

export const INITIAL_LOGS: ActivityLog[] = [];
