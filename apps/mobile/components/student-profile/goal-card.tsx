import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';

interface GoalCardProps {
  type: 'SEMESTER' | 'ANNUAL' | 'CUSTOM';
  title: string;
  description?: string | null;
  progress: number;
  status: string;
  endDate: Date | string;
}

export function GoalCard({ type, title, description, progress, status, endDate }: GoalCardProps) {
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const mutedColor = useThemeColor({}, 'mutedForeground');
  const tintColor = useThemeColor({}, 'tint');

  const getTypeConfig = () => {
    switch (type) {
      case 'SEMESTER':
        return { icon: 'calendar' as const, color: '#8B5CF6', label: 'Semester Goal' };
      case 'ANNUAL':
        return { icon: 'ribbon' as const, color: '#F59E0B', label: 'Annual Goal' };
      default:
        return { icon: 'flag' as const, color: '#10B981', label: 'Custom Goal' };
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'COMPLETED':
        return '#10B981';
      case 'IN_PROGRESS':
        return '#3B82F6';
      case 'OVERDUE':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const config = getTypeConfig();
  const statusColor = getStatusColor();
  const daysLeft = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}>
          <Ionicons name={config.icon} size={18} color={config.color} />
        </View>
        <View style={styles.headerText}>
          <ThemedText style={[styles.typeLabel, { color: config.color }]}>{config.label}</ThemedText>
          <ThemedText style={styles.title} numberOfLines={1}>{title}</ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          <ThemedText style={[styles.statusText, { color: statusColor }]}>
            {status === 'IN_PROGRESS' ? 'Active' : status.toLowerCase().replace('_', ' ')}
          </ThemedText>
        </View>
      </View>

      {description && (
        <ThemedText style={[styles.description, { color: mutedColor }]} numberOfLines={2}>
          {description}
        </ThemedText>
      )}

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <ThemedText style={styles.progressLabel}>Progress</ThemedText>
          <ThemedText style={styles.progressValue}>{progress}%</ThemedText>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(progress, 100)}%`, backgroundColor: tintColor },
            ]}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={14} color={mutedColor} />
          <ThemedText style={[styles.footerText, { color: mutedColor }]}>
            {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 13,
    marginTop: 12,
    lineHeight: 18,
  },
  progressSection: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
});
