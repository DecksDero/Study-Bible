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
import type { RootStackParamList, Sermon } from '../types';
import { loadSermons, saveSermons } from '../storage/dataService';

type Props = NativeStackScreenProps<RootStackParamList, 'Admin'>;

export default function AdminScreen({ navigation }: Props) {
  const [sermons, setSermons] = useState<Sermon[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadSermons().then(setSermons);
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('SermonEditor', {})}
        >
          <Text style={styles.headerBtnText}>+ Nuevo</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const deleteSermon = (sermon: Sermon) => {
    Alert.alert(
      'Eliminar sermón',
      `¿Eliminar "${sermon.title}" y todos sus capítulos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updated = sermons.filter((s) => s.id !== sermon.id);
            await saveSermons(updated);
            setSermons(updated);
          },
        },
      ]
    );
  };

  if (sermons.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No hay sermones todavía.</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('SermonEditor', {})}
        >
          <Text style={styles.addBtnText}>+ Agregar primer sermón</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={sermons}
      keyExtractor={(s) => s.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>
              {item.chapters.length} capítulo{item.chapters.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('SermonEditor', { sermonId: item.id })}
            >
              <Text style={styles.editBtnText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteSermon(item)}>
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a3c6e' },
  cardSub: { fontSize: 13, color: '#888', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    backgroundColor: '#1a3c6e',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  editBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  deleteBtn: {
    backgroundColor: '#fdecea',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  deleteBtnText: { color: '#f44336', fontSize: 15, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  emptyText: { fontSize: 16, color: '#888' },
  addBtn: {
    backgroundColor: '#1a3c6e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '700' },
  headerBtn: { paddingHorizontal: 4 },
  headerBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
