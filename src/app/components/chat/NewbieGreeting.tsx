"use client";

import React, { useState, useEffect } from 'react';

export default function NewbieGreeting() {
    const poeticLines = [
        "Welcome, Ocean Explorer!",
        "Ready to discover secrets of the deep?",
        "Ask me anything to begin our journey."
    ];
    const eraseSpeed = 30;
    const typeSpeed = 50;
    const pauseTime = 1500;
    const [typedMessage, setTypedMessage] = useState("");
    const [erasing, setErasing] = useState(false);
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        let timer;
        const currentLine = poeticLines[messageIndex];

        if (!erasing) {
            if (typedMessage.length < currentLine.length) {
                timer = setTimeout(() => {
                    setTypedMessage(currentLine.slice(0, typedMessage.length + 1));
                }, typeSpeed);
            } else {
                timer = setTimeout(() => setErasing(true), pauseTime);
            }
        } else {
            if (typedMessage.length > 0) {
                timer = setTimeout(() => {
                    setTypedMessage(typedMessage.slice(0, -1));
                }, eraseSpeed);
            } else {
                setErasing(false);
                setMessageIndex((prev) => (prev + 1) % poeticLines.length);
            }
        }
        
        return () => clearTimeout(timer);
    }, [typedMessage, erasing, messageIndex]);

    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-fade-in h-full">
            <h1 className="text-5xl md:text-6xl font-bold">
                {/* FIXED: Adjusted gradient for better visibility */}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-sky-600">
                    FloatChat
                </span>
            </h1>
            <p className="mt-4 text-lg font-mono text-muted-foreground max-w-md h-6">
                {typedMessage}
                <span className="blinking-cursor">|</span>
            </p>
        </div>
    );
};