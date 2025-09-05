"use client";

import React, { useState, useEffect } from "react";
import { LatLngExpression } from "leaflet";
import { AnimatePresence, motion } from "framer-motion";

import Header from "./components/ui/Header";
import ChatTab from "./components/tabs/ChatTab";
import VisualizeTab from "./components/tabs/VisualizeTab";
import CompareTab from "./components/tabs/CompareTab";
import InsightsTab from "./components/tabs/InsightsTab";
import AboutTab from "./components/tabs/AboutTab";
import DynamicInsight from "./components/DynamicInsight";
import NewbieHelper from "./components/tabs/newbie/NewbieHelper";
import NewbieDiagram from "./components/tabs/newbie/NewbieDiagram";
import NewbieDistinguish from "./components/tabs/newbie/NewbieDistinguish";
import WaveAnimation from "./components/ui/WaveAnimation";

import { RESEARCHER_TABS, NEWBIE_TABS, Tab, Mode, Message } from "./types";

const mockFloats = [
    { id: 1, platform_number: 98765, project_name: "INCOIS", last_cycle: 15, position: [-10.0, 85.0] as LatLngExpression, trajectory: [[-14.0, 75.0], [-12.5, 76.5], [-11.0, 75.5], [-10.5, 78.0], [-9.0, 79.0], [-11.0, 82.0], [-12.0, 84.0], [-10.0, 85.0]] as LatLngExpression[] },
    { id: 2, platform_number: 12345, project_name: "NOAA", last_cycle: 22, position: [-15.0, 78.0] as LatLngExpression, trajectory: [[-8.0, 77.0], [-10.0, 79.0], [-12.0, 81.0], [-14.0, 80.0], [-16.0, 79.0], [-15.0, 78.0]] as LatLngExpression[] },
    { id: 3, platform_number: 54321, project_name: "CSIRO", last_cycle: 8, position: [-13.0, 83.0] as LatLngExpression, trajectory: [[-18.0, 80.0], [-16.0, 81.0], [-14.0, 79.0], [-12.0, 81.5], [-11.5, 83.5], [-13.0, 83.0]] as LatLngExpression[] },
];

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mode, setMode] = useState<Mode>("researcher");
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([0, 80]);
  const [mapZoom, setMapZoom] = useState(3);
  const [selectedFloat, setSelectedFloat] = useState(null);
  const [regionSummary, setRegionSummary] = useState(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [filters, setFilters] = useState({ startDate: "2023-03-01", endDate: "2023-03-31", region: "Indian Ocean", parameter: "Salinity", floatId: "" });

  // New state for dynamic insights
  const [currentView, setCurrentView] = useState<'dashboard' | 'insight'>('dashboard');
  const [activeInsight, setActiveInsight] = useState<any>(null);


  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); }, [theme]);

  const handleFloatSelect = (float: any) => { setSelectedFloat(float); setMapCenter(float.position); setMapZoom(7); };
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setFilters((prev) => ({ ...prev, [name]: value })); };
  const handleApplyFilters = () => { /* ... existing logic ... */ };
  const handleDetailClose = () => { setSelectedFloat(null); setRegionSummary(null); };

  const handleModeToggle = () => {
      setMode(current => current === 'researcher' ? 'newbie' : 'researcher');
      setActiveTab('chat');
  }

  // This is the new core logic to switch between chat and dynamic insights
  const handleSendMessage = (newMessage: Message) => {
    const updatedMessages = [...messages, newMessage];
    
    // Keyword detection to trigger insight
    const triggerKeyword = "analyse the data";
    if (newMessage.sender === 'user' && newMessage.text.toLowerCase().includes(triggerKeyword)) {
      const insightData = {
        query: newMessage.text,
        title: "Dynamic Insight: Subsurface Heatwaves",
        subtitle: "Live analysis based on your query.",
        // ... other data needed for the insight can be passed here
      };
      setActiveInsight(insightData);
      setCurrentView('insight');
      
      // Add a message to the chat indicating the switch
      const aiResponse: Message = {
          id: Date.now() + 1,
          sender: 'bot',
          text: `Certainly! I'll analyze the data for subsurface heatwaves. Generating the insight for you now...`,
      };
      setMessages([...updatedMessages, aiResponse]);

    } else {
        // Standard chat response logic
        setMessages(updatedMessages);
        
        // Add a mock bot reply for other messages
        if (newMessage.sender === 'user') {
            const botReply: Message = {
                id: Date.now() + 1,
                sender: 'bot',
                text: `This is a standard reply to: "${newMessage.text}"`
            };
            setTimeout(() => setMessages(prev => [...prev, botReply]), 1000);
        }
    }
  };

  const renderDashboard = () => {
    // Researcher Mode
    if (mode === 'researcher') {
      switch (activeTab) {
        case "chat": return <ChatTab messages={messages} onSendMessage={handleSendMessage} theme={theme} />;
        case "visualize": return <VisualizeTab floats={mockFloats} filters={filters} handleFilterChange={handleFilterChange} handleApplyFilters={handleApplyFilters} mapCenter={mapCenter} mapZoom={mapZoom} selectedFloat={selectedFloat} regionSummary={regionSummary} onFloatSelect={handleFloatSelect} onDetailClose={handleDetailClose} theme={theme} mapTransition={'fly'} />;
        case "compare": return <CompareTab theme={theme} />;
        case "insights": return <InsightsTab />;
        case "about": return <AboutTab />;
        default: return null;
      }
    }
    // Newbie Mode
    switch (activeTab) {
        case "chat": return <NewbieHelper messages={messages} setMessages={setMessages} />;
        case "visualize": return <NewbieDiagram floats={mockFloats} filters={filters} handleFilterChange={handleFilterChange} handleApplyFilters={handleApplyFilters} mapCenter={mapCenter} mapZoom={mapZoom} selectedFloat={selectedFloat} regionSummary={regionSummary} onFloatSelect={handleFloatSelect} onDetailClose={handleDetailClose} theme={theme} mapTransition={'fly'} />;
        case "compare": return <NewbieDistinguish theme={theme} />;
        case "insights": return <InsightsTab />; // Using the same for simplicity
        case "about": return <AboutTab />;
        default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      <Header 
        theme={theme} setTheme={setTheme} activeTab={activeTab} setActiveTab={setActiveTab} 
        mode={mode} onModeToggle={handleModeToggle}
        isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
        showDrippingEffect={false} // This can be removed or repurposed
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <AnimatePresence mode="wait">
            {currentView === 'dashboard' ? (
                 <motion.div key="dashboard" className="h-full p-4 sm:p-6 md:p-8" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                    {renderDashboard()}
                 </motion.div>
            ) : (
                <motion.div key="insight" className="h-full flex" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                    <div className="flex-grow h-full bg-card rounded-2xl shadow-lg border m-2">
                        <DynamicInsight insight={activeInsight} onBack={() => setCurrentView('dashboard')} />
                    </div>
                    <div className="w-96 flex-shrink-0 h-full p-2">
                         <ChatTab messages={messages} onSendMessage={handleSendMessage} theme={theme} isEmbedded={true} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </main>
    </div>
  );
}
