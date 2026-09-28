import { Host, Switch } from '@expo/ui';
import { Stack } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { ME } from '@/data/mock';
import { useColors } from '@/hooks/use-colors';

function Section({ title, children }: { title: string; children: ReactNode }) {
  const c = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: c.muted }]}>{title.toUpperCase()}</Text>
      <View style={[styles.card, { backgroundColor: c.surface }]}>{children}</View>
    </View>
  );
}

function Row({ label, value, trailing, first }: { label: string; value?: string; trailing?: ReactNode; first?: boolean }) {
  const c = useColors();
  return (
    <View style={[styles.row, !first && { borderTopColor: c.separator, borderTopWidth: StyleSheet.hairlineWidth }]}>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
      {value ? <Text style={{ color: c.muted }}>{value}</Text> : null}
      {trailing}
    </View>
  );
}

// Demo: a tab WITHOUT overflow menu (it's optional), native @expo/ui switches inside RN layout.
export default function ProfileScreen() {
  const c = useColors();
  const [push, setPush] = useState(true);
  const [emails, setEmails] = useState(false);

  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar id="me" name={ME.name} size={88} />
          <Text style={[styles.name, { color: c.text }]}>{ME.name}</Text>
          <Text style={{ color: c.muted }}>{ME.role}</Text>
        </View>

        <Section title="Account">
          <Row first label="Email" value={ME.email} />
          <Row label="Team" value={ME.team} />
        </Section>

        <Section title="Notifications">
          <Row
            first
            label="Push notifications"
            trailing={
              <Host matchContents>
                <Switch value={push} onValueChange={setPush} />
              </Host>
            }
          />
          <Row
            label="Email digest"
            trailing={
              <Host matchContents>
                <Switch value={emails} onValueChange={setEmails} />
              </Host>
            }
          />
        </Section>
      </ScrollView>
      <Stack.Title large>Profile</Stack.Title>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 24 },
  header: { alignItems: 'center', gap: 4 },
  name: { fontSize: 22, fontWeight: '600', marginTop: 8 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 13, paddingHorizontal: 16 },
  card: { borderRadius: 14, borderCurve: 'continuous', overflow: 'hidden' },
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 16 },
  label: { flex: 1, fontSize: 16 },
});
