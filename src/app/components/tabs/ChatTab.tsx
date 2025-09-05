"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import ChatVisuals from "../chat/ChatVisuals";
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
  const [isLaunching, setIsLaunching] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const mockApiResponse = (userMessageText: string) => {
    setIsLoading(true);
    setIsLaunching(true);

    setTimeout(() => {
      setIsLaunching(false);
      let botResponse = "Here are the visualizations based on your request.";
      let hasVisual = true;
      
      const lowerCaseMessage = userMessageText.toLowerCase();
      if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
        botResponse = "Hello there! I'm FloatChat AI. How can I assist you with ARGO float data today?";
        hasVisual = false;
      } else if (lowerCaseMessage.includes("meaning of life")) {
        botResponse = "As an AI, I don't ponder philosophical questions, but I can help you find data on ocean life!";
        hasVisual = false;
      }
      
      onSendMessage({ id: Date.now(), text: botResponse, sender: "bot", visual: hasVisual });
      setIsLoading(false);
      scrollToBottom();
    }, 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      const newUserMessage: Message = { id: Date.now(), text: inputMessage, sender: "user" };
      onSendMessage(newUserMessage);
      mockApiResponse(inputMessage);
      setInputMessage("");
    }
  };

  const containerClasses = isEmbedded
    ? "flex flex-col h-full bg-card rounded-2xl shadow-lg border p-4"
    : "flex flex-col h-full bg-card rounded-2xl shadow-glow border border-gray-200 dark:border-gray-800 p-6 sm:p-8 relative";

  return (
    <div className={containerClasses}>
      <div className="flex items-center text-xl font-semibold text-foreground/80 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
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
                className={`max-w-[75%] px-5 py-3 rounded-xl text-lg relative group ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-muted-foreground rounded-bl-none border border-gray-200 dark:border-gray-700"
                }`}
                style={{
                  boxShadow: message.sender === "user" ? '0 4px 8px rgba(0, 119, 182, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                {message.text}
                {message.sender === "bot" && message.visual && (
                  <div className="mt-4">
                    <ChatVisuals theme={theme} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLaunching && (
          <div className="flex justify-start">
            <div className="max-w-[75%] px-5 py-3 rounded-xl bg-muted text-muted-foreground rounded-bl-none border border-gray-200 dark:border-gray-700">
              <OceanLoadingAnimation />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a question about ARGO floats..."
            className="w-full pl-5 pr-12 py-3 bg-background border border-gray-300 dark:border-gray-600 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 shadow-md placeholder-muted-foreground"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
              inputMessage.trim() && !isLoading
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }`}
            disabled={!inputMessage.trim() || isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}