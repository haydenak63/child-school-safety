const BRAND = "#1e3a5f";
const CANVAS = "#f6f4f0";
const INK = "#14161c";
const MUTED = "#6b7180";
const SURFACE = "#ffffff";

export type EmailTemplateId = "verify-email" | "reset-password" | "welcome";

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

export function listEmailTemplates(): Array<{
  id: EmailTemplateId;
  name: string;
  description: string;
}> {
  return [
    {
      id: "verify-email",
      name: "Verify email",
      description: "Sent after a school owner registers, with a 48-hour activation link.",
    },
    {
      id: "reset-password",
      name: "Reset password",
      description: "Sent when someone requests a password reset. The link expires in one hour.",
    },
    {
      id: "welcome",
      name: "Welcome",
      description: "Sent after the school owner verifies their email.",
    },
  ];
}

export function renderVerifyEmail(input: {
  appUrl: string;
  token: string;
  schoolName: string;
  ownerName: string;
}): RenderedEmail {
  const url = `${input.appUrl}/verify-email/${input.token}`;
  return wrapEmail({
    subject: `Verify your Halo account for ${input.schoolName}`,
    preview: "Confirm your email to activate your school account.",
    heading: "Verify your email",
    intro: `Hi ${input.ownerName}, welcome to Halo. Confirm this email to activate ${input.schoolName}.`,
    body: "This link expires in 48 hours. If you did not create this account, you can ignore this message.",
    actionLabel: "Verify email",
    actionUrl: url,
    text: [
      `Hi ${input.ownerName},`,
      "",
      `Confirm this email to activate ${input.schoolName} on Halo.`,
      url,
      "",
      "This link expires in 48 hours.",
    ].join("\n"),
  });
}

export function renderResetPassword(input: {
  appUrl: string;
  token: string;
  schoolName: string;
  ownerName: string;
}): RenderedEmail {
  const url = `${input.appUrl}/reset-password/${input.token}`;
  return wrapEmail({
    subject: `Reset your Halo password for ${input.schoolName}`,
    preview: "Use this link within one hour to choose a new password.",
    heading: "Reset your password",
    intro: `Hi ${input.ownerName}, we received a request to reset the Halo password for ${input.schoolName}.`,
    body: "This link expires in one hour and can be used only once. If you did not ask for a reset, you can ignore this message.",
    actionLabel: "Choose a new password",
    actionUrl: url,
    text: [
      `Hi ${input.ownerName},`,
      "",
      `Reset the Halo password for ${input.schoolName}:`,
      url,
      "",
      "This link expires in one hour.",
    ].join("\n"),
  });
}

export function renderWelcome(input: {
  appUrl: string;
  schoolName: string;
  ownerName: string;
}): RenderedEmail {
  const url = `${input.appUrl}/login`;
  return wrapEmail({
    subject: `Welcome to Halo, ${input.schoolName}`,
    preview: "Your school account is ready. Sign in to start recording attendance.",
    heading: "You are verified",
    intro: `Hi ${input.ownerName}, ${input.schoolName} is ready on Halo.`,
    body: "Sign in to add students, enroll fingerprints, and set up gate terminals.",
    actionLabel: "Sign in to Halo",
    actionUrl: url,
    text: [
      `Hi ${input.ownerName},`,
      "",
      `${input.schoolName} is ready on Halo. Sign in:`,
      url,
    ].join("\n"),
  });
}

function wrapEmail(input: {
  subject: string;
  preview: string;
  heading: string;
  intro: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
  text: string;
}): RenderedEmail {
  const html = `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:${CANVAS};color:${INK};font-family:Georgia,'Times New Roman',serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preview)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CANVAS};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${SURFACE};border-radius:20px;overflow:hidden;">
            <tr>
              <td style="background:${BRAND};padding:24px 32px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;letter-spacing:-0.02em;">
                Halo
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${MUTED};">School attendance</p>
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;font-weight:600;color:${INK};">${escapeHtml(input.heading)}</h1>
                <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:${INK};">${escapeHtml(input.intro)}</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${MUTED};">${escapeHtml(input.body)}</p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:12px;background:${BRAND};">
                      <a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;padding:12px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">${escapeHtml(input.actionLabel)}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:${MUTED};word-break:break-all;">If the button does not work, copy this link:<br />${escapeHtml(input.actionUrl)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject: input.subject, html, text: input.text };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
