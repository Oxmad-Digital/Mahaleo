"use server";

import { sendContactMessageEmail } from "@/lib/emails/send";
import { ContactFormSchema, type ContactFormState } from "@/lib/definitions";

export async function sendContactMessage(
  _state: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = ContactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, message } = validatedFields.data;

  await sendContactMessageEmail(name, email, message);

  return { success: true };
}
