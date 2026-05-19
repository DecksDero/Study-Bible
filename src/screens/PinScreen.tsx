import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { authenticate } from '../auth';

const PIN = '495421';

type Props = NativeStackScreenProps<RootStackParamList, 'PinScreen'>;

const ROWS = [['1','2','3'], ['4','5','6'], ['7','8','9'], ['','0','⌫']];

export default function PinScreen({ navigation }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const press = (digit: string) => {
    if (pin.length >= 6 || error) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 6) {
      if (next === PIN) {
        authenticate();
        navigation.replace('Admin');
      } else {
        setError(true);
        setTimeout(() => { setPin(''); setError(false); }, 900);
      }
    }
  };

  const del = () => {
    if (!error) setPin(p => p.slice(0, -1));
  };

  return (
    <View style={styles.bg}>
      <View style={styles.card}>
        <Text style={styles.lock}>🔐</Text>
        <Text style={styles.title}>Panel de Administrador</Text>
        <Text style={styles.sub}>Ingresa tu PIN de 6 dígitos</Text>

        <View style={styles.dots}>
          {Array.from({ length: 6 }, (_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < pin.length && (error ? styles.dotError : styles.dotFilled),
              ]}
            />
          ))}
        </View>

        {error && (
          <Text style={styles.errMsg}>PIN incorrecto. Intenta de nuevo.</Text>
        )}

        <View style={styles.pad}>
          {ROWS.map((row, ri) => (
            <View key={ri} style={styles.row}>
              {row.map((d, di) => {
                if (d === '') return <View key={di} style={styles.keyBlank} />;
                if (d === '⌫') return (
                  <TouchableOpacity key={di} style={styles.keyDel} onPress={del} activeOpacity={0.7}>
                    <Text style={styles.keyDelText}>⌫</Text>
                  </TouchableOpacity>
                );
                return (
                  <TouchableOpacity key={d} style={styles.key} onPress={() => press(d)} activeOpacity={0.7}>
                    <Text style={styles.keyNum}>{d}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#f5f0e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    width: '88%',
    maxWidth: 340,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  lock: { fontSize: 42, marginBottom: 10 },
  title: { fontSize: 17, fontWeight: '700', color: '#1a3c6e', marginBottom: 4 },
  sub: { fontSize: 13, color: '#999', marginBottom: 22 },
  dots: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e8e4dc',
    borderWidth: 2,
    borderColor: '#d0ccc4',
  },
  dotFilled: { backgroundColor: '#1a3c6e', borderColor: '#1a3c6e' },
  dotError: { backgroundColor: '#f44336', borderColor: '#f44336' },
  errMsg: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  pad: { marginTop: 22, gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  key: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dde4f5',
  },
  keyNum: { fontSize: 24, fontWeight: '600', color: '#1a3c6e' },
  keyBlank: { width: 70, height: 70 },
  keyDel: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff0ee',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffd5d0',
  },
  keyDelText: { fontSize: 22, color: '#f44336' },
});
