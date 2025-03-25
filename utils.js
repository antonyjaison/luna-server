import { google } from "googleapis";

export async function sendEmailFromUser(user) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const emailContent = [
    `From: ${user.email}`,
    "To: antonyjaison456@gmail.com",
    "Subject: Test Email",
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    "Hello, this is a test email sent via Gmail API.",
  ].join("\n");

  const encodedEmail = Buffer.from(emailContent)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  await gmail.users.messages.send({
    userId: "me", // This means "the authenticated user"
    requestBody: { raw: encodedEmail },
  });

  console.log("✅ Email sent successfully!");
}
