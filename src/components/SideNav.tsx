"use client"
import { useState, useContext, createContext } from 'react';
import { Sun, Moon, MoreVertical, Palette, Settings, Info } from 'lucide-react';
import Image from 'next/image';

export const ThemeContext = createContext({
  theme: 'light',
  setTheme: (theme: 'light' | 'dark') => {},
});

export default function SideNav() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <div className="relative z-50">
      <div className={`flex items-center justify-between p-4 backdrop-blur-md transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-950 border-b border-gray-700' 
          : 'bg-white/80 border-b border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
              : 'bg-gradient-to-br from-indigo-500 to-purple-600'
          }`}>
              <Image src="/hackaboard.jpg" className="w-10 h-10 rounded-full object-cover" alt="hackaboard" width={128} height={128} />
          </div>
          <h1 className={`text-xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Hackaboard
          </h1>
        </div>
        
        <button
          className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
            theme === 'dark' 
              ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setDropdownOpen((v) => !v)}
          aria-label="Open menu"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      {dropdownOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setDropdownOpen(false)}
          />
          
          <div className={`absolute right-4 top-16 w-64 rounded-2xl shadow-2xl border transition-all duration-300 z-50 ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-2">
              <div className={`px-3 py-2 text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Settings
              </div>
              
              <button
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
                onClick={() => {
                  setTheme(theme === 'light' ? 'dark' : 'light');
                  setDropdownOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    theme === 'dark' ? 'bg-indigo-600' : 'bg-amber-100'
                  }`}>
                    {theme === 'light' ? (
                      <Moon className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">
                      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </p>
                    <p className="text-xs opacity-75">
                      {theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
                    </p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  theme === 'dark' ? 'border-indigo-500' : 'border-amber-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    theme === 'dark' ? 'bg-indigo-500' : 'bg-amber-500'
                  }`} />
                </div>
              </button>

              <div className={`h-px my-2 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`} />

              <div className={`px-3 py-2 text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                About
              </div>
              
              <div className={`px-3 py-3 rounded-xl ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    theme === 'dark' ? 'bg-green-600' : 'bg-green-100'
                  }`}>
                    <Info className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Hackaboard v1.0
                    </p>
                    <p className={`text-xs opacity-75 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Collaborative whiteboard with real-time sync
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}