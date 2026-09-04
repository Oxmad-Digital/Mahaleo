import * as z from "zod";

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { error: "Le nom doit contenir au moins 2 caractères." })
    .trim(),
  email: z.email({ error: "Veuillez saisir une adresse e-mail valide." }).trim(),
  password: z
    .string()
    .min(8, { error: "8 caractères minimum." })
    .regex(/[a-zA-Z]/, { error: "Doit contenir au moins une lettre." })
    .regex(/[0-9]/, { error: "Doit contenir au moins un chiffre." }),
});

export type SignupFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const LoginFormSchema = z.object({
  email: z.email({ error: "Veuillez saisir une adresse e-mail valide." }).trim(),
  password: z.string().min(1, { error: "Le mot de passe est requis." }),
});

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
