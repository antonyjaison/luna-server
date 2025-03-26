import { Router } from "express";
import { sendEmailFromUser } from "../../utils.js";
import { refreshAccessToken } from "../../helpers.js";
import prisma from "../../config/prismaClient.js";
import { emailTemplate } from "./prompt.js";
import { PromptTemplate } from "@langchain/core/prompts";
import { g_model } from "../../llm-config.js";

const router = Router();

router.post("/generate-email", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  const refreshToken = authHeader.split(" ")[1];
  const user = await prisma.user.findUnique({
    where: { refreshToken: refreshToken },
  });

  const { task } = req.body;

  const promptTemplate = new PromptTemplate({
    template: emailTemplate,
    inputVariables: ["task", "sender_name"],
  });

  console.log(user);

  const formattedPrompt = await promptTemplate.format({
    task,
    sender_name: user.displayName,
  });
  const response = await g_model.invoke([["human", formattedPrompt]]);

  res.send({
    response: response,
  });
});

router.post("/send", async (req, res) => {
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

  const { subject, body, senderEmail, recipientEmail } = req.body;

  const emailStatus = await sendEmailFromUser({
    refreshToken: refreshToken,
    accessToken: accessToken,
    email: senderEmail,
    recipient: recipientEmail,
    subject: subject,
    message: body,
  });

  res.send({
    success: emailStatus,
  });
});

export default router;
