import { FC } from "react";
import { MessageSquare, BarChart2, GitCompare, Zap, Info } from 'lucide-react';

export type Tab = "chat" | "visualize" | "compare" | "insights" | "about";
export type MapTransition = "fly" | "instant";
export type Mode = "researcher" | "newbie";

export interface TabConfig {
  id: Tab;
  label: string;
  icon: FC<any>;
}

export interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    visual?: boolean;
}

export const RESEARCHER_TABS: TabConfig[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "visualize", label: "Visualize", icon: BarChart2 },
  { id: "compare", label: "Compare", icon: GitCompare },
  { id: "insights", label: "Insights", icon: Zap },
  { id: "about", label: "About", icon: Info },
];

export const NEWBIE_TABS: TabConfig[] = [
    { id: "chat", label: "Helper", icon: MessageSquare },
    { id: "visualize", label: "Diagram", icon: BarChart2 },
    { id: "compare", label: "Distinguish", icon: GitCompare },
    { id: "insights", label: "Info", icon: Zap },
    { id: "about", label: "About", icon: Info },
];
