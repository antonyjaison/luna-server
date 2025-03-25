import { Router } from "express";
import { PromptTemplate } from "@langchain/core/prompts";
import { template } from "./prompt.js";
import { llm } from "../../llm-config.js";
import { g_model } from "../../llm-config.js";

const router = Router();

const promptTemplate = new PromptTemplate({
  template,
  inputVariables: ["task"],
});

router.post("/", async (req, res) => {
  const { task } = req.body;

  console.log("task => ", task);

  const formattedPrompt = await promptTemplate.format({ task });
  const response = await g_model.invoke([["human", formattedPrompt]]);

  console.log(response);

  res.send({
    response: response,
  });
});

export default router;
