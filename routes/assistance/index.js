import { Router } from "express";
import { PromptTemplate } from "@langchain/core/prompts";
import { template } from "./prompt.js";
import { llm, vectorStorePromise } from "../../llm-config.js";
import { g_model } from "../../llm-config.js";

const router = Router();

const promptTemplate = new PromptTemplate({
  template,
  inputVariables: ["task", "context"],
});

router.post("/", async (req, res) => {
  const { task } = req.body;

  const vectorstore = await vectorStorePromise;

  let context = "";

  const docs = await vectorstore.similaritySearch(task, 5);

  docs.forEach((doc) => {
    context += doc.pageContent + "\n\n";
  });

  const formattedPrompt = await promptTemplate.format({ task, context });
  const response = await g_model.invoke([["human", formattedPrompt]]);

  res.send({
    response: response,
  });
});

export default router;
