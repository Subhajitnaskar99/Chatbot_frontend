import { useEffect, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "system", content: "You are a helpful, concise assistant." },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) {
        const errTxt = await res.text();
        throw new Error(errTxt || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I hit an error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.app}>
      <div style={styles.chat}>
        <header style={styles.header}>💬 Generative Chatbot</header>

        <div style={styles.messages}>
          {messages
            .filter((m) => m.role !== "system")
            .map((m, i) => (
              <div
                key={i}
                style={{
                  ...styles.msg,
                  ...(m.role === "user" ? styles.user : styles.assistant),
                }}
              >
                <strong>{m.role === "user" ? "You" : "Assistant"}:</strong>{" "}
                <span>{m.content}</span>
              </div>
            ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} style={styles.form}>
          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
          />
          <button style={styles.button} disabled={loading}>
            {loading ? "Thinking…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0f172a",
    color: "#e2e8f0",
    padding: 16,
  },
  chat: {
    width: "100%",
    maxWidth: 720,
    background: "#111827",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid #1f2937",
    fontWeight: 600,
  },
  messages: {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    minHeight: 300,
    maxHeight: "60vh",
    overflowY: "auto",
  },
  msg: {
    padding: "12px 14px",
    borderRadius: 10,
    lineHeight: 1.4,
    whiteSpace: "pre-wrap",
  },
  user: {
    alignSelf: "flex-end",
    background: "#1f2937",
  },
  assistant: {
    alignSelf: "flex-start",
    background: "#0b2b4a",
  },
  form: {
    display: "flex",
    gap: 8,
    padding: 12,
    borderTop: "1px solid #1f2937",
    background: "#0b1220",
  },
  input: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #1f2937",
    background: "#0f172a",
    color: "#e2e8f0",
    outline: "none",
  },
  button: {
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid #1f2937",
    background: "#1d4ed8",
    color: "white",
    cursor: "pointer",
  },
};
