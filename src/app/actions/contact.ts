"use server";

import { sendContactMessageEmail } from "@/lib/emails/send";
import { HOUR, clientIp, rateLimit } from "@/lib/rate-limit";
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

  if (!(await rateLimit(`contact:ip:${await clientIp()}`, 5, HOUR))) {
    return { fields, message: "Vous avez envoyé plusieurs messages récemment. Réessayez dans une heure." };
  }

  const sent = await sendContactMessageEmail(name, email, message);
  if (!sent) {
    return { fields, message: "Votre message n'a pas pu être envoyé. Réessayez plus tard ou écrivez-nous directement par e-mail." };
  }

  return { success: true };
}
