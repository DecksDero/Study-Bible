import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Sermon } from '../types';

const SERMONS_REF = doc(db, 'config', 'sermons');

export const loadSermons = async (): Promise<Sermon[]> => {
  try {
    const snap = await getDoc(SERMONS_REF);
    if (snap.exists()) {
      return snap.data().sermons as Sermon[];
    }
    return [];
  } catch {
    return [];
  }
};

export const saveSermons = async (sermons: Sermon[]): Promise<void> => {
  await setDoc(SERMONS_REF, { sermons });
};

export const generateId = (): string =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);
