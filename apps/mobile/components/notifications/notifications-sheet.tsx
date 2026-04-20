import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GlassFonts, GlassTheme } from '@/constants/glass-theme';

type NotifIcon = 'checkmark' | 'mic-outline' | 'calendar-outline' | 'flame-outline' | 'notifications-outline';

interface Notif {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: NotifIcon;
}

const SEED: Notif[] = [
  {
    id: '1',
    title: 'Parent check-in confirmed',
    body: "Ahmad's mother confirmed he completed today's revision.",
    time: '10m ago',
    read: false,
    icon: 'checkmark',
  },
  {
    id: '2',
    title: 'New recording submitted',
    body: 'Yusuf submitted his recitation of Al-Mulk 11–20.',
    time: '42m ago',
    read: false,
    icon: 'mic-outline',
  },
  {
    id: '3',
    title: 'Session in 30 minutes',
    body: 'Grade 5 Boys · 4:00 PM · Classroom A',
    time: '1h ago',
    read: true,
    icon: 'calendar-outline',
  },
  {
    id: '4',
    title: 'New recording submitted',
    body: 'Zainab submitted her recitation of Al-Mulk 1–5.',
    time: '2h ago',
    read: true,
    icon: 'mic-outline',
  },
  {
    id: '5',
    title: 'Streak milestone',
    body: 'Yusuf Mahmoud has hit a 41-day streak.',
    time: 'Yesterday',
    read: true,
    icon: 'flame-outline',
  },
  {
    id: '6',
    title: 'Missed check-in',
    body: "Ibrahim's parent hasn't confirmed today's homework yet.",
    time: 'Yesterday',
    read: true,
    icon: 'notifications-outline',
  },
];

interface NotificationsSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationsSheet({ visible, onClose }: NotificationsSheetProps) {
  const [items, setItems] = useState<Notif[]>(SEED);

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetClip}>
          {Platform.OS === 'ios' && (
            <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
          )}
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(255,253,245,0.82)' },
            ]}
          />

          <View style={styles.grabber} />

          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Notifications</Text>
              {unread > 0 && (
                <Text style={styles.unread}>{unread} unread</Text>
              )}
            </View>
            <Pressable onPress={markAllRead} hitSlop={8}>
              <Text style={styles.markAll}>Mark all read</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {items.map((n, i) => (
              <View
                key={n.id}
                style={[
                  styles.row,
                  !n.read && { backgroundColor: GlassTheme.primarySoft },
                  i < items.length - 1 && styles.rowDivider,
                ]}
              >
                {n.read ? (
                  <View style={styles.iconReadPill}>
                    <Ionicons name={n.icon} size={18} color={GlassTheme.inkMuted} />
                  </View>
                ) : (
                  <LinearGradient
                    colors={[GlassTheme.primaryGlass, GlassTheme.primary]}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={styles.iconUnreadPill}
                  >
                    <Ionicons name={n.icon} size={18} color="#fff" />
                  </LinearGradient>
                )}

                <View style={styles.body}>
                  <Text style={[styles.itemTitle, !n.read && styles.itemTitleUnread]}>
                    {n.title}
                  </Text>
                  <Text style={styles.itemBody}>{n.body}</Text>
                  <Text style={styles.itemTime}>{n.time}</Text>
                </View>

                {!n.read && <View style={styles.unreadDot} />}
              </View>
            ))}
            <View style={{ height: 12 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheetClip: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    maxHeight: '80%',
    borderTopWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: -10 },
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: GlassTheme.inkSubtle,
    opacity: 0.3,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GlassTheme.line,
  },
  title: {
    fontFamily: GlassFonts.display,
    fontSize: 26,
    fontWeight: '500',
    letterSpacing: -0.4,
    color: GlassTheme.ink,
  },
  unread: {
    fontSize: 12,
    color: GlassTheme.inkMuted,
    marginTop: 2,
  },
  markAll: {
    fontSize: 13,
    fontWeight: '600',
    color: GlassTheme.primary,
  },
  list: { paddingTop: 8, paddingBottom: 18 },
  row: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GlassTheme.line,
  },
  iconReadPill: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUnreadPill: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  body: { flex: 1, minWidth: 0 },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: GlassTheme.ink,
  },
  itemTitleUnread: { fontWeight: '700' },
  itemBody: {
    fontSize: 12,
    color: GlassTheme.inkMuted,
    marginTop: 3,
    lineHeight: 17,
  },
  itemTime: {
    fontSize: 11,
    color: GlassTheme.inkSubtle,
    marginTop: 5,
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GlassTheme.accent,
    marginTop: 6,
  },
});
