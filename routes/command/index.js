import { Router } from "express";
import { PromptTemplate } from "@langchain/core/prompts";
import { template } from "./prompt.js";
import { llm } from "../../llm-config.js";
import { g_model } from "../../llm-config.js";
import { executeCommand } from "./utils.js";
import os from "os";

const router = Router();

const promptTemplate = new PromptTemplate({
  template,
  inputVariables: ["task", "type", "platform", "release", "arch"],
});

router.post("/", async (req, res) => {
  const { task } = req.body;

  const formattedPrompt = await promptTemplate.format({
    task,
    type: os.type(),
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
  });
  const response = await g_model.invoke([["human", formattedPrompt]]);

  res.send({
    response: response,
  });
});

router.post("/execute", async (req, res) => {
  const { command } = req.body;

  try {
    const { stdout, stderr } = await executeCommand(command);
    res.json({
      success: true,
      output: stdout,
      errorOutput: stderr,
    });
  } catch (error) {
    console.error("Execution error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
