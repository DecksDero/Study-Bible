import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Chapter } from '../types';
import { loadSermons, saveSermons, generateId } from '../storage/dataService';

type Props = NativeStackScreenProps<RootStackParamList, 'SermonEditor'>;

export default function SermonEditorScreen({ route, navigation }: Props) {
  const { sermonId } = route.params ?? {};
  const [title, setTitle] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadSermons().then((sermons) => {
        if (sermonId) {
          const s = sermons.find((s) => s.id === sermonId);
          if (s) {
            setTitle(s.title);
            setChapters(s.chapters);
          }
        }
      });
    }, [sermonId])
  );

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      Alert.alert('Error', 'El título no puede estar vacío.');
      return;
    }

    const sermons = await loadSermons();

    if (sermonId) {
      const updated = sermons.map((s) =>
        s.id === sermonId ? { ...s, title: trimmed } : s
      );
      await saveSermons(updated);
    } else {
      await saveSermons([
        ...sermons,
        { id: generateId(), title: trimmed, chapters: [] },
      ]);
    }

    navigation.goBack();
  };

  const deleteChapter = async (chapter: Chapter) => {
    Alert.alert('Eliminar capítulo', `¿Eliminar "${chapter.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const sermons = await loadSermons();
          const updated = sermons.map((s) =>
            s.id === sermonId
              ? { ...s, chapters: s.chapters.filter((c) => c.id !== chapter.id) }
              : s
          );
          await saveSermons(updated);
          setChapters((prev) => prev.filter((c) => c.id !== chapter.id));
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.form}>
        <Text style={styles.label}>Título del sermón</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ej: Sermón 1 — La fe"
          placeholderTextColor="#aaa"
          returnKeyType="done"
        />
      </View>

      {sermonId ? (
        <>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Capítulos</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('ChapterEditor', { sermonId })}
            >
              <Text style={styles.addBtnText}>+ Agregar capítulo</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={chapters}
            keyExtractor={(c) => c.id}
            contentContainerStyle={styles.chapterList}
            renderItem={({ item }) => (
              <View style={styles.chapterCard}>
                <View style={styles.chapterInfo}>
                  <Text style={styles.chapterTitle}>{item.title}</Text>
                  <Text style={styles.chapterSub}>
                    {item.verses.length} versículo{item.verses.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.chapterActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() =>
                      navigation.navigate('ChapterEditor', {
                        sermonId: sermonId!,
                        chapterId: item.id,
                      })
                    }
                  >
                    <Text style={styles.editBtnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteChapter(item)}
                  >
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Sin capítulos. Agrega uno arriba.</Text>
            }
          />
        </>
      ) : (
        <Text style={styles.hint}>
          Guarda el sermón primero. Luego podrás agregar capítulos y versículos.
        </Text>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>
            {sermonId ? 'Guardar título' : 'Crear sermón'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0e8' },
  form: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  label: { fontSize: 13, color: '#666', fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#2c2c2c',
    backgroundColor: '#fafafa',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a3c6e' },
  addBtn: {
    backgroundColor: '#1a3c6e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  chapterList: { padding: 12, gap: 8 },
  chapterCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  chapterInfo: { flex: 1 },
  chapterTitle: { fontSize: 15, fontWeight: '600', color: '#2c2c2c' },
  chapterSub: { fontSize: 12, color: '#888', marginTop: 2 },
  chapterActions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    backgroundColor: '#1a3c6e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editBtnText: { color: '#fff', fontSize: 13 },
  deleteBtn: {
    backgroundColor: '#fdecea',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteBtnText: { color: '#f44336', fontSize: 14, fontWeight: '700' },
  emptyText: { color: '#aaa', textAlign: 'center', padding: 20, fontSize: 13 },
  hint: { padding: 16, color: '#888', textAlign: 'center', fontSize: 13, lineHeight: 20 },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveBtn: {
    backgroundColor: '#1a3c6e',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
