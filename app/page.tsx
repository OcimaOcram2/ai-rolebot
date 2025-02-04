"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
    
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user" as const,
      content: input,
    };

    try {
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

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
        { role: "assistant" as const, content: data.content },
      ]);

    } catch (error) {
      console.error("Chat error:", error);
      // Opzionale: mostra un messaggio di errore all'utente
      setMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: "Mi dispiace, c'è stato un errore. Riprova più tardi." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={index} className="mb-4">
            <div className={`p-4 rounded-lg ${message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."  
          className="w-full p-2 rounded-md border-2 border-gray-300"
        />
        <button type="submit" className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md">
          Send
        </button>
      </form>
    </div>
  );
}
