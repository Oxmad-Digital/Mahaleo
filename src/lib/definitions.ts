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

export const RequestPasswordResetSchema = z.object({
  email: z.email({ error: "Veuillez saisir une adresse e-mail valide." }).trim(),
});

export type RequestPasswordResetState =
  | {
      errors?: { email?: string[] };
      message?: string;
      success?: boolean;
    }
  | undefined;

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { error: "8 caractères minimum." })
      .regex(/[a-zA-Z]/, { error: "Doit contenir au moins une lettre." })
      .regex(/[0-9]/, { error: "Doit contenir au moins un chiffre." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type ResetPasswordState =
  | {
      errors?: { password?: string[]; confirmPassword?: string[] };
      message?: string;
    }
  | undefined;

const ProductSizeEntrySchema = z.object({
  size: z.string().trim().min(1),
  stock: z.string().trim().regex(/^\d+$/),
});

export type ProductSizeEntry = z.infer<typeof ProductSizeEntrySchema>;

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
  images: z.string().trim().optional(),
  sizes: z
    .string()
    .trim()
    .transform((raw, ctx) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }
      const result = z.array(ProductSizeEntrySchema).safeParse(parsed);
      if (!result.success || result.data.length === 0) {
        ctx.addIssue({ code: "custom", message: "Ajoutez au moins une taille avec un stock valide." });
        return z.NEVER;
      }
      const seen = new Set<string>();
      for (const entry of result.data) {
        const key = entry.size.toLowerCase();
        if (seen.has(key)) {
          ctx.addIssue({ code: "custom", message: "Les tailles doivent être uniques." });
          return z.NEVER;
        }
        seen.add(key);
      }
      return result.data;
    }),
  onSale: z
    .union([z.literal("on"), z.undefined()])
    .optional()
    .transform((v) => v === "on"),
  salePrice: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^\d+([.,]\d{1,2})?$/.test(v), { error: "Veuillez saisir un prix valide, ex. 39.90." }),
}).refine((data) => !data.onSale || Boolean(data.salePrice), {
  error: "Indiquez un prix promotionnel.",
  path: ["salePrice"],
});

export type ProductFormState =
  | {
      errors?: {
        name?: string[];
        slug?: string[];
        description?: string[];
        price?: string[];
        images?: string[];
        sizes?: string[];
        salePrice?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export const ClientFormSchema = z.object({
  name: z.string().trim().optional(),
  email: z.email({ error: "Veuillez saisir une adresse e-mail valide." }).trim(),
});

export type ClientFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
      };
      message?: string;
    }
  | undefined;

export const InviteAdminSchema = z.object({
  name: z
    .string()
    .min(2, { error: "Le nom doit contenir au moins 2 caractères." })
    .trim(),
  email: z.email({ error: "Veuillez saisir une adresse e-mail valide." }).trim(),
});

export type InviteAdminState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export const CheckoutFormSchema = z.object({
  name: z.string().min(2, { error: "Le nom doit contenir au moins 2 caractères." }).trim(),
  email: z.email({ error: "Veuillez saisir une adresse e-mail valide." }).trim(),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
  address: z.string().min(5, { error: "Veuillez saisir une adresse complète." }).trim(),
  city: z.string().min(2, { error: "Veuillez saisir une ville." }).trim(),
  postalCode: z.string().min(4, { error: "Code postal invalide." }).trim(),
  country: z.string().min(2, { error: "Veuillez saisir un pays." }).trim(),
});

export type CheckoutFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        phone?: string[];
        address?: string[];
        city?: string[];
        postalCode?: string[];
        country?: string[];
      };
      message?: string;
    }
  | undefined;

export const ContactFormSchema = z.object({
  name: z.string().min(2, { error: "Le nom doit contenir au moins 2 caractères." }).trim(),
  email: z.email({ error: "Veuillez saisir une adresse e-mail valide." }).trim(),
  message: z.string().min(10, { error: "Votre message doit contenir au moins 10 caractères." }).trim(),
});

export type ContactFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        message?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;
