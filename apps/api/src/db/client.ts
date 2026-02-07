import mongoose, { ConnectionStates } from "mongoose";

//* Re-export mongoose safely

export { mongoose };

//* Internal state map (immutable)

const CONNECTION_STATES: Record<ConnectionStates, string> = Object.freeze({
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
  99: "uninitialized", // fallback safety
});


 //! * Check if DB is connected

export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}


 // * Get human-readable connection state

export function getConnectionState(): string {
  const state = mongoose.connection.readyState as ConnectionStates;
  return CONNECTION_STATES[state] ?? "unknown";
}


// * Optional health check (use in /health route)

export function dbHealth() {
  return {
    status: isConnected() ? "ok" : "down",
    state: getConnectionState(),
  };
}
