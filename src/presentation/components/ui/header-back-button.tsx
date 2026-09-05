import Ionicons from '@expo/vector-icons/Ionicons';
import { type Href } from 'expo-router';
import { Pressable } from 'react-native';

import { goBackOr } from '@/shared/utils/navigation';

type Props = {
  fallbackHref: Href;
};

/**
 * Replaces the Stack header's default back button so it always lands on the
 * screen's logical parent, even after a fresh page load / refresh where
 * there's no navigation history to go back through.
 */
export function HeaderBackButton({ fallbackHref }: Props) {
  return (
    <Pressable
      onPress={() => goBackOr(fallbackHref)}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Volver"
      style={{ paddingHorizontal: 12, paddingVertical: 8 }}
    >
      <Ionicons name="arrow-back" size={24} color="#0f172a" />
    </Pressable>
  );
}
