import { Message } from "@/lib/types";

export const MessageBubble = ({ message, type }: Message) => {
  const isUser = type === "USER";

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`rounded-lg px-4 py-2 max-w-xs md:max-w-md break-words ${
          isUser
            ? "text-secondary-foreground bg-muted"
            : "text-background bg-foreground"
        }`}
      >
        {isUser ? (
          <div>
            <p className="font-semibold mb-1">You</p>
            <p>{message as string}</p>
          </div>
        ) : (
          <div>
            <p className="font-semibold mb-1">AI Assistant</p>
            <p className="text-sm">
              {typeof message === "object" && "state" in message
                ? `${message.state}: ${message.thought}`
                : message.toString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
