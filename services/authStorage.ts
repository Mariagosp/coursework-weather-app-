import * as SecureStore from 'expo-secure-store'

const AUTH_TOKEN_KEY = 'auth_id_token'

export async function saveAuthToken(token: string) {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK
  })
}

export async function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(AUTH_TOKEN_KEY)
}

export async function removeAuthToken() {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY)
}
