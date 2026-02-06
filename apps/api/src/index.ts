import { app } from "./app";

const PORT = process.env.PORT || 4000;

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API is healthy 🚀",
  });
});

// Only listen if not in test mode (import.meta.env.MODE is undefined in Node)
const isTestMode = process.env.NODE_ENV === "test" || process.argv.includes("vitest");
if (!isTestMode) {
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

export default app;
