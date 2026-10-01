"use server";

import { sendContactMessageEmail } from "@/lib/emails/send";
import { ContactFormSchema, type ContactFormState } from "@/lib/definitions";

export async function sendContactMessage(
  _state: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const fields = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  const validatedFields = ContactFormSchema.safeParse(fields);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, fields };
  }

  const { name, email, message } = validatedFields.data;

  const sent = await sendContactMessageEmail(name, email, message);
  if (!sent) {
    return { fields, message: "Votre message n'a pas pu être envoyé. Réessayez plus tard ou écrivez-nous directement par e-mail." };
  }

  return { success: true };
}
