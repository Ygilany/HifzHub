import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface MenuItemProps extends TouchableOpacityProps {
  icon: string;
  label: string;
}

export function MenuItem({ icon, label, style, ...props }: MenuItemProps) {
  const textColor = useThemeColor({}, 'text');
  const cardBackground = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: cardBackground, borderColor }, style]}
      {...props}
    >
      <IconSymbol name={icon} size={20} color={textColor} />
      <ThemedText style={styles.menuItemText}>{label}</ThemedText>
      <IconSymbol name="chevron.right" size={16} color={textColor} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});

