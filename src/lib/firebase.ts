import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, collection, getDocs, doc, setDoc, query, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDfMJr1DSJ8aabehVba4BwRM84nMlUxKOg",
  authDomain: "the-hulk-gym-b77e7.firebaseapp.com",
  projectId: "the-hulk-gym-b77e7",
  storageBucket: "the-hulk-gym-b77e7.firebasestorage.app",
  messagingSenderId: "960774737497",
  appId: "1:960774737497:web:b663b77673719fddadeb48",
  measurementId: "G-FJESDBM57N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Enable offline persistence (optional but recommended for web apps)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
  } else if (err.code == 'unimplemented') {
    console.warn('The current browser does not support all of the features required to enable persistence');
  }
});

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Seed default plans and staff accounts to Firebase Firestore if empty
export async function seedFirebaseDefaultData() {
  const now = new Date().toISOString();

  try {
    // Check and seed plans
    const plansCol = collection(db, 'plans');
    const plansQuery = query(plansCol, limit(1));
    const plansSnapshot = await getDocs(plansQuery);
    if (plansSnapshot.empty) {
      const defaultPlans = [
        { id: 'plan-1m',  name: 'اشتراك شهر واحد',  duration_months: 1,  price: 150, features: ['دخول صالة التمارين','منطقة الكارديو','استخدام الخزائن'], created_at: now },
        { id: 'plan-2m',  name: 'اشتراك شهرين',     duration_months: 2,  price: 250, features: ['دخول صالة التمارين','منطقة الكارديو','استخدام الخزائن'], created_at: now },
        { id: 'plan-3m',  name: 'اشتراك ٣ أشهر',    duration_months: 3,  price: 350, features: ['دخول صالة التمارين','منطقة الكارديو','استخدام الخزائن'], created_at: now },
        { id: 'plan-6m',  name: 'اشتراك ٦ أشهر',    duration_months: 6,  price: 600, features: ['دخول صالة التمارين','منطقة الكارديو','استخدام الخزائن','جلسة مدرب شخصي'], created_at: now },
        { id: 'plan-12m', name: 'اشتراك سنوي',       duration_months: 12, price: 1000, features: ['دخول صالة التمارين','منطقة الكارديو','استخدام الخزائن','جلسات مدرب شخصي','تحليل جسم مجاني'], created_at: now },
      ];
      for (const plan of defaultPlans) {
        await setDoc(doc(db, 'plans', plan.id), plan);
      }
    }

    // Check and seed staff
    const staffCol = collection(db, 'staff');
    const staffQuery = query(staffCol, limit(1));
    const staffSnapshot = await getDocs(staffQuery);
    if (staffSnapshot.empty) {
      const defaultStaff = [
        { id: 'staff-admin', name: 'مدير النادي', email: 'admin@hulkgym.com', password: 'admin123', role: 'admin', created_at: now },
        { id: 'staff-1',    name: 'موظف النادي',  email: 'staff@hulkgym.com', password: 'staff123', role: 'staff', created_at: now },
      ];
      for (const member of defaultStaff) {
        await setDoc(doc(db, 'staff', member.id), member);
      }
    }
  } catch (error) {
    console.error('Error seeding Firebase default data:', error);
  }
}
