import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Verse } from '../types';
import { loadSermons } from '../storage/dataService';

type Props = NativeStackScreenProps<RootStackParamList, 'Practice'>;

interface VerseItem extends Verse {
  correct?: boolean;
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // Si quedó igual al original (por id), volver a mezclar
  if (a.every((item, i) => (item as VerseItem).id === (arr[i] as VerseItem).id)) {
    return shuffle(arr);
  }
  return a;
};

export default function PracticeScreen({ route, navigation }: Props) {
  const { sermonId, chapterId } = route.params;
  const [correctOrder, setCorrectOrder] = useState<Verse[]>([]);
  const [verses, setVerses] = useState<VerseItem[]>([]);
  const [checked, setChecked] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);
  const [score, setScore] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadSermons().then((sermons) => {
        const sermon = sermons.find((s) => s.id === sermonId);
        if (!sermon) return;
        const chapter = sermon.chapters.find((c) => c.id === chapterId);
        if (!chapter) return;

        navigation.setOptions({
          title: `${sermon.title}  —  ${chapter.title}`,
        });

        const correct = chapter.verses;
        setCorrectOrder(correct);
        setVerses(correct.length > 1 ? shuffle(correct) : correct);
        setChecked(false);
        setAllCorrect(false);
        setScore(0);
      });
    }, [sermonId, chapterId])
  );

  const handleCheck = () => {
    const result: VerseItem[] = verses.map((v, idx) => ({
      ...v,
      correct: correctOrder[idx]?.id === v.id,
    }));
    const correctCount = result.filter((v) => v.correct).length;
    setVerses(result);
    setChecked(true);
    setAllCorrect(correctCount === correctOrder.length);
    setScore(correctCount);
  };

  const handleRetry = () => {
    setVerses(correctOrder.length > 1 ? shuffle(correctOrder) : correctOrder);
    setChecked(false);
    setAllCorrect(false);
    setScore(0);
  };

  const handleShowCorrect = () => {
    setVerses(correctOrder.map((v) => ({ ...v, correct: true })));
    setChecked(true);
    setAllCorrect(true);
    setScore(correctOrder.length);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<VerseItem>) => {
    const cardStyle: object[] = [styles.verseCard];
    if (checked) cardStyle.push(item.correct ? styles.cardCorrect : styles.cardIncorrect);
    if (isActive) cardStyle.push(styles.cardDragging);

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={checked}
          style={cardStyle}
          activeOpacity={0.9}
        >
          <Text style={styles.dragHandle}>☰</Text>
          <View style={styles.verseBody}>
            {item.reference ? (
              <Text style={styles.verseRef}>{item.reference}</Text>
            ) : null}
            <Text style={styles.verseText}>{item.text}</Text>
          </View>
          {checked && (
            <Text style={[styles.statusIcon, item.correct ? styles.iconOk : styles.iconErr]}>
              {item.correct ? '✓' : '✗'}
            </Text>
          )}
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <View style={styles.container}>
      {!checked ? (
        <Text style={styles.hint}>
          Mantén presionado una tarjeta y arrástrala para ordenar los versículos
        </Text>
      ) : (
        <View style={[styles.resultBar, allCorrect ? styles.resultSuccess : styles.resultError]}>
          <Text style={styles.resultText}>
            {allCorrect
              ? '¡Perfecto! Orden correcto 🎉'
              : `${score} de ${correctOrder.length} en la posición correcta`}
          </Text>
        </View>
      )}

      <DraggableFlatList
        data={verses}
        onDragEnd={({ data }) => { if (!checked) setVerses(data); }}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        {!checked ? (
          <TouchableOpacity style={styles.checkBtn} onPress={handleCheck}>
            <Text style={styles.checkBtnText}>Verificar orden ✓</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
              <Text style={styles.retryBtnText}>🔄  Reintentar</Text>
            </TouchableOpacity>
            {!allCorrect && (
              <TouchableOpacity style={styles.showBtn} onPress={handleShowCorrect}>
                <Text style={styles.showBtnText}>Ver correcto</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0e8' },
  hint: {
    textAlign: 'center',
    color: '#888',
    fontSize: 13,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f5f0e8',
  },
  resultBar: { paddingVertical: 14, paddingHorizontal: 16 },
  resultSuccess: { backgroundColor: '#e8f5e9' },
  resultError: { backgroundColor: '#fdecea' },
  resultText: { textAlign: 'center', fontWeight: '700', fontSize: 15, color: '#2c2c2c' },
  list: { padding: 12, gap: 10 },
  verseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 2,
    borderColor: '#e0ddd5',
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cardDragging: {
    elevation: 10,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    borderColor: '#1a3c6e',
    backgroundColor: '#f0f4ff',
  },
  cardCorrect: { borderColor: '#4caf50', backgroundColor: '#f1fff4' },
  cardIncorrect: { borderColor: '#f44336', backgroundColor: '#fff6f6' },
  dragHandle: { fontSize: 20, color: '#bbb' },
  verseBody: { flex: 1 },
  verseRef: { fontSize: 12, color: '#c4a35a', fontWeight: '700', marginBottom: 4 },
  verseText: { fontSize: 14, color: '#2c2c2c', lineHeight: 20 },
  statusIcon: { fontSize: 22, fontWeight: '900' },
  iconOk: { color: '#4caf50' },
  iconErr: { color: '#f44336' },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  checkBtn: {
    backgroundColor: '#1a3c6e',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  checkBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  footerRow: { flexDirection: 'row', gap: 10 },
  retryBtn: {
    flex: 1,
    backgroundColor: '#1a3c6e',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  showBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1a3c6e',
    backgroundColor: '#fff',
  },
  showBtnText: { color: '#1a3c6e', fontWeight: '700', fontSize: 15 },
});
