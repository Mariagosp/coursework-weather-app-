import { router } from 'expo-router'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '../../../shared/const/colors'

export default function GetStartedPage() {
  const { width } = useWindowDimensions()

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={[styles.circleSun, { right: width * 0.1 }]} />
        <View style={[styles.circleSoft, { left: -width * 0.2, top: '18%' }]} />
        <View style={[styles.circleSoft, { right: -width * 0.15, top: '45%' }]} />

        <View style={styles.content}>
          <View style={styles.hero}>
            <Text style={styles.emoji}>🌤️</Text>
            <Text style={styles.title}>Weather at hand</Text>
            <Text style={styles.subtitle}>
              Get the forecast anywhere in the world and plan your day with ease.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.buttonPrimary,
                pressed && styles.buttonPrimaryPressed,
              ]}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.buttonPrimaryText}>Log in</Text>
            </Pressable>

            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonSecondaryText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.main,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  circleSun: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    top: '12%',
  },
  circleSoft: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 60,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 48,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 8,
    maxWidth: 320,
  },
  actions: {
    gap: 14,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonPrimaryPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonPrimaryText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.main,
  },
  buttonSecondary: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(248, 250, 252, 0.35)',
    backgroundColor: COLORS.glassWhiteSoft,
  },
  buttonSecondaryText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
})
