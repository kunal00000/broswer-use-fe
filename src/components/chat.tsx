"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AgentResponse, WebSocketMessage } from "@/lib/types";
import { useSocketStore } from "@/lib/stores/socket-store";
import { Textarea } from "./ui/textarea";
import { ArrowUp, Paperclip, Send, Square } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "./ui/prompt-input";

export default function Chat() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messages = useSocketStore((state) => state.messages);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = () => {
      console.log("WebSocket connected");
      setWs(socket);
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      const wsMessage = JSON.parse(event.data) as WebSocketMessage;

      if (wsMessage.type === "AI_RESPONSE") {
        const message = JSON.parse(wsMessage.content) as AgentResponse;

        useSocketStore.setState((state) => ({
          messages: [...state.messages, { message: message, type: "AGENT" }],
        }));
      } else if (wsMessage.type === "SCREENSHOT") {
        const screenshot = wsMessage.content as string;
        useSocketStore.setState((state) => ({
          screenshots: [...state.screenshots, screenshot],
        }));
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setWs(null);
    };

    socket.onerror = (error: Event) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws && input) {
      const message: WebSocketMessage = {
        type: "USER_INPUT",
        content: input,
      };
      ws.send(JSON.stringify(message));
      setInput("");
    }

    useSocketStore.setState((state) => ({
      messages: [...state.messages, { message: input, type: "USER" }],
    }));
  };

  const handleSubmit = () => {
    setIsLoading(true);
    if (!input.trim()) {
      setIsLoading(false);
      return;
    }
    sendMessage();
    setIsLoading(false);
  };

  const handleValueChange = (value: string) => {
    setInput(value);
  };

  return (
    <div className="flex flex-col max-h-[calc(100vh-4rem)]">
      <div className="mt-2 grow overflow-auto bg-background p-4 rounded-md">
        {messages.map((msg, index) => (
          <div key={index}>
            <MessageBubble message={msg.message} type={msg.type} />
          </div>
        ))}
      </div>
      {/* 
      <div className="relative mb-4">
        <Textarea
          placeholder="Type your message here."
          className="bg-accent p-2 border-1 border-accent-foreground rounded-md min-h-[100px] max-h-[360px] resize-none pb-12"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />
        <div className="absolute bottom-2 right-8 flex flex-row gap-4">
          <Button variant="default" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="default" size="icon" onClick={() => sendMessage()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div> */}

      <PromptInput
        value={input}
        onValueChange={handleValueChange}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        className="w-full max-w-(--breakpoint-md)"
      >
        <PromptInputTextarea placeholder="Ask me anything..." />
        <PromptInputActions className="justify-end pt-2">
          <PromptInputAction
            tooltip={isLoading ? "Stop generation" : "Send message"}
          >
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleSubmit}
            >
              {isLoading ? (
                <Square className="size-5 fill-current" />
              ) : (
                <ArrowUp className="size-5" />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
    </div>
  );
}
