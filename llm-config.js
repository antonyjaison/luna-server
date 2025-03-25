import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Ollama } from "@langchain/ollama";

export const llm = new Ollama({
  baseUrl: "http://localhost:11434",
  model: "deepseek-r1:1.5b",
  temperature: 0.7,
});


export const g_model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash-8b",
  maxOutputTokens: 2048,
  temperature: 0.7,
  apiKey: "AIzaSyCwvqa_fsHvrDOaRm6FqmmqeckeW6mvXO0",
});