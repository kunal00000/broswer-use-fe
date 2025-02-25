import { createWithEqualityFn } from "zustand/traditional";
import { Message } from "../types";
import { shallow } from "zustand/shallow";

type SocketStore = {
  messages: Message[];
  screenshots: string[];
};

export const useSocketStore = createWithEqualityFn<SocketStore>()(
  () => ({
    messages: [],
    screenshots: [],
  }),
  shallow
);
