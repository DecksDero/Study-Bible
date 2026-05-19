import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Reemplaza estos valores con los de tu proyecto Firebase
// Ve a: console.firebase.google.com → tu proyecto → Configuración → Tus apps → SDK
const firebaseConfig = {
  apiKey: "REEMPLAZAR",
  authDomain: "REEMPLAZAR",
  projectId: "REEMPLAZAR",
  storageBucket: "REEMPLAZAR",
  messagingSenderId: "REEMPLAZAR",
  appId: "REEMPLAZAR",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
