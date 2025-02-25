"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AgentResponse, WebSocketMessage } from "@/lib/types";
import { useSocketStore } from "@/lib/stores/socket-store";
import { Textarea } from "./ui/textarea";
import { Paperclip, Send } from "lucide-react";
import { MessageBubble } from "./message-bubble";

export default function Chat() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messages = useSocketStore((state) => state.messages);
  const [inputValue, setInputValue] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
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
      setIsConnected(false);
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
    if (ws && inputValue) {
      const message: WebSocketMessage = {
        type: "USER_INPUT",
        content: inputValue,
      };
      ws.send(JSON.stringify(message));
      setInputValue("");
    }

    useSocketStore.setState((state) => ({
      messages: [...state.messages, { message: inputValue, type: "USER" }],
    }));
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mt-2 grow overflow-auto bg-background p-4 rounded-md">
        <p className="">
          {messages.map((msg, index) => (
            <div key={index}>
              <MessageBubble message={msg.message} type={msg.type} />
            </div>
          ))}
        </p>
      </div>

      <div className="relative mb-4">
        <Textarea
          placeholder="Type your message here."
          className="bg-accent p-2 border-1 border-accent-foreground rounded-md min-h-[100px] max-h-[360px] resize-none pb-12"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
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
      </div>
    </div>
  );
}
