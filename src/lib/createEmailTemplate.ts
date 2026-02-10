import type { EmailType, Announcement } from "./types.js";
const unsubscribeUrl = "";
const BASE_URL = process.env.BASE_URL || "";

export const createEmailTemplate = (
  announcement: Announcement,
  type: EmailType,
) => {
  switch (type) {
    case "admin":
      const approval_url =
        BASE_URL +
        "/admin/approve-announcement?token=" +
        announcement.approval_token;
      return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <title>HL3 Announcement Approval</title>
                </head>
                <body style="margin:0;padding:0;background-color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding:40px 16px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#020617;border-radius:8px;overflow:hidden;">
                        <!-- Header -->
                        <tr>
                        <td style="padding:24px;background:linear-gradient(135deg,#2563eb,#1e40af);color:#ffffff;">
                            <h1 style="margin:0;font-size:22px;">
                            🚨 Half-Life 3 Alert
                            </h1>
                            <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">
                            New announcement detected
                            </p>
                        </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                        <td style="padding:24px;color:#e5e7eb;">
                            <p style="margin:0 0 12px;font-size:15px;">
                            A new announcement related to <strong>Half-Life 3</strong> has been detected by the monitoring system.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background-color:#020617;border:1px solid #1e293b;border-radius:6px;">
                            <tr>
                                <td style="padding:16px;">
                                <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;">
                                    Title
                                </p>
                                <p style="margin:0 0 12px;font-size:16px;font-weight:bold;">
                                    ${announcement.title}
                                </p>

                                <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;">
                                    Source
                                </p>
                                <p style="margin:0;font-size:14px;">
                                    <a href="${announcement.url}" target="_blank" style="color:#60a5fa;text-decoration:none;">
                                    View original announcement →
                                    </a>
                                </p>
                                </td>
                            </tr>
                            </table>

                            <p style="margin:16px 0;font-size:14px;color:#cbd5f5;">
                            If this announcement is legitimate, approve it to notify all subscribed users.
                            </p>

                            <!-- CTA -->
                            <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
                            <tr>
                                <td align="center">
                                <a
                                    href="${approval_url}"
                                    style="
                                    display:inline-block;
                                    padding:14px 22px;
                                    background-color:#22c55e;
                                    color:#022c22;
                                    font-weight:bold;
                                    font-size:15px;
                                    text-decoration:none;
                                    border-radius:6px;
                                    "
                                >
                                    ✅ Approve & Send Emails
                                </a>
                                </td>
                            </tr>
                            </table>

                            <p style="margin:0;font-size:12px;color:#94a3b8;">
                            ⚠️ This link can only be used once.  
                            If you did not expect this email, do not take any action.
                            </p>
                        </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                        <td style="padding:16px;background-color:#020617;color:#64748b;font-size:12px;text-align:center;border-top:1px solid #1e293b;">
                            HL3 Alert System · Automated monitoring
                        </td>
                        </tr>

                    </table>
                    </td>
                </tr>
                </table>
                </body>
                </html>
`;
    case "subscriber":
      return `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Half-Life 3 Alert</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #000000;">
        <tr>
        <td style="padding: 20px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #0a0a0a; border: 1px solid #1a1a1a;">
            
            <!-- Header -->
            <tr>
                <td style="padding: 30px 40px; border-bottom: 1px solid #1a1a1a;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                    <td>
                        <span style="font-size: 24px; font-weight: 700; color: #ff8c00; letter-spacing: 2px;">λ TIME-LIFE 3</span>
                    </td>
                    </tr>
                </table>
                </td>
            </tr>

            <!-- Breaking News Badge -->
            <tr>
                <td style="padding: 30px 40px 0 40px;">
                <span style="display: inline-block; background-color: transparent; color: #ff8c00; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 0;">
                    BREAKING NEWS
                </span>
                </td>
            </tr>

            <!-- Main Content -->
            <tr>
                <td style="padding: 15px 40px 30px 40px;">
                <h1 style="margin: 0 0 20px 0; font-size: 36px; font-weight: 700; color: #ff8c00; line-height: 1.2;">
                    ${announcement.title}
                </h1>
                <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; color: #b8b8b8;">
                    The moment you've been waiting for has arrived. A new Half-Life 3 update has just been reported, and we wanted you to be among the first to know.
                </p>
                
                <!-- CTA Button -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                    <td style="border-radius: 4px; background-color: #ff8c00;">
                        <a href="${announcement.url}" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #000000; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">
                        Read Full Story ⮕
                        </a>
                    </td>
                    </tr>
                </table>
                </td>
            </tr>

            <!-- Divider -->
            <tr>
                <td style="padding: 0 40px;">
                <div style="border-top: 1px solid #1a1a1a;"></div>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="padding: 30px 40px;">
                <p style="margin: 0 0 15px 0; font-size: 13px; line-height: 1.5; color: #666666;">
                    You're receiving this email because you subscribed to Half-Life 3 alerts on TIME-LIFE 3. We'll only contact you when there's breaking news about Half-Life 3.
                </p>
                <p style="margin: 0; font-size: 12px; color: #555555;">
                    <a href="${unsubscribeUrl}" style="color: #ff8c00; text-decoration: underline;">Unsubscribe from alerts</a>
                </p>
                </td>
            </tr>

            </table>
        </td>
        </tr>
    </table>
    </body>
    </html>`;
  }
};
