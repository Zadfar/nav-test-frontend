import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{
      headerTitleAlign: "center",
    }}>
      <Stack.Screen 
        name="index" 
        options={{ title: 'Loan Dashboard' }} 
      />
      <Stack.Screen 
        name="payment" 
        options={{ title: 'Make Payment' }} 
      />
    </Stack>
  );
}