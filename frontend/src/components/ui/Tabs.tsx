'use client';

import React from 'react';

export interface Tab {
  key: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-1 border-b border-slate-200 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative px-4 py-2.5 text-xs font-semibold transition-colors ${
              isActive
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};
