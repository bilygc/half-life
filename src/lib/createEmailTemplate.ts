import type { EmailType, Announcement } from "./types.js";
const unsubscribeUrl = "";
const BASE_URL = process.env.BASE_URL || "";

export const createEmailTemplate = (announcement: Announcement, type: EmailType) => {
    switch (type) {
        case "admin":
            const approval_url = BASE_URL + "/admin/approve-announcement?token=" + announcement.approval_token;
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
                                    href="${approval_url}}"
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
            return `
            <div style="font-family: Arial, sans-serif; line-height:1.6">
                <h2>🚨 Half-Life 3 Announcement</h2>

                <p>
                A new announcement related to <strong>Half-Life 3</strong> has just been published:
                </p>

                <p>
                <strong>${announcement.title}</strong>
                </p>

                <p>
                <a href="${announcement.url}" target="_blank">
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
    }
}