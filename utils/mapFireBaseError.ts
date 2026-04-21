export function mapFirebaseError(code: string): string {
  switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
          return 'Invalid email or password'

      case 'auth/email-already-in-use':
          return 'This email is already registered'

      case 'auth/weak-password':
          return 'Password is too weak (minimum 6 characters)'

      case 'auth/invalid-email':
          return 'Invalid email address'

      case 'auth/user-disabled':
          return 'This account has been disabled'

      case 'auth/too-many-requests':
          return 'Too many attempts. Please try again later'

      case 'auth/network-request-failed':
          return 'Network error. Check your internet connection'

      default:
          return 'Something went wrong. Please try again later'
  }
}
