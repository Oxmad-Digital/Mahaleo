const PLUNK_API_URL = "https://api.useplunk.com/v1/send";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  body: string;
  from?: string;
  name?: string;
};

export async function sendEmail(input: SendEmailInput) {
  const res = await fetch(PLUNK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PLUNK_SECRET_KEY}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Plunk: échec de l'envoi de l'e-mail (${res.status}): ${error}`);
  }

  return res.json();
}
