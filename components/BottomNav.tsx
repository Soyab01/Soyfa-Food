
import React from 'react';
import type { PanelType } from '../types';
import { Panel } from '../types';
import { HomeIcon, OrdersIcon, ProfileIcon } from './icons';

interface BottomNavProps {
    activePanel: PanelType;
    setActivePanel: (panel: PanelType) => void;
}

const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
    const activeClass = isActive ? 'text-red-500' : 'text-gray-500';
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center flex-grow p-2 transition-colors ${activeClass} hover:text-red-400`}
        >
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
};

const BottomNav: React.FC<BottomNavProps> = ({ activePanel, setActivePanel }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around items-center z-50">
            <NavItem
                label="Home"
                icon={<HomeIcon className="w-6 h-6 mb-1" />}
                isActive={activePanel === Panel.Home || activePanel === Panel.Menu}
                onClick={() => setActivePanel(Panel.Home)}
            />
            <NavItem
                label="Orders"
                icon={<OrdersIcon className="w-6 h-6 mb-1" />}
                isActive={activePanel === Panel.Orders}
                onClick={() => setActivePanel(Panel.Orders)}
            />
            <NavItem
                label="Profile"
                icon={<ProfileIcon className="w-6 h-6 mb-1" />}
                isActive={activePanel === Panel.Profile}
                onClick={() => setActivePanel(Panel.Profile)}
            />
        </nav>
    );
};

export default BottomNav;
