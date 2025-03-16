import { z } from "zod";

export const agentResponseSchema = z.object({
  state: z.enum(["INPUT", "PLAN", "ACTION", "OBSERVATION", "OUTPUT"]),
  thought: z.string(),
  action: z
    .object({
      tool: z.string(),
      input: z.record(z.any()),
    })
    .nullable()
    .optional(),
  observation: z.any().optional(),
  next_action: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  requires_user_input: z.boolean().optional(),
  user_prompt: z.string().nullable().optional(),
  final_output: z.string().nullable().optional(),
});

export type AgentResponse = z.infer<typeof agentResponseSchema>;

export type WebSocketMessage = {
  type: "USER_INPUT" | "REQUEST_INPUT" | "AI_RESPONSE" | "ERROR" | "SCREENSHOT";
  content: string;
  requiresInput?: boolean;
};

export type Message = {
  message: AgentResponse | string;
  type: "AGENT" | "USER";
};

export type BrowserInput = {
  type: "click" | "type" | "scroll" | "stream";
  x?: number;
  y?: number;
  value?: string;
  deltaY?: number;
  shouldStream?: boolean;
};
