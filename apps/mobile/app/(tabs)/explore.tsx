import { Avatar, MenuItem } from '@/components/profile';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/lib/auth/context';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
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
          <Avatar name={user?.name} size={80} />
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

          <MenuItem icon="person.fill" label="Edit Profile" />
          <MenuItem icon="bell.fill" label="Notifications" />
          <MenuItem icon="lock.fill" label="Privacy & Security" />
        </ThemedView>

        {/* App Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            App
          </ThemedText>

          <MenuItem icon="questionmark.circle.fill" label="Help & Support" onPress={() => router.push('/help')} />
          <MenuItem icon="info.circle.fill" label="About" onPress={() => router.push('/about')} />
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
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
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
