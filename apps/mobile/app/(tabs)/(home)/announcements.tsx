import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground, GlassCard } from '@/components/glass';
import { GlassFonts, GlassTheme } from '@/constants/glass-theme';
import { useAuth } from '@/lib/auth/context';
import { api } from '@/lib/trpc/client';

type Program = { id: string; name: string };

export default function AnnouncementsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isTeacher = user?.role === 'TEACHER';

  const [composerVisible, setComposerVisible] = useState(false);

  const { data: announcements, isLoading, refetch } = api.announcements.list.useQuery();
  const { data: programs } = api.teachers.getMyPrograms.useQuery(undefined, {
    enabled: isTeacher,
  });

  const teacherPrograms: Program[] = useMemo(
    () => (programs ?? []).map((p) => ({ id: p.id, name: p.name })),
    [programs],
  );

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
            <Ionicons name="chevron-back" size={22} color={GlassTheme.ink} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>BROADCAST</Text>
            <Text style={styles.title}>Announcements</Text>
          </View>
          {isTeacher && (
            <Pressable
              onPress={() => {
                if (teacherPrograms.length === 0) {
                  Alert.alert(
                    'No programs',
                    'Create a class first to associate announcements with a program.',
                  );
                  return;
                }
                setComposerVisible(true);
              }}
              hitSlop={8}
              style={styles.newButton}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </Pressable>
          )}
        </View>

        {isLoading ? (
          <View style={styles.empty}>
            <ActivityIndicator color={GlassTheme.primary} />
          </View>
        ) : !announcements || announcements.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="megaphone-outline"
              size={44}
              color={GlassTheme.inkSubtle}
            />
            <Text style={styles.emptyTitle}>No announcements yet</Text>
            <Text style={styles.emptySub}>
              {isTeacher
                ? 'Tap + to broadcast an update to your program.'
                : 'When your teacher posts an update, it will appear here.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={announcements}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={isLoading}
            onRefresh={refetch}
            renderItem={({ item }) => (
              <GlassCard radius={20} style={styles.announcementCard}>
                <View style={styles.announcementInner}>
                  <View style={styles.announcementHeader}>
                    <Text style={styles.scopeLabel}>
                      {item.class?.name
                        ? `${item.program?.name ?? 'Program'} · ${item.class.name}`
                        : (item.program?.name ?? 'Program')}
                    </Text>
                    <Text style={styles.timestamp}>{formatDate(item.createdAt)}</Text>
                  </View>
                  <Text style={styles.announcementTitle}>{item.title}</Text>
                  <Text style={styles.announcementBody}>{item.body}</Text>
                  {item.teacher?.name && (
                    <Text style={styles.byline}>— {item.teacher.name}</Text>
                  )}
                </View>
              </GlassCard>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}
      </SafeAreaView>

      {isTeacher && (
        <ComposerModal
          visible={composerVisible}
          programs={teacherPrograms}
          onClose={() => setComposerVisible(false)}
          onCreated={() => {
            setComposerVisible(false);
            refetch();
          }}
        />
      )}
    </AmbientBackground>
  );
}

function formatDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ComposerModal({
  visible,
  programs,
  onClose,
  onCreated,
}: {
  visible: boolean;
  programs: Program[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [programId, setProgramId] = useState<string | undefined>(programs[0]?.id);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const create = api.announcements.create.useMutation({
    onSuccess: () => {
      setTitle('');
      setBody('');
      onCreated();
    },
    onError: (err) => Alert.alert('Could not post announcement', err.message),
  });

  const submit = () => {
    if (!programId) {
      Alert.alert('Pick a program', 'Choose which program this announcement is for.');
      return;
    }
    if (!title.trim() || !body.trim()) return;
    create.mutate({ programId, title: title.trim(), body: body.trim() });
  };

  // Default to the first program when the list changes
  if (visible && !programId && programs[0]) {
    setProgramId(programs[0].id);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalRoot}
      >
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalGrabber} />
          <Text style={styles.modalEyebrow}>NEW ANNOUNCEMENT</Text>
          <Text style={styles.modalTitle}>Broadcast an update</Text>

          {programs.length > 1 && (
            <View style={styles.programChips}>
              {programs.map((p) => {
                const selected = programId === p.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setProgramId(p.id)}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {p.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={GlassTheme.inkSubtle}
            style={styles.modalInput}
            maxLength={200}
            editable={!create.isPending}
          />
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="What would you like to say?"
            placeholderTextColor={GlassTheme.inkSubtle}
            style={[styles.modalInput, styles.modalInputBody]}
            multiline
            textAlignVertical="top"
            editable={!create.isPending}
          />

          <View style={styles.modalActions}>
            <Pressable onPress={onClose} disabled={create.isPending} style={styles.secondary}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={submit}
              disabled={create.isPending || !title.trim() || !body.trim()}
              style={[
                styles.primaryWrap,
                (!title.trim() || !body.trim() || create.isPending) && { opacity: 0.5 },
              ]}
            >
              <LinearGradient
                colors={[GlassTheme.primaryGlass, GlassTheme.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primary}
              >
                {create.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryText}>Post</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 4,
    gap: 12,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 11,
    color: GlassTheme.inkSubtle,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: GlassFonts.display,
    fontSize: 30,
    color: GlassTheme.ink,
    letterSpacing: -0.4,
  },
  newButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GlassTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  listContent: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 120 },
  announcementCard: {},
  announcementInner: { padding: 18, gap: 6 },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scopeLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: GlassTheme.primary,
  },
  timestamp: { fontSize: 11, color: GlassTheme.inkSubtle },
  announcementTitle: {
    fontFamily: GlassFonts.display,
    fontSize: 20,
    color: GlassTheme.ink,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  announcementBody: {
    fontSize: 14,
    color: GlassTheme.inkMuted,
    lineHeight: 19,
    marginTop: 2,
  },
  byline: {
    fontSize: 12,
    color: GlassTheme.inkSubtle,
    marginTop: 6,
    fontFamily: GlassFonts.displayItalic,
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: GlassTheme.ink,
    marginTop: 4,
  },
  emptySub: {
    fontSize: 13,
    color: GlassTheme.inkMuted,
    textAlign: 'center',
    lineHeight: 18,
  },

  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28,30,20,0.45)',
  },
  modalSheet: {
    backgroundColor: GlassTheme.surfaceSolid,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 32,
    gap: 12,
  },
  modalGrabber: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: GlassTheme.inkSubtle,
    opacity: 0.3,
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: GlassTheme.inkSubtle,
  },
  modalTitle: {
    fontFamily: GlassFonts.display,
    fontSize: 26,
    color: GlassTheme.ink,
    letterSpacing: -0.4,
  },
  programChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  chipSelected: { backgroundColor: GlassTheme.primary },
  chipText: { fontSize: 13, color: GlassTheme.inkMuted, fontWeight: '500' },
  chipTextSelected: { color: '#fff', fontWeight: '600' },

  modalInput: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 0.5,
    borderColor: GlassTheme.cardBorder,
    fontSize: 15,
    color: GlassTheme.ink,
  },
  modalInputBody: { minHeight: 110, paddingTop: 12 },

  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  secondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: GlassTheme.primarySoft,
    alignItems: 'center',
  },
  secondaryText: {
    color: GlassTheme.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  primaryWrap: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  primary: {
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  primaryText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
