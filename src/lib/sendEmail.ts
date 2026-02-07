import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type Article = {
  title: string;
  url: string;
  publishedAt?: string;
};

export async function sendEmail(
  to: string,
  article: Article
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
    subject: "🚨 Half-Life 3 has been announced!",
    html: `
      <div style="font-family: Arial, sans-serif; line-height:1.6">
        <h2>🚨 Half-Life 3 Announcement</h2>

        <p>
          A new announcement related to <strong>Half-Life 3</strong> has just been published:
        </p>

        <p>
          <strong>${article.title}</strong>
        </p>

        <p>
          <a href="${article.url}" target="_blank">
            👉 Read the full announcement
          </a>
        </p>

        <hr />

        <p style="font-size:12px;color:#666">
          You are receiving this email because you subscribed to Half-Life 3 alerts.
          <br />
          <a href="${unsubscribeUrl}">
            Unsubscribe
          </a>
        </p>
      </div>
    `
  });

  if (error) {
    throw error;
  }
}
