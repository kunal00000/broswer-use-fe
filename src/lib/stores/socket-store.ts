import { createWithEqualityFn } from "zustand/traditional";
import { AgentResponse } from "../types";
import { shallow } from "zustand/shallow";

type SocketStore = {
  messages: AgentResponse[];
  screenshots: string[];
};

export const useSocketStore = createWithEqualityFn<SocketStore>()(
  () => ({
    messages: [],
    screenshots: [],
  }),
  shallow
);
