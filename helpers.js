import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

export async function refreshAccessToken(refreshToken) {
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    console.log("New Access Token:", credentials.access_token);
    return credentials.access_token;
  } catch (error) {
    console.error("Error refreshing access token:", error.message);
  }
}
