import React, { useState } from 'react';
import {
  X,
  Database,
  ShieldCheck,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetSamples: () => void;
  onClearAll: () => void;
  isApiConnected: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetSamples,
  onClearAll,
  isApiConnected,
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settingsModalTitle"
      className="fixed inset-0 z-50 bg-[#2D142C]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#2D142C]/10">
        <div className="flex items-center justify-between pb-4 border-b border-[#2D142C]/10 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2D142C] text-white flex items-center justify-center">
              <Database className="w-4 h-4 text-[#FA8F79]" />
            </div>
            <div>
              <h2 id="settingsModalTitle" className="font-serif text-lg font-bold text-[#2D142C]">
                Workspace Settings
              </h2>
              <p className="text-xs text-[#2D142C]/60">Data storage & security status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#2D142C]/60 hover:text-[#2D142C] hover:bg-[#2D142C]/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-sm">
          {/* Storage Mode Box */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#2D142C]/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D142C]/60">
                Storage Architecture
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                Synchronized
              </span>
            </div>
            <p className="text-xs text-[#2D142C]/80 leading-relaxed">
              Your celebrations are persisted in your local application workspace and synchronized with the backend Express repository. Zero private data or unverified claims are sent to public clouds.
            </p>
          </div>

          {/* Security & Secrets */}
          <div className="p-4 rounded-2xl border border-[#2D142C]/10 space-y-2 text-xs text-[#2D142C]/80">
            <div className="flex items-center gap-1.5 font-bold text-[#2D142C] text-sm">
              <ShieldCheck className="w-4 h-4 text-[#7C699E]" />
              <span>Backend Security Integrity</span>
            </div>
            <ul className="space-y-1 list-disc list-inside text-[#2D142C]/70">
              <li>Gemini API calls are strictly routed through backend proxies.</li>
              <li>No API keys are exposed to client JavaScript or localStorage.</li>
              <li>Rate limiting and input size constraints protect endpoints.</li>
              <li>Financial math is calculated with verified deterministic functions.</li>
            </ul>
          </div>

          {/* Data Management Actions */}
          <div className="pt-2 border-t border-[#2D142C]/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-[#2D142C]">Reload Starter Templates</div>
                <div className="text-[11px] text-[#2D142C]/60">Restores standard wedding & milestone birthday plans</div>
              </div>
              <button
                onClick={() => {
                  onResetSamples();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl border border-[#2D142C]/15 hover:bg-[#FAF8F5] text-xs font-semibold text-[#2D142C] flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#7C699E]" />
                <span>Reload</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-rose-700">Clear All Event Data</div>
                <div className="text-[11px] text-[#2D142C]/60">Removes all celebrations from your workspace</div>
              </div>
              <button
                onClick={() => setShowConfirmClear(true)}
                className="px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-xs font-semibold text-rose-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clear Confirmation Sub-dialog */}
        {showConfirmClear && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 animate-fade-in space-y-3">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>Are you sure you want to erase all events?</span>
            </div>
            <p className="text-[11px] text-rose-700 leading-relaxed">
              This action immediately removes all custom plans, budgets, and tasks.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-3 py-1 rounded-lg bg-white border border-rose-200 text-xs text-[#2D142C] font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowConfirmClear(false);
                  onClose();
                }}
                className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#2D142C]/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2D142C] text-white text-xs font-semibold hover:bg-[#1E0D1E] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
