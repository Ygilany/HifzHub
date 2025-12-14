import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            About HifzHub
          </ThemedText>
          <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Our Mission
          </ThemedText>
          <ThemedText style={styles.sectionText}>
            HifzHub is a comprehensive Quran Hifz (memorization) management platform designed to
            help teachers, students, and parents work together in the journey of memorizing the
            Holy Quran.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Features
          </ThemedText>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={[styles.featureBullet, { backgroundColor: tintColor }]} />
              <ThemedText style={styles.featureText}>
                Track student progress and attendance
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureBullet, { backgroundColor: tintColor }]} />
              <ThemedText style={styles.featureText}>
                Record teaching sessions and assignments
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureBullet, { backgroundColor: tintColor }]} />
              <ThemedText style={styles.featureText}>
                Monitor mistakes and areas for improvement
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureBullet, { backgroundColor: tintColor }]} />
              <ThemedText style={styles.featureText}>
                Parent portal for progress monitoring
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureBullet, { backgroundColor: tintColor }]} />
              <ThemedText style={styles.featureText}>
                Interactive Quran viewer with annotations
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Contact & Support
          </ThemedText>
          <ThemedText style={styles.sectionText}>
            For support or feedback, please contact us at:
          </ThemedText>
          <ThemedText style={[styles.contactText, { color: tintColor }]}>
            support@hifzhub.com
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            © 2025 HifzHub. All rights reserved.
          </ThemedText>
          <ThemedText style={styles.footerText}>
            Made with care for the Ummah
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    opacity: 0.6,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    opacity: 0.8,
  },
  contactText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.5,
    marginBottom: 4,
  },
});
