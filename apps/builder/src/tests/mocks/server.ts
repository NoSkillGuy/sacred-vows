import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// This configures a request mocking server with the given request handlers.
// Used for Node.js (Vitest) environment
export const server = setupServer(...handlers);
