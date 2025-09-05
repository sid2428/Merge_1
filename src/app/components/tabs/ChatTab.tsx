"use client";

import React, { useState, useRef, useEffect, FC } from "react";
import { Send, Sparkles, SquarePlus } from "lucide-react";
import ChatVisuals from "../chat/ChatVisuals";
import ChatGreeting from "../chat/ChatGreeting";
import OceanLoadingAnimation from "../chat/OceanLoadingAnimation";

// Define the NavIcon for the bot's avatar
const NavIcon: FC = () => (
    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-md">
      🌊
    </div>
);


export default function ChatTab({ messages, setMessages, theme, chatHasVisuals, setChatHasVisuals, handleNewChat }) {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const mockApiResponse = (userMessage) => {
    setIsLoading(true);

    setTimeout(() => {
      let botResponse = "Here are the visualizations based on your request.";
      let hasVisual = true;
      
      const lowerCaseMessage = userMessage.toLowerCase();
      if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
        botResponse = "Hello there! I'm FloatChat AI. How can I assist you with ARGO float data today?";
        hasVisual = false;
      } else if (lowerCaseMessage.includes("meaning of life")) {
        botResponse = "As an AI, I don't ponder philosophical questions, but I can help you find data on ocean life!";
        hasVisual = false;
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { id: prevMessages.length + 1, text: botResponse, sender: "bot" },
      ]);
      setChatHasVisuals(hasVisual);
      setIsLoading(false);
      scrollToBottom();
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      const newUserMessage = { id: messages.length + 1, text: inputMessage, sender: "user" };
      setMessages((prevMessages) => [
        ...prevMessages,
        newUserMessage,
      ]);
      mockApiResponse(inputMessage);
      setInputMessage("");
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 h-full">
      <div className={`flex flex-col h-full bg-card/80 backdrop-blur-lg rounded-2xl shadow-2xl shadow-primary/20 border border-white/10 dark:border-gray-800/20 p-6 sm:p-8 relative transition-all duration-500 ${chatHasVisuals ? 'md:col-span-2' : 'md:col-span-3'}`}>
        <div className="flex items-center justify-between text-xl font-semibold text-foreground/80 mb-6 pb-4 border-b border-white/10 dark:border-gray-700/50">
          <div className="flex items-center">
            <Sparkles size={24} className="mr-3 text-primary" />
            FloatChat AI
          </div>
          <button onClick={handleNewChat} className="p-2 rounded-lg hover:bg-muted/50 transition-colors" title="New Chat">
            <SquarePlus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
          {messages.length === 0 && !isLoading ? (
            <ChatGreeting />
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                {message.sender === 'ai' && (
                    <div className="flex-shrink-0">
                        <NavIcon />
                    </div>
                )}
                <div
                  className={`max-w-[85%] px-5 py-3 rounded-xl text-base relative group
                    ${
                      message.sender === "user"
                        ? 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white'
                        : 'bg-gradient-to-br from-blue-700 to-indigo-800 text-slate-200'
                    }`}
                >
                  <p className={message.sender === 'ai' ? 'font-mono' : 'font-medium'}>{message.text}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start animate-fade-in">
                <div className="flex-shrink-0">
                    <NavIcon />
                </div>
                <div className={`max-w-[85%] px-5 py-3 rounded-xl text-base relative group bg-gradient-to-br from-blue-700 to-indigo-800 text-slate-200`}>
                    <OceanLoadingAnimation />
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="mt-6 pt-4 border-t border-white/10 dark:border-gray-700/50 flex items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about ocean data..."
              className="w-full pl-5 pr-12 py-3 bg-background/50 border border-white/10 dark:border-gray-700/50 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 shadow-md placeholder-muted-foreground"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 transform ${
                inputMessage.trim() && !isLoading
                  ? "bg-primary text-primary-foreground hover:scale-110"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
              disabled={!inputMessage.trim() || isLoading}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
      {chatHasVisuals && (
        <div className="md:col-span-1 h-full">
          <ChatVisuals theme={theme} />
        </div>
      )}
    </div>
  );
}