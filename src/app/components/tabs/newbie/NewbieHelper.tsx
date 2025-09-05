"use client";

import React, { useState, useRef, useEffect, FC } from 'react';
import { Send, User, SquarePlus } from 'lucide-react';
import NewbieGreeting from '../../chat/NewbieGreeting'; 

const NavIcon: FC = () => (
    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-md">
      🌊
    </div>
);

export default function NewbieHelper({ messages, setMessages, theme, handleNewChat }) {
    const [inputMessage, setInputMessage] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;
        const userInput = inputMessage.trim();

        if (messages.length === 0) {
            setMessages([
                { id: Date.now(), who: 'ai', text: "Hello! I'm your AI guide to the oceans. Ask me anything about ARGO floats, and I'll help you navigate the data. What are you curious about?" },
                { id: Date.now() + 1, who: 'user', text: userInput }
            ]);
        } else {
             setMessages((prev) => [...prev, { id: Date.now(), who: 'user', text: userInput }]);
        }
        
        setInputMessage("");

        setTimeout(() => {
            setMessages((prev) => [...prev, { id: Date.now() + 2, who: 'ai', text: `This is a friendly, mocked response for: "${userInput}". In a real scenario, I would provide a helpful explanation!` }]);
        }, 800);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <section className="h-full animate-fade-in">
            <div className="bg-card/80 backdrop-blur-lg rounded-xl shadow-2xl shadow-primary/20 h-full flex flex-col">
                <div className="p-4 sm:p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between text-xl font-bold mb-4 border-b pb-3 text-foreground/80 dark:text-foreground/80 border-white/10 dark:border-gray-700/50">
                        <h2>FloatChat Bot</h2>
                        <button onClick={handleNewChat} className="p-2 rounded-lg hover:bg-muted/50 transition-colors" title="New Chat">
                            <SquarePlus size={20} />
                        </button>
                    </div>
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2 mb-4">
                        {messages.length === 0 ? (
                            <NewbieGreeting />
                        ) : (
                            messages.map((m) => (
                                <div key={m.id} className={`flex items-start gap-3 ${m.who === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {m.who === 'ai' && (
                                        <div className="flex-shrink-0">
                                            <NavIcon />
                                        </div>
                                    )}
                                    <div className={`max-w-xs lg:max-w-xl p-3.5 rounded-2xl shadow-lg text-sm
                                        ${m.who === 'user'
                                            ? 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white'
                                            : 'bg-gradient-to-br from-blue-700 to-indigo-800 text-slate-200'
                                        }`}
                                    >
                                        <p className={m.who === 'ai' ? 'font-mono' : 'font-medium'}>{m.text}</p>
                                    </div>
                                    {m.who === 'user' && (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center shadow-md">
                                            <User size={16} className="text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="mt-auto flex items-center gap-3 border-t pt-4 border-white/10 dark:border-gray-700/50">
                        <input
                            id="chat-input"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            className={`flex-1 p-3 rounded-full border bg-background/50 backdrop-blur-lg focus:ring-2 focus:outline-none placeholder:text-opacity-60
                                ${theme === 'light'
                                    ? 'border-slate-300/70 text-slate-800 placeholder:text-slate-500 focus:ring-primary'
                                    : 'border-slate-700 text-slate-100 placeholder:text-slate-400 focus:ring-primary'
                                }`}
                            placeholder="Ask a simple question..."
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            onClick={handleSendMessage}
                            className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all transform active:scale-95 shadow-lg"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};