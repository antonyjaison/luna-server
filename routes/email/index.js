import { Router } from "express";
import { sendEmailFromUser } from "../../utils.js";
import { refreshAccessToken } from "../../helpers.js";
import prisma from "../../config/prismaClient.js";

const router = Router();

router.post("/", async (req, res) => {
  // Extract refresh token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  const refreshToken = authHeader.split(" ")[1];
  const accessToken = await refreshAccessToken(refreshToken);
  const user = await prisma.user.findUnique({
    where: { refreshToken: refreshToken },
  });

  await sendEmailFromUser({
    refreshToken: refreshToken,
    accessToken: accessToken,
    email: user.email,
    recipient: "21bit191@gecskp.ac.in",
    subject: "I am on leave",
    message: "I have chicken pox",
  });
});

export default router;
