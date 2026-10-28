import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  FileText,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { EventPlan } from '../types';
import { formatCurrency } from '../utils/budgetCalculations';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventPlan;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, event }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(event, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${event.formData.name.replace(/\s+/g, '_')}_Planora_Plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const generateMarkdownReport = () => {
    const curr = event.budget.currency;
    return `# PLANORA CELEBRATION BLUEPRINT: ${event.formData.name.toUpperCase()}

**Event Category:** ${event.formData.eventType}
**Scheduled Date:** ${event.formData.date} at ${event.formData.startTime} (${event.formData.durationHours} hours)
**Location:** ${event.formData.location} (${event.formData.environment})
**Expected Guests:** ${event.formData.guestCount}
**Total Budget:** ${formatCurrency(event.budget.totalBudget, curr)}
**Estimated Expenses:** ${formatCurrency(event.budget.estimatedTotal, curr)}
**Remaining Reserve:** ${formatCurrency(event.budget.remainingBudget, curr)}

---

## 1. EXECUTIVE OVERVIEW
- **Recommended Theme:** ${event.eventOverview.theme}
- **Theme Rationale:** ${event.eventOverview.themeReason}
- **Summary:** ${event.eventOverview.summary}
- **Venue Approach:** ${event.eventOverview.venueApproach || 'Standard'}
- **Catering Approach:** ${event.eventOverview.menuApproach || 'Standard'}

---

## 2. BUDGET ALLOCATIONS
${event.budget.categories.map((c) => `- **${c.name}**: ${formatCurrency(c.estimatedCost, curr)} (${c.percentage}%) — ${c.reason}`).join('\n')}

---

## 3. TIMELINE & MILESTONES
${event.timeline.map((m) => `- [${m.completed ? 'X' : ' '}] **${m.dueDate}**: ${m.title} (${m.priority} priority)\n  ${m.description}`).join('\n')}

---

## 4. PREPARATION TASKS
${event.tasks.map((t) => `- [${t.completed ? 'X' : ' '}] **${t.title}** [${t.category}] (${t.priority} priority)\n  ${t.description}`).join('\n')}

---

## 5. VENDOR REQUIREMENTS & BRIEF
${event.vendors.map((v) => `### ${v.category} (Est: ${formatCurrency(v.estimatedBudget, curr)})
- Status: ${v.status}
- Requirements: ${v.requirements}
- Notes: ${v.notes || 'None logged'}
- Tips: ${v.selectionTips.join('; ')}`).join('\n\n')}

---

## 6. CONTINGENCY & RISK MITIGATION
${event.contingencyPlan.map((c) => `- **Risk (${c.severity.toUpperCase()}):** ${c.risk}\n  **Mitigation:** ${c.mitigation}`).join('\n')}

---
*Generated with Planora AI — Celebration Architecture & Event Workspace*
`;
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `${event.formData.name.replace(/\s+/g, '_')}_Blueprint.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdownReport());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exportModalTitle"
      className="fixed inset-0 z-50 bg-[#2D142C]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#2D142C]/10">
        <div className="flex items-center justify-between pb-4 border-b border-[#2D142C]/10 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2D142C] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#FA8F79]" />
            </div>
            <div>
              <h2 id="exportModalTitle" className="font-serif text-lg font-bold text-[#2D142C]">
                Export & Share Blueprint
              </h2>
              <p className="text-xs text-[#2D142C]/60 truncate max-w-[280px]">
                {event.formData.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#2D142C]/60 hover:text-[#2D142C] hover:bg-[#2D142C]/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {/* Option 1: Print */}
          <button
            onClick={handlePrint}
            className="w-full p-4 rounded-2xl border border-[#2D142C]/15 hover:border-[#2D142C]/30 bg-[#FAF8F5] hover:bg-white text-left transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2D142C]/8 text-[#2D142C] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5 text-[#E06D53]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#2D142C]">Print-Friendly Run-of-Show</h4>
                <p className="text-xs text-[#2D142C]/65">Formatted for clean printing or browser PDF saving</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#2D142C]/60 group-hover:text-[#2D142C]">Print</span>
          </button>

          {/* Option 2: Markdown */}
          <button
            onClick={handleDownloadMarkdown}
            className="w-full p-4 rounded-2xl border border-[#2D142C]/15 hover:border-[#2D142C]/30 bg-[#FAF8F5] hover:bg-white text-left transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2D142C]/8 text-[#2D142C] flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-[#7C699E]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#2D142C]">Download Markdown (.md)</h4>
                <p className="text-xs text-[#2D142C]/65">Complete formatted briefing document</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-[#2D142C]/60" />
          </button>

          {/* Option 3: JSON */}
          <button
            onClick={handleDownloadJson}
            className="w-full p-4 rounded-2xl border border-[#2D142C]/15 hover:border-[#2D142C]/30 bg-[#FAF8F5] hover:bg-white text-left transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2D142C]/8 text-[#2D142C] flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileCode className="w-5 h-5 text-[#BC6C25]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#2D142C]">Download Full JSON Backup</h4>
                <p className="text-xs text-[#2D142C]/65">Structured event data for re-import or developer tools</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-[#2D142C]/60" />
          </button>
        </div>

        <div className="pt-4 border-t border-[#2D142C]/10 flex items-center justify-between">
          <button
            onClick={handleCopyClipboard}
            className="px-4 py-2 rounded-xl border border-[#2D142C]/15 text-xs font-semibold text-[#2D142C] hover:bg-[#FAF8F5] transition-all flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary Text'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2D142C] text-white text-xs font-semibold hover:bg-[#1E0D1E] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
