import express from "express";
import * as trpc from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import { z } from "zod";

// Interfact Definition
interface ChatMessage {
  user: string;
  message: string;
}
// Backend Constants
// - variable "messages" holds an array of "ChatMessage" interfaces.
const messages: ChatMessage[] = [
  { user: "user1", message: "Hello" },
  { user: "user2", message: "Hi" },
];
// Application tRPC router - Handler of variable "messages".
const appRouter = trpc
  .router()
  // - query route "hello" to retrive static information.
  .query("hello", {
    resolve() {
      return "Hello world III";
    },
  })
  // - query route "getMessages" to acquire the values of our backend 
  //   variable "messages".
  .query("getMessages", {
    input: z.number().default(10),
    resolve({ input }) {
      return messages.slice(-input);
    },
  })
  // - mutation route "addMessage" to acquire add a new "ChatMessage" instance
  //   into of our backend variable "messages".
  .mutation("addMessage", {
    input: z.object({
      user: z.string(),
      message: z.string(),
    }),
    resolve({ input }) {
      messages.push(input);
      return input;
    },
  });

export type AppRouter = typeof appRouter;
// Create an Express server instance.
const app = express();
app.use(cors());
const port = 8080;
// Add tRCP routes to our express http server.
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => null,
  })
);

app.get("/", (req, res) => {
  res.send("Hello from api-server");
});

app.listen(port, () => {
  console.log(`api-server listening at http://localhost:${port}`);
});
