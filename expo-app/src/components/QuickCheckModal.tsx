import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';

export default function QuickCheckModal({ isOpen, onClose, onCheckComplete }: { isOpen: boolean; onClose: () => void; onCheckComplete?: () => void }) {
  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Quick Check</Text>
          <Text style={styles.body}>Enter a URL or paste text to quickly check claims (demo).</Text>
          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.primary]} onPress={() => { onCheckComplete && onCheckComplete(); }}>
              <Text style={styles.btnText}>Run Check</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.ghost]} onPress={onClose}>
              <Text style={styles.ghostText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  body: { color: '#6B7280', marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8, marginHorizontal: 6 },
  primary: { backgroundColor: '#1E90FF' },
  ghost: { backgroundColor: '#F3F4F6' },
  btnText: { color: '#fff', fontWeight: '700' },
  ghostText: { color: '#111827', fontWeight: '700' },
});
