import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Sermon, Chapter } from '../types';
import { loadSermons } from '../storage/dataService';
import { isAuthenticated } from '../auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      loadSermons().then(setSermons);
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate(isAuthenticated() ? 'Admin' : 'PinScreen')}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBtnText}>⚙ Admin</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const startPractice = (sermon: Sermon, chapter: Chapter) => {
    if (chapter.verses.length < 2) {
      Alert.alert(
        'Pocos versículos',
        'Este capítulo necesita al menos 2 versículos para practicar.'
      );
      return;
    }
    navigation.navigate('Practice', { sermonId: sermon.id, chapterId: chapter.id });
  };

  if (sermons.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📖</Text>
        <Text style={styles.emptyTitle}>Sin contenido aún</Text>
        <Text style={styles.emptySubtitle}>
          Ve a Admin para agregar sermones y versículos.
        </Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate(isAuthenticated() ? 'Admin' : 'PinScreen')}>
          <Text style={styles.emptyBtnText}>Ir a Admin</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={sermons}
      keyExtractor={(s) => s.id}
      contentContainerStyle={styles.list}
      renderItem={({ item: sermon }) => (
        <View style={styles.sermonCard}>
          <TouchableOpacity
            style={styles.sermonHeader}
            onPress={() => toggleExpand(sermon.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.sermonTitle}>{sermon.title}</Text>
            <Text style={styles.chevron}>{expanded.has(sermon.id) ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {expanded.has(sermon.id) && (
            <View>
              {sermon.chapters.length === 0 ? (
                <Text style={styles.noItems}>Sin capítulos</Text>
              ) : (
                sermon.chapters.map((chapter) => (
                  <TouchableOpacity
                    key={chapter.id}
                    style={styles.chapterItem}
                    onPress={() => startPractice(sermon, chapter)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.chapterInfo}>
                      <Text style={styles.chapterTitle}>{chapter.title}</Text>
                      <Text style={styles.verseCount}>
                        {chapter.verses.length} versículo
                        {chapter.verses.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <Text style={styles.playIcon}>▶</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  sermonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  sermonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a3c6e',
  },
  sermonTitle: { color: '#fff', fontSize: 17, fontWeight: '700', flex: 1 },
  chevron: { color: '#c4a35a', fontSize: 13, marginLeft: 8 },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  chapterInfo: { flex: 1 },
  chapterTitle: { fontSize: 15, color: '#1a3c6e', fontWeight: '600' },
  verseCount: { fontSize: 12, color: '#888', marginTop: 2 },
  playIcon: { fontSize: 16, color: '#c4a35a' },
  noItems: { padding: 14, color: '#aaa', textAlign: 'center', fontSize: 13 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 14 },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1a3c6e' },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
  emptyBtn: {
    backgroundColor: '#1a3c6e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
  headerBtn: { paddingHorizontal: 4 },
  headerBtnText: { color: '#fff', fontSize: 14 },
});
