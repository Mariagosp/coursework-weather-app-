import { yupResolver } from '@hookform/resolvers/yup'
import { router } from 'expo-router'
import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ErrorMessage from '../../../components/ErrorMessage'
import { auth } from '../../../firebase'
import { COLORS } from '../../../shared/const/colors'
import { useUserStore } from '../../../shared/store'
import { mapFirebaseError } from '../../../utils/mapFireBaseError'
import { LoginFormData, loginSchema } from './utils'

export default function LoginPage() {
  const [error, setError] = useState('')

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  const setUser = useUserStore((state) => state.setUserData)

  const onSubmit = async (data: LoginFormData) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user

      setUser(user)
    } catch (err) {
      const error = err as FirebaseError

      setError(mapFirebaseError(error.code))
    }
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backLabel}>← Back</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.emoji}>🔐</Text>
              <Text style={styles.title}>Log in</Text>
              <Text style={styles.subtitle}>Enter your email and password to sign in</Text>
            </View>

            <View style={styles.form}>
              <Controller
                control={control}
                name='email'
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.field}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      placeholder='example@mail.com'
                      placeholderTextColor={COLORS.placeholder}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType='email-address'
                      autoCapitalize='none'
                      autoCorrect={false}
                      editable={!isSubmitting}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                  </View>
                )}
              />

              <Controller
                control={control}
                name='password'
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.field}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                      style={[styles.input, errors.password && styles.inputError]}
                      placeholder='••••••••'
                      placeholderTextColor={COLORS.placeholder}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                      editable={!isSubmitting}
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                  </View>
                )}
              />
              <ErrorMessage text={error} />
              <Pressable
                style={({ pressed }) => [styles.submitButton, (pressed || isSubmitting) && styles.submitButtonPressed]}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>{isSubmitting ? 'Signing in...' : 'Log in'}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.main
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 12
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 12
  },
  backLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  keyboardView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 36
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22
  },
  form: {
    gap: 20
  },
  field: {
    gap: 6
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0'
  },
  input: {
    backgroundColor: COLORS.glassWhite,
    borderWidth: 1.5,
    borderColor: 'rgba(248, 250, 252, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text
  },
  inputError: {
    borderColor: COLORS.error
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6
  },
  submitButtonPressed: {
    opacity: 0.9
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.main
  }
})
