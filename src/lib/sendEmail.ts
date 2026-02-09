import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const from = process.env.FROM_EMAIL || "alerts@example.com";
  const baseUrl = process.env.BASE_URL || "";

  const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(
    to
  )}`;

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html
  });

  if (error) {
    throw error;
  }
}
