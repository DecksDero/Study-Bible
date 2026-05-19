export interface Verse {
  id: string;
  text: string;
  reference?: string;
}

export interface Chapter {
  id: string;
  title: string;
  verses: Verse[]; // el orden del array es el orden correcto
}

export interface Sermon {
  id: string;
  title: string;
  chapters: Chapter[];
}

export type RootStackParamList = {
  Home: undefined;
  Practice: { sermonId: string; chapterId: string };
  PinScreen: undefined;
  Admin: undefined;
  SermonEditor: { sermonId?: string };
  ChapterEditor: { sermonId: string; chapterId?: string };
};
