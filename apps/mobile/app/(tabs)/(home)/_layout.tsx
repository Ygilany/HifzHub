import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="classes" />
      <Stack.Screen name="students" />
      <Stack.Screen name="class/[id]" />
      <Stack.Screen name="student/[id]" />
    </Stack>
  );
}
