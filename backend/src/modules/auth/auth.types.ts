import { z } from 'zod';


export const registerRequestSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.email(),
    password: z.string(),
    passwordConfirm: z.string()
  })
})
.refine((data) => data.body.password === data.body.passwordConfirm, {
  message: "Password mismatch",
  path: ["confirmPassword"],
});

export type UserRegisterDto = z.infer<typeof registerRequestSchema>['body'];


export const loginRequestSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string()
  })
});

export type UserLoginDto = z.infer<typeof loginRequestSchema>['body'];