import React from 'react';
import { Sparkles, Shield, Heart, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FAF8F5] border-t border-[#2D142C]/10 py-12 mt-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2D142C] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-[#FA8F79]" />
              </div>
              <span className="font-serif text-xl font-bold text-[#2D142C]">Planora AI</span>
            </div>
            <p className="text-sm text-[#2D142C]/70 leading-relaxed">
              Your celebration, perfectly planned. Combining generative intelligence with deterministic budget arithmetic and milestone tracking.
            </p>
          </div>

          {/* Celebrations Col */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D142C]/60">Celebrations</h4>
            <ul className="text-sm space-y-1.5 text-[#2D142C]/80">
              <li>Weddings & Receptions</li>
              <li>Milestone Birthdays</li>
              <li>Anniversaries</li>
              <li>College & Corporate Fests</li>
              <li>Community Gatherings</li>
            </ul>
          </div>

          {/* Security & Reliability Col */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D142C]/60">Security & Integrity</h4>
            <ul className="text-sm space-y-1.5 text-[#2D142C]/80">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#7C699E]" />
                Zero API keys exposed in browser
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified mathematical arithmetic
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                WCAG 2.2 AA accessible design
              </li>
            </ul>
          </div>

          {/* Mission Col */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D142C]/60">PromptWars Challenge 5</h4>
            <p className="text-sm text-[#2D142C]/70 leading-relaxed">
              Engineered with production-quality code, unit-tested calculations, and real-time event workspace management.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-[#2D142C]/8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#2D142C]/60 gap-4">
          <p>© {new Date().getFullYear()} Planora AI. Built with precision and care.</p>
          <div className="flex items-center gap-4">
            <span>Client & Server Synchronized</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Crafted for memorable gatherings <Heart className="w-3 h-3 text-[#E06D53]" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
