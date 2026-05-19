import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Sermon } from '../types';

const KEY = '@bible_sermons_v1';

export const loadSermons = async (): Promise<Sermon[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Sermon[]) : [];
  } catch {
    return [];
  }
};

export const saveSermons = async (sermons: Sermon[]): Promise<void> => {
  await AsyncStorage.setItem(KEY, JSON.stringify(sermons));
};

export const generateId = (): string =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);
