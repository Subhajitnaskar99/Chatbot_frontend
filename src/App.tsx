import { useState, useRef, useEffect } from "react";
import type { CSSProperties } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I hit an error: ${errorMessage}` },
      ]);
    }
  };

  return (
    <div style={styles.chat}>
      <div style={styles.messages}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={m.role === "user" ? styles.userMessage : styles.assistantMessage}
          >
            <strong>{m.role === "user" ? "You" : "Bot"}:</strong> {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} style={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.input}
          placeholder="Type a message..."
        />
        <button type="submit" style={styles.button}>
          Send
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  chat: {
    width: "100%",
    maxWidth: 600,
    margin: "0 auto",
    height: "100vh",
    background: "#f5f5f5",
    borderRadius: 8,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  messages: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flex: 1,
    overflowY: "auto",
  },
  userMessage: {
    alignSelf: "flex-end",
    background: "#007bff",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 12,
    maxWidth: "80%",
  },
  assistantMessage: {
    alignSelf: "flex-start",
    background: "#e4e6eb",
    padding: "8px 12px",
    borderRadius: 12,
    maxWidth: "80%",
  },
  inputContainer: {
    display: "flex",
    borderTop: "1px solid #ccc",
    padding: 8,
    background: "#fff",
  },
  input: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    border: "1px solid #ccc",
    marginRight: 8,
  },
  button: {
    padding: "8px 16px",
    borderRadius: 6,
    border: "none",
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
};
