import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(64, 'Name must be 64 characters or less'),
    email: z.string().trim().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match'
  });

export type LoginDto = z.infer<typeof loginSchema>;
export type SignupDto = z.infer<typeof signupSchema>;
