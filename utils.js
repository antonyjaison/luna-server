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
    `To: ${user.recipient}`,
    `Subject: ${user.subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    `${user.message}`,
  ].join("\n");

  const encodedEmail = Buffer.from(emailContent)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  await gmail.users.messages.send({
    userId: "me", // This means "the authenticated user"
    requestBody: { raw: encodedEmail },
  });

  return true;
}
