"use client";

import React, { useState, useEffect, FC } from "react";
import { LatLngExpression } from "leaflet";
import Header from "./components/ui/Header";
import WaveAnimation from "./components/ui/WaveAnimation";
import ChatTab from "./components/tabs/ChatTab";
import VisualizeTab from "./components/tabs/VisualizeTab";
import CompareTab from "./components/tabs/CompareTab";
import InsightsTab from "./components/tabs/InsightsTab";
import AboutTab from "./components/tabs/AboutTab";
import NewbieHelper from "./components/tabs/newbie/NewbieHelper";
import NewbieDiagram from "./components/tabs/newbie/NewbieDiagram";
import NewbieDistinguish from "./components/tabs/newbie/NewbieDistinguish";
import { Tab, MapTransition, Mode } from "./types";

export const mockFloats = [
    { id: 1, platform_number: 98765, project_name: "INCOIS", last_cycle: 15, position: [-10.0, 85.0] as LatLngExpression, trajectory: [[-14.0, 75.0], [-12.5, 76.5], [-11.0, 75.5], [-10.5, 78.0], [-9.0, 79.0], [-11.0, 82.0], [-12.0, 84.0], [-10.0, 85.0]] as LatLngExpression[] },
    { id: 2, platform_number: 12345, project_name: "NOAA", last_cycle: 22, position: [-15.0, 78.0] as LatLngExpression, trajectory: [[-8.0, 77.0], [-10.0, 79.0], [-12.0, 81.0], [-14.0, 80.0], [-16.0, 79.0], [-15.0, 78.0]] as LatLngExpression[] },
    { id: 3, platform_number: 54321, project_name: "CSIRO", last_cycle: 8, position: [-13.0, 83.0] as LatLngExpression, trajectory: [[-18.0, 80.0], [-16.0, 81.0], [-14.0, 79.0], [-12.0, 81.5], [-11.5, 83.5], [-13.0, 83.0]] as LatLngExpression[] },
];

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mode, setMode] = useState<Mode>("newbie");
  const [showWaveAnimation, setShowWaveAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState([]);
  const [chatHasVisuals, setChatHasVisuals] = useState(false);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([0, 80]);
  const [mapZoom, setMapZoom] = useState(3);
  const [selectedFloat, setSelectedFloat] = useState(null);
  const [regionSummary, setRegionSummary] = useState(null);
  const [mapTransition, setMapTransition] = useState<MapTransition>('fly');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({ startDate: "2023-03-01", endDate: "2023-03-31", region: "Indian Ocean", parameter: "Salinity", floatId: "" });

  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); }, [theme]);

  const handleModeToggle = () => {
    setShowWaveAnimation(true);
    setTimeout(() => {
        const isSwitchingToNewbie = mode === "researcher";
        setMode(isSwitchingToNewbie ? "newbie" : "researcher");
        setActiveTab("chat");
        setMessages([]);
        setChatHasVisuals(false); // Reset visuals on mode switch
        setShowWaveAnimation(false);
    }, 1200);
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatHasVisuals(false);
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
      setMapTransition('instant');
      setSelectedFloat(null);
      setRegionSummary({ region: filters.region, floats: mockFloats });
      const mockRegionCenters = { "Indian Ocean": [0, 80], "Equatorial Region": [0, -120], "North Atlantic": [40, -40], "Southern Ocean": [-60, 0] };
      setMapCenter(mockRegionCenters[filters.region] || [0, 80]);
      setMapZoom(3);
    }
  };
  const handleDetailClose = () => { setSelectedFloat(null); setRegionSummary(null); };

  const renderDashboard = () => {
    if (mode === 'newbie') {
      switch (activeTab) {
        case "chat": return <NewbieHelper messages={messages} setMessages={setMessages} theme={theme} handleNewChat={handleNewChat} />;
        case "visualize": return (
          <NewbieDiagram
            floats={mockFloats} filters={filters} handleFilterChange={handleFilterChange} handleApplyFilters={handleApplyFilters}
            mapCenter={mapCenter} mapZoom={mapZoom} selectedFloat={selectedFloat} regionSummary={regionSummary}
            onFloatSelect={handleFloatSelect} onDetailClose={handleDetailClose} theme={theme} mapTransition={mapTransition}
          />
        );
        case "compare": return <CompareTab theme={theme} />;
        case "insights": return <InsightsTab theme={theme} />;
        case "about": return <AboutTab />;
        default: return null;
      }
    }
    return (
      <div className="max-w-7xl mx-auto h-full">
        {activeTab === "chat" && <ChatTab messages={messages} setMessages={setMessages} theme={theme} chatHasVisuals={chatHasVisuals} setChatHasVisuals={setChatHasVisuals} handleNewChat={handleNewChat} />}
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
        mode={mode} onModeToggle={handleModeToggle}
        isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
      />
      <main className={`flex-1 p-4 sm:p-6 md:p-8 relative transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        {showWaveAnimation && <WaveAnimation />}
        {renderDashboard()}
      </main>
    </div>
  );
}