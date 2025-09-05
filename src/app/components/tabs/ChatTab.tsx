"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import ChatGreeting from "../chat/ChatGreeting";
import OceanLoadingAnimation from "../chat/OceanLoadingAnimation";
import { Message } from "../../types";

interface ChatTabProps {
  messages: Message[];
  onSendMessage: (message: Message) => void;
  theme: 'light' | 'dark';
  isEmbedded?: boolean; // New prop to handle layout variations
}

export default function ChatTab({ messages, onSendMessage, theme, isEmbedded = false }: ChatTabProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      onSendMessage({
        id: Date.now(),
        text: inputMessage,
        sender: "user",
      });
      setInputMessage("");
    }
  };

  const containerClasses = isEmbedded
    ? "flex flex-col h-full bg-card rounded-2xl shadow-lg border p-4"
    : "flex flex-col h-full bg-card rounded-2xl shadow-glow border border-gray-200 dark:border-gray-800 p-6 sm:p-8 relative";

  return (
    <div className={containerClasses}>
      <div className={`flex items-center text-xl font-semibold text-foreground/80 mb-4 pb-3 border-b border-border`}>
        <Sparkles size={24} className="mr-3 text-primary" />
        FloatChat AI
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
        {messages.length === 0 ? (
          <ChatGreeting />
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2 rounded-xl text-base relative group ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-muted-foreground rounded-bl-none border"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleFormSubmit} className="mt-4 pt-4 border-t border-border flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a question or 'analyse the data'..."
            className="w-full pl-4 pr-12 py-2 bg-background border border-gray-300 dark:border-gray-600 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 shadow-sm placeholder-muted-foreground"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
              inputMessage.trim() && !isLoading
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }`}
            disabled={!inputMessage.trim() || isLoading}
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
