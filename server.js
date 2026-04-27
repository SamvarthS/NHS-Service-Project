import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || "127.0.0.1";
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
const openai = hasApiKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const explanationSchema = z.object({
  problemType: z.string(),
  summary: z.string(),
  whatToNotice: z.array(z.string()).min(2).max(5),
  strategy: z.array(z.string()).min(3).max(6),
  checkpoints: z.array(z.string()).min(2).max(5),
  encouragement: z.string(),
  followUpQuestion: z.string()
});

const answerSchema = z.object({
  finalAnswer: z.string(),
  workedSolution: z.array(z.string()).min(2).max(6),
  verification: z.array(z.string()).min(1).max(4),
  nextStep: z.string()
});

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));
app.use("/vendor/katex", express.static("node_modules/katex/dist"));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    apiKeyConfigured: hasApiKey,
    model
  });
});

app.post("/api/tutor/explain", async (req, res) => {
  try {
    const question = getQuestion(req.body?.question);

    if (!question) {
      return res.status(400).json({ error: "Please enter a math question first." });
    }

    ensureClient();

    const response = await openai.responses.parse({
      model,
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text:
                "You are a patient math tutor. Explain how a student should approach the problem without actually solving it, without revealing the final answer, and without performing the decisive arithmetic or algebraic simplification that gives the answer away. Focus on strategy, concepts, what to notice, and self-checks. End by asking whether the student wants the answer or wants to solve it alone."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Help me with this math problem: ${question}`
            }
          ]
        }
      ],
      text: {
        format: zodTextFormat(explanationSchema, "math_tutor_explanation")
      }
    });

    if (!response.output_parsed) {
      return res.status(502).json({ error: "The tutor could not format a response for this problem." });
    }

    res.json(response.output_parsed);
  } catch (error) {
    handleApiError(error, res);
  }
});

app.post("/api/tutor/answer", async (req, res) => {
  try {
    const question = getQuestion(req.body?.question);

    if (!question) {
      return res.status(400).json({ error: "Please enter a math question first." });
    }

    ensureClient();

    const response = await openai.responses.parse({
      model,
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text:
                "You are a clear math tutor. The student has now explicitly asked for the answer. Provide the final answer, a concise worked solution, and a short way to verify it. Keep the explanation digestible for a student."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `The student is ready for the answer. Solve this problem clearly: ${question}`
            }
          ]
        }
      ],
      text: {
        format: zodTextFormat(answerSchema, "math_tutor_answer")
      }
    });

    if (!response.output_parsed) {
      return res.status(502).json({ error: "The tutor could not format the final answer." });
    }

    res.json(response.output_parsed);
  } catch (error) {
    handleApiError(error, res);
  }
});

app.listen(port, host, () => {
  console.log(`AI Math Tutor is running on http://${host}:${port}`);
});

function getQuestion(value) {
  return typeof value === "string" ? value.trim() : "";
}

function ensureClient() {
  if (!openai) {
    const error = new Error("OPENAI_API_KEY is missing.");
    error.statusCode = 500;
    throw error;
  }
}

function handleApiError(error, res) {
  const statusCode = error.statusCode || 500;
  const message =
    error?.error?.message ||
    error?.message ||
    "Something went wrong while contacting the OpenAI API.";

  res.status(statusCode).json({ error: message });
}
