import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Verse } from '../types';
import { loadSermons, saveSermons, generateId } from '../storage/dataService';

type Props = NativeStackScreenProps<RootStackParamList, 'ChapterEditor'>;

interface VerseForm {
  id: string;
  text: string;
  reference: string;
}

const emptyForm = (): VerseForm => ({ id: '', text: '', reference: '' });

export default function ChapterEditorScreen({ route, navigation }: Props) {
  const { sermonId, chapterId } = route.params;
  const [title, setTitle] = useState('');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<VerseForm>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadSermons().then((sermons) => {
        const sermon = sermons.find((s) => s.id === sermonId);
        if (!sermon) return;
        if (chapterId) {
          const chapter = sermon.chapters.find((c) => c.id === chapterId);
          if (chapter) {
            setTitle(chapter.title);
            setVerses(chapter.verses);
          }
        }
      });
    }, [sermonId, chapterId])
  );

  const persistChapter = async (newTitle: string, newVerses: Verse[]) => {
    const sermons = await loadSermons();
    const updated = sermons.map((s) => {
      if (s.id !== sermonId) return s;
      if (chapterId) {
        return {
          ...s,
          chapters: s.chapters.map((c) =>
            c.id === chapterId ? { ...c, title: newTitle, verses: newVerses } : c
          ),
        };
      }
      // nuevo capítulo
      return {
        ...s,
        chapters: [
          ...s.chapters,
          { id: generateId(), title: newTitle, verses: newVerses },
        ],
      };
    });
    await saveSermons(updated);
  };

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      Alert.alert('Error', 'El título no puede estar vacío.');
      return;
    }
    await persistChapter(trimmed, verses);
    navigation.goBack();
  };

  // ── Modal de versículo ──────────────────────────────────────────────────────

  const openAdd = () => {
    setForm(emptyForm());
    setEditingId(null);
    setModalVisible(true);
  };

  const openEdit = (verse: Verse) => {
    setForm({ id: verse.id, text: verse.text, reference: verse.reference ?? '' });
    setEditingId(verse.id);
    setModalVisible(true);
  };

  const handleModalSave = () => {
    const text = form.text.trim();
    if (!text) {
      Alert.alert('Error', 'El versículo no puede estar vacío.');
      return;
    }
    const verse: Verse = {
      id: editingId ?? generateId(),
      text,
      reference: form.reference.trim() || undefined,
    };
    setVerses((prev) =>
      editingId ? prev.map((v) => (v.id === editingId ? verse : v)) : [...prev, verse]
    );
    setModalVisible(false);
  };

  const deleteVerse = (verse: Verse) => {
    Alert.alert('Eliminar versículo', '¿Eliminar este versículo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => setVerses((prev) => prev.filter((v) => v.id !== verse.id)),
      },
    ]);
  };

  // ── Reordenar con botones ↑ ↓ ───────────────────────────────────────────────

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setVerses((prev) => {
      const a = [...prev];
      [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]];
      return a;
    });
  };

  const moveDown = (idx: number) => {
    setVerses((prev) => {
      if (idx === prev.length - 1) return prev;
      const a = [...prev];
      [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]];
      return a;
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Título */}
      <View style={styles.form}>
        <Text style={styles.label}>Título del capítulo</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ej: Capítulo 1"
          placeholderTextColor="#aaa"
          returnKeyType="done"
        />
      </View>

      {/* Cabecera versículos */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Versículos (orden correcto ↕)</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={verses}
        keyExtractor={(v) => v.id}
        contentContainerStyle={styles.verseList}
        renderItem={({ item, index }) => (
          <View style={styles.verseCard}>
            {/* Número de orden */}
            <View style={styles.orderBadge}>
              <Text style={styles.orderNum}>{index + 1}</Text>
            </View>

            <View style={styles.verseBody}>
              {item.reference ? (
                <Text style={styles.verseRef}>{item.reference}</Text>
              ) : null}
              <Text style={styles.verseText} numberOfLines={3}>
                {item.text}
              </Text>
            </View>

            {/* Flechas de orden */}
            <View style={styles.arrowCol}>
              <TouchableOpacity
                style={[styles.arrowBtn, index === 0 && styles.arrowDisabled]}
                onPress={() => moveUp(index)}
                disabled={index === 0}
              >
                <Text style={styles.arrowText}>▲</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.arrowBtn, index === verses.length - 1 && styles.arrowDisabled]}
                onPress={() => moveDown(index)}
                disabled={index === verses.length - 1}
              >
                <Text style={styles.arrowText}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Editar / Eliminar */}
            <View style={styles.actionCol}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                <Text style={styles.editBtnText}>✎</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteVerse(item)}>
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Sin versículos. Agrega el primero.</Text>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>
            {chapterId ? 'Guardar capítulo' : 'Crear capítulo'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Modal agregar / editar versículo ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalCard}
          >
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>
                {editingId ? 'Editar versículo' : 'Nuevo versículo'}
              </Text>

              <Text style={styles.label}>Referencia (opcional)</Text>
              <TextInput
                style={styles.input}
                value={form.reference}
                onChangeText={(v) => setForm((f) => ({ ...f, reference: v }))}
                placeholder="Ej: Juan 3:16"
                placeholderTextColor="#aaa"
                returnKeyType="next"
              />

              <Text style={[styles.label, { marginTop: 14 }]}>Texto del versículo</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.text}
                onChangeText={(v) => setForm((f) => ({ ...f, text: v }))}
                placeholder="Escribe el versículo aquí..."
                placeholderTextColor="#aaa"
                multiline
                textAlignVertical="top"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn2} onPress={handleModalSave}>
                  <Text style={styles.saveBtnText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  textArea: { height: 120, paddingTop: 12 },
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
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1a3c6e', flex: 1 },
  addBtn: {
    backgroundColor: '#1a3c6e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  verseList: { padding: 12, gap: 8 },
  verseCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a3c6e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderNum: { color: '#fff', fontWeight: '700', fontSize: 13 },
  verseBody: { flex: 1 },
  verseRef: { fontSize: 11, color: '#c4a35a', fontWeight: '700', marginBottom: 2 },
  verseText: { fontSize: 13, color: '#2c2c2c', lineHeight: 18 },
  arrowCol: { gap: 2 },
  arrowBtn: {
    backgroundColor: '#eee',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  arrowDisabled: { opacity: 0.3 },
  arrowText: { fontSize: 11, color: '#444' },
  actionCol: { gap: 4 },
  editBtn: {
    backgroundColor: '#e8f0fe',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editBtnText: { color: '#1a3c6e', fontSize: 14 },
  deleteBtn: {
    backgroundColor: '#fdecea',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteBtnText: { color: '#f44336', fontSize: 13, fontWeight: '700' },
  emptyText: { color: '#aaa', textAlign: 'center', padding: 20, fontSize: 13 },
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a3c6e',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 8 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#1a3c6e',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#1a3c6e', fontWeight: '700', fontSize: 15 },
  saveBtn2: {
    flex: 1,
    backgroundColor: '#1a3c6e',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
