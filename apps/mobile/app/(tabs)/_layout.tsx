import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { Platform } from 'react-native';

import { GlassTheme } from '@/constants/glass-theme';

export default function TabLayout() {
  return (
    <NativeTabs minimizeBehavior={`automatic`} tintColor={GlassTheme.primary}>
      <NativeTabs.Trigger name="(home)">
        <Label>Home</Label>
        {
          Platform.select({
            ios: <Icon sf={{ default: "house", selected: "house.fill" }} />,
            android: <Icon src={{ 
              default: <VectorIcon family={MaterialIcons} name="home" />, 
              selected: <VectorIcon family={MaterialIcons} name="home" /> 
            }} />,
          })
        }
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="new-session" role="search">
        <Label>New Session</Label>
        {
          Platform.select({
            ios: <Icon sf={{ default: "plus.circle", selected: "plus.circle.fill" }} />,
            android: <Icon src={{ 
              default: <VectorIcon family={MaterialIcons} name="add" />, 
              selected: <VectorIcon family={MaterialIcons} name="add" /> 
            }} />,
          })
        }
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reader">
        <Label>Quran</Label>
        {
          Platform.select({
            ios: <Icon sf={{ default: "book", selected: "book.fill" }} />,
            android: <Icon src={{ 
              default: <VectorIcon family={MaterialIcons} name="book" />,
              selected: <VectorIcon family={MaterialIcons} name="book" />
            }} />,
          })
        }
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
