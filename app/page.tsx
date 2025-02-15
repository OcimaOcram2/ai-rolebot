"use client";

import { useState, useEffect, useRef } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: [...messages, userMessage] }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch (error) {
      console.error("Error:", error);
      alert("Si è verificato un errore. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-[url('/dungeon.jpg')] bg-cover bg-center bg-fixed">
      <div className="w-full max-w-4xl flex flex-col h-screen bg-emerald-900/40 backdrop-blur-sm rounded-lg p-4">
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-4 space-y-4 p-4"
        >
          {messages.map((message, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-emerald-600/90 text-white ml-auto"
                  : "bg-green-200/90 text-emerald-900"
              } max-w-[80%] ${
                message.role === "user" ? "ml-auto" : "mr-auto"
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-emerald-900/50 p-4 rounded-lg">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Scrivi un messaggio..."
              className="flex-1 p-2 border rounded bg-green-50/90 text-emerald-900 placeholder-emerald-700/50 border-emerald-600/30 focus:outline-none focus:border-emerald-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors disabled:bg-emerald-400"
              disabled={isLoading}
            >
              {isLoading ? "Invio..." : "Invia"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
