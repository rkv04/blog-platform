import { z } from 'zod';


export const registerRequestSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string(),
  passwordConfirm: z.string()
})
.refine((data) => data.password === data.passwordConfirm, {
  message: "Password mismatch",
  path: ["confirmPassword"],
});

export type UserRegisterDto = z.infer<typeof registerRequestSchema>;


export const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string()
});

export type UserLoginDto = z.infer<typeof loginRequestSchema>;