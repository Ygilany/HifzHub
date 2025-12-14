import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HelpScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@hifzhub.com');
  };

  const handleVisitWebsite = () => {
    Linking.openURL('https://hifzhub.com');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Help & Support
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            We're here to help you with any questions or issues
          </ThemedText>
        </ThemedView>

        {/* Contact Options */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Contact Us
          </ThemedText>

          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: cardBackground, borderColor }]}
            onPress={handleEmailSupport}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${tintColor}20` }]}>
              <IconSymbol name="envelope.fill" size={24} color={tintColor} />
            </View>
            <View style={styles.contactInfo}>
              <ThemedText style={styles.contactLabel}>Email Support</ThemedText>
              <ThemedText style={styles.contactValue}>support@hifzhub.com</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={tintColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: cardBackground, borderColor }]}
            onPress={handleVisitWebsite}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${tintColor}20` }]}>
              <IconSymbol name="globe" size={24} color={tintColor} />
            </View>
            <View style={styles.contactInfo}>
              <ThemedText style={styles.contactLabel}>Visit Website</ThemedText>
              <ThemedText style={styles.contactValue}>hifzhub.com</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={tintColor} />
          </TouchableOpacity>
        </ThemedView>

        {/* FAQs */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Frequently Asked Questions
          </ThemedText>

          <View style={[styles.faqCard, { backgroundColor: cardBackground, borderColor }]}>
            <ThemedText style={styles.faqQuestion}>How do I track student progress?</ThemedText>
            <ThemedText style={styles.faqAnswer}>
              Navigate to the student's profile from the Home tab. You'll see their complete
              history of sessions, assignments, and progress metrics.
            </ThemedText>
          </View>

          <View style={[styles.faqCard, { backgroundColor: cardBackground, borderColor }]}>
            <ThemedText style={styles.faqQuestion}>How do I record a new session?</ThemedText>
            <ThemedText style={styles.faqAnswer}>
              Tap on a student card from the Home tab, then use the "Record Session" button to log
              attendance, assignments, and any mistakes made during the lesson.
            </ThemedText>
          </View>

          <View style={[styles.faqCard, { backgroundColor: cardBackground, borderColor }]}>
            <ThemedText style={styles.faqQuestion}>
              Can parents view their child's progress?
            </ThemedText>
            <ThemedText style={styles.faqAnswer}>
              Yes! Parents with a parent account can log in and view their children's progress,
              including session history, assignments, and areas for improvement.
            </ThemedText>
          </View>

          <View style={[styles.faqCard, { backgroundColor: cardBackground, borderColor }]}>
            <ThemedText style={styles.faqQuestion}>How do I manage my classes?</ThemedText>
            <ThemedText style={styles.faqAnswer}>
              From the Home tab, you can view all your classes, add new students, and organize them
              into different programs and class groups.
            </ThemedText>
          </View>
        </ThemedView>

        {/* Need More Help */}
        <ThemedView style={styles.section}>
          <View style={[styles.helpBox, { backgroundColor: `${tintColor}10`, borderColor: tintColor }]}>
            <ThemedText style={styles.helpBoxTitle}>Still need help?</ThemedText>
            <ThemedText style={styles.helpBoxText}>
              Our support team is ready to assist you with any questions or technical issues you may
              encounter.
            </ThemedText>
            <TouchableOpacity
              style={[styles.helpButton, { backgroundColor: tintColor }]}
              onPress={handleEmailSupport}
            >
              <IconSymbol name="envelope.fill" size={18} color="#ffffff" />
              <ThemedText style={styles.helpButtonText}>Contact Support</ThemedText>
            </TouchableOpacity>
          </View>
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
    paddingVertical: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    opacity: 0.6,
  },
  faqCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },
  helpBox: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  helpBoxTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  helpBoxText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
});
