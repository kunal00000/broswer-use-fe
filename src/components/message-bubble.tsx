import { Message as MessageType } from "@/lib/types";
import { Message, MessageAvatar, MessageContent } from "./ui/message";

export const MessageBubble = ({ message, type }: MessageType) => {
  const isUser = type === "USER";

  return (
    <div className="flex flex-col gap-8">
      {isUser ? (
        <Message className="justify-end mt-4">
          <MessageContent className="max-w-[80%] break-words whitespace-normal overflow-wrap-break-word">
            {message as string}
          </MessageContent>
        </Message>
      ) : (
        <div className="mt-4">
          {typeof message === "object" && "state" in message ? (
            <Message className="justify-start">
              <MessageAvatar src="/avatars/ai.png" alt="AI" fallback="AI" />
              <MessageContent className="max-w-[80%] break-words whitespace-normal overflow-wrap-break-word bg-transparent p-0">
                {`${message.state}: ${message.thought}` as string}
              </MessageContent>
            </Message>
          ) : (
            <Message className="justify-start">
              <MessageContent
                markdown
                className="max-w-[80%] break-words whitespace-normal overflow-wrap-break-word bg-transparent p-0"
              >
                {message}
              </MessageContent>
            </Message>
          )}
        </div>
      )}
    </div>
    // <div
    //   className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4`}
    // >
    //   <div
    //     className={`rounded-lg px-4 py-2 max-w-xs md:max-w-md break-words ${
    //       isUser
    //         ? "text-secondary-foreground bg-muted"
    //         : "text-background bg-foreground"
    //     }`}
    //   >
    //     {isUser ? (
    //       <div>
    //         <p className="font-semibold mb-1">You</p>
    //         <p>{message as string}</p>
    //       </div>
    //     ) : (
    //       <div>
    //         <p className="font-semibold mb-1">AI Assistant</p>
    //         <p className="text-sm">
    //           {typeof message === "object" && "state" in message
    //             ? `${message.state}: ${message.thought}`
    //             : message.toString()}
    //         </p>
    //       </div>
    //     )}
    //   </div>
    // </div>
  );
};
