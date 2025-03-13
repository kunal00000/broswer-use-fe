// components/chat.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useSocketStore } from "@/lib/stores/socket-store";
import { MessageType, WebSocketMessage } from "@/lib/types";
import { ArrowUp, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./message-bubble";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "./ui/prompt-input";
import { useWebSocket } from "@/lib/providers/websocker-provider";

export default function Chat() {
  const { ws } = useWebSocket();
  const messages = useSocketStore((state) => state.messages);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event: MessageEvent<string>) => {
        const wsMessage = JSON.parse(event.data) as WebSocketMessage;

        if (wsMessage.type === "AI_RESPONSE") {
          useSocketStore.setState((state) => ({
            messages: [
              ...state.messages,
              { message: wsMessage.content, type: "AGENT" },
            ],
          }));
        } else if (wsMessage.type === "SCREENSHOT") {
          useSocketStore.setState((state) => ({
            screenshots: [...state.screenshots, wsMessage.content],
          }));
        }
      };
    }
  }, [ws]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (ws && input) {
      const message: WebSocketMessage = {
        type: "USER_INPUT",
        content: input,
      };

      const data: MessageType = {
        type: "TEXT",
        data: message,
      };
      ws.send(JSON.stringify(data));
      setInput("");
      useSocketStore.setState((state) => ({
        messages: [...state.messages, { message: input, type: "USER" }],
      }));
    }
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

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      <div
        className="mt-2 grow overflow-auto bg-background p-4 rounded-md"
        ref={chatContainerRef}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <MessageBubble message={msg.message} type={msg.type} />
          </div>
        ))}
      </div>
      <PromptInput
        value={input}
        onValueChange={(value) => setInput(value)}
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
