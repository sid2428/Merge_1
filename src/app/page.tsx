"use client";

import React, { useState, useEffect } from "react";
import { LatLngExpression } from "leaflet";
import { MessageSquare, BarChart2, GitCompare, Zap, Info, User, GraduationCap } from 'lucide-react';

// Import modular components
import Header from "./components/ui/Header";
import SidePanel from "./components/ui/SidePanel";
import Map from "./components/ui/Map";
import WaveAnimation from "./components/ui/WaveAnimation";

import ChatTab from "./components/tabs/ChatTab";
import VisualizeTab from "./components/tabs/VisualizeTab";
import CompareTab from "./components/tabs/CompareTab";
import InsightsTab from "./components/tabs/InsightsTab";
import AboutTab from "./components/tabs/AboutTab";
import DynamicInsight from "./components/DynamicInsight";
import NewbieHelper from "./components/tabs/newbie/NewbieHelper";
import NewbieDiagram from "./components/tabs/newbie/NewbieDiagram";
import NewbieDistinguish from "./components/tabs/newbie/NewbieDistinguish";

import { RESEARCHER_TABS, NEWBIE_TABS, Tab, MapTransition, Mode } from "./types";

const mockFloats = [
    { id: 1, platform_number: 98765, project_name: "INCOIS", last_cycle: 15, position: [-10.0, 85.0] as LatLngExpression, trajectory: [[-14.0, 75.0], [-12.5, 76.5], [-11.0, 75.5], [-10.5, 78.0], [-9.0, 79.0], [-11.0, 82.0], [-12.0, 84.0], [-10.0, 85.0]] as LatLngExpression[] },
    { id: 2, platform_number: 12345, project_name: "NOAA", last_cycle: 22, position: [-15.0, 78.0] as LatLngExpression, trajectory: [[-8.0, 77.0], [-10.0, 79.0], [-12.0, 81.0], [-14.0, 80.0], [-16.0, 79.0], [-15.0, 78.0]] as LatLngExpression[] },
    { id: 3, platform_number: 54321, project_name: "CSIRO", last_cycle: 8, position: [-13.0, 83.0] as LatLngExpression, trajectory: [[-18.0, 80.0], [-16.0, 81.0], [-14.0, 79.0], [-12.0, 81.5], [-11.5, 83.5], [-13.0, 83.0]] as LatLngExpression[] },
];

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mode, setMode] = useState<Mode>("researcher");
  const [showWaveAnimation, setShowWaveAnimation] = useState(false);
  const [showDrippingEffect, setShowDrippingEffect] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState([]);
  const [chatHasVisuals, setChatHasVisuals] = useState(false);
  
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([0, 80]);
  const [mapZoom, setMapZoom] = useState(3);
  const [selectedFloat, setSelectedFloat] = useState(null);
  const [regionSummary, setRegionSummary] = useState(null);
  const [mapTransition, setMapTransition] = useState<MapTransition>('fly');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Gemini-style sidebar is open by default on desktop
  
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
    if (mode === "researcher") {
      setShowWaveAnimation(true);
      setShowDrippingEffect(false); 
      setTimeout(() => {
        setMode("newbie");
        setActiveTab("visualize");
        setShowWaveAnimation(false);
        setShowDrippingEffect(true); 
        setTimeout(() => { setShowDrippingEffect(false); }, 1500); 
      }, 5000); 
    } else {
      setMode("researcher");
      setActiveTab("visualize"); 
      setShowWaveAnimation(false);
      setShowDrippingEffect(false);
    }
  };

  const handleFloatSelect = (float) => { setMapTransition('fly'); setRegionSummary(null); setSelectedFloat(float); setMapCenter(float.position); setMapZoom(7); };
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setFilters((prev) => ({ ...prev, [name]: value })); };
  const handleApplyFilters = () => { 
    const targetFloat = mockFloats.find(f => f.platform_number.toString() === filters.floatId);
    if (targetFloat) {
      setMapTransition('fly');
      setSelectedFloat(targetFloat);
      setMapCenter(targetFloat.position);
      setMapZoom(8);
      setRegionSummary(null);
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
    if (mode === 'newbie') {
      switch (activeTab) {
        case "chat": return <NewbieHelper messages={messages} setMessages={setMessages} />;
        case "visualize": return (
          <NewbieDiagram
            floats={mockFloats} filters={filters} handleFilterChange={handleFilterChange} handleApplyFilters={handleApplyFilters}
            mapCenter={mapCenter} mapZoom={mapZoom} selectedFloat={selectedFloat} regionSummary={regionSummary}
            onFloatSelect={handleFloatSelect} onDetailClose={handleDetailClose} theme={theme} mapTransition={mapTransition}
          />
        );
        case "compare": return <NewbieDistinguish theme={theme} />;
        case "insights": return <InsightsTab theme={theme} />;
        case "about": return <AboutTab />;
        default: return null;
      }
    }
    return (
      <div className="max-w-7xl mx-auto">
        {activeTab === "chat" && <ChatTab messages={messages} setMessages={setMessages} theme={theme} chatHasVisuals={chatHasVisuals} setChatHasVisuals={setChatHasVisuals} />}
        {activeTab === "visualize" && (
          <VisualizeTab
            floats={mockFloats} filters={filters} handleFilterChange={handleFilterChange} handleApplyFilters={handleApplyFilters}
            mapCenter={mapCenter} mapZoom={mapZoom} selectedFloat={selectedFloat} regionSummary={regionSummary}
            onFloatSelect={handleFloatSelect} onDetailClose={handleDetailClose} theme={theme} mapTransition={mapTransition}
          />
        )}
        {activeTab === "compare" && <CompareTab theme={theme} />}
        {activeTab === "insights" && <InsightsTab theme={theme} />}
        {activeTab === "about" && <AboutTab />}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      <Header 
        theme={theme} setTheme={setTheme} activeTab={activeTab} setActiveTab={setActiveTab} 
        mode={mode} onModeToggle={handleModeToggle} showDrippingEffect={showDrippingEffect}
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
