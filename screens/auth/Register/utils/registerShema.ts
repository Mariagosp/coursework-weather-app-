import * as yup from 'yup'

export const registerSchema = yup.object({
    email: yup.string().required('Email is required').email('Invalid email'),
    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    confirmPassword: yup
        .string()
        .required('Confirm your password')
        .oneOf([yup.ref('password')], 'Passwords do not match')
})

export type RegisterFormData = yup.InferType<typeof registerSchema>

