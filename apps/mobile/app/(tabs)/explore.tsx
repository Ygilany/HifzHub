import { ScrollView, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/lib/auth/context';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#38383a' }, 'text');

  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Navigation will be handled automatically by AuthProvider
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top']}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <View style={[styles.avatarContainer, { backgroundColor: tintColor }]}>
            <ThemedText style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </ThemedText>
          </View>
          <ThemedText type="title" style={styles.userName}>
            {user?.name || 'User'}
          </ThemedText>
          <ThemedText style={styles.userEmail}>{user?.email || 'user@example.com'}</ThemedText>
          <View style={[styles.roleBadge, { backgroundColor: `${tintColor}20` }]}>
            <ThemedText style={[styles.roleText, { color: tintColor }]}>
              {user?.role || 'USER'}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Account Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Account
          </ThemedText>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: cardBackground, borderColor }]}
          >
            <IconSymbol name="person.fill" size={20} color={textColor} />
            <ThemedText style={styles.menuItemText}>Edit Profile</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={textColor} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: cardBackground, borderColor }]}
          >
            <IconSymbol name="bell.fill" size={20} color={textColor} />
            <ThemedText style={styles.menuItemText}>Notifications</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={textColor} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: cardBackground, borderColor }]}
          >
            <IconSymbol name="lock.fill" size={20} color={textColor} />
            <ThemedText style={styles.menuItemText}>Privacy & Security</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={textColor} style={styles.chevron} />
          </TouchableOpacity>
        </ThemedView>

        {/* App Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            App
          </ThemedText>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: cardBackground, borderColor }]}
          >
            <IconSymbol name="questionmark.circle.fill" size={20} color={textColor} />
            <ThemedText style={styles.menuItemText}>Help & Support</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={textColor} style={styles.chevron} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: cardBackground, borderColor }]}
          >
            <IconSymbol name="info.circle.fill" size={20} color={textColor} />
            <ThemedText style={styles.menuItemText}>About</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={textColor} style={styles.chevron} />
          </TouchableOpacity>
        </ThemedView>

        {/* Logout Button */}
        <ThemedView style={styles.section}>
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: '#ef4444' }]}
            onPress={handleLogout}
          >
            <IconSymbol name="arrow.right.square.fill" size={20} color="#ef4444" />
            <ThemedText style={[styles.logoutText, { color: '#ef4444' }]}>Logout</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* App Version */}
        <ThemedView style={styles.footer}>
          <ThemedText style={styles.versionText}>HifzHub v1.0.0</ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  chevron: {
    opacity: 0.4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
    opacity: 0.4,
  },
});
