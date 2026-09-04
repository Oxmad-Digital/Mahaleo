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

export const ProductFormSchema = z.object({
  name: z.string().min(2, { error: "Le nom doit contenir au moins 2 caractères." }).trim(),
  slug: z
    .string()
    .min(2, { error: "Le slug doit contenir au moins 2 caractères." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      error: "Le slug ne doit contenir que des lettres minuscules, des chiffres et des tirets.",
    })
    .trim(),
  description: z.string().trim().optional(),
  price: z
    .string()
    .trim()
    .regex(/^\d+([.,]\d{1,2})?$/, { error: "Veuillez saisir un prix valide, ex. 49.90." }),
  stock: z
    .string()
    .trim()
    .regex(/^\d+$/, { error: "Veuillez saisir un stock valide." }),
  images: z.string().trim().optional(),
});

export type ProductFormState =
  | {
      errors?: {
        name?: string[];
        slug?: string[];
        description?: string[];
        price?: string[];
        stock?: string[];
        images?: string[];
      };
      message?: string;
    }
  | undefined;
