import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon
          src={{
            default: <VectorIcon family={Ionicons} name="home-outline" />,
            selected: <VectorIcon family={Ionicons} name="home" />,
          }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reader">
        <Label>Quran</Label>
        <Icon
          src={{
            default: <VectorIcon family={Ionicons} name="book-outline" />,
            selected: <VectorIcon family={Ionicons} name="book" />,
          }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <Label>Profile</Label>
        <Icon
          src={{
            default: <VectorIcon family={Ionicons} name="person-outline" />,
            selected: <VectorIcon family={Ionicons} name="person" />,
          }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
