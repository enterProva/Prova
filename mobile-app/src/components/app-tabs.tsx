import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[(scheme === 'dark' || scheme === 'light' ? scheme : 'light') as 'light' | 'dark'];

  return null;
}
