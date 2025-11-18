import React from 'react';
import { AppSettings } from '../types';
import { Settings as SettingsIcon, Image, Palette, User } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
  return (
    <div className="max-w-3xl mx-auto w-full p-6 lg:p-10 animate-fadeIn">
      <div className="mb-10">
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500">Customize your Lumina experience.</p>
      </div>

      <div className="space-y-6">
        {/* User Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
            <User className="w-5 h-5 text-slate-400" />
            Profile
          </h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
              <input
                type="text"
                value={settings.userName}
                onChange={(e) => onUpdateSettings({ ...settings, userName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your name"
              />
            </div>
          </div>
        </div>

        {/* AI Preferences */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
            <Image className="w-5 h-5 text-slate-400" />
            AI Features
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900">Auto-generate Cover Images</h3>
              <p className="text-sm text-slate-500">Use Imagen 3 to create unique art for your saved articles.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.enableAIImages}
                onChange={(e) => onUpdateSettings({ ...settings, enableAIImages: e.target.checked })}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
            <Palette className="w-5 h-5 text-slate-400" />
            Appearance
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {(['teal', 'blue', 'violet'] as const).map((color) => (
              <button
                key={color}
                onClick={() => onUpdateSettings({ ...settings, themeColor: color })}
                className={`h-12 rounded-lg border-2 transition-all flex items-center justify-center capitalize
                  ${settings.themeColor === color 
                    ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold' 
                    : 'border-slate-100 hover:border-slate-300 text-slate-600'}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Design Credit */}
        <div className="pt-10 text-center">
           <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Design by Altin Kelmendi</p>
           <p className="text-[10px] text-slate-300 mt-1">v2.5.0</p>
        </div>
      </div>
    </div>
  );
};