import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  AlertCircle,
  PlusCircle,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { EventPlan, ChatMessage } from '../types';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventPlan;
  onApplySuggestedAction: (action: any) => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  event,
  onApplySuggestedAction,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your Planora celebration assistant for "${event.formData.name}". I have full context on your ${event.formData.guestCount} guests, ${event.budget.currency} ${event.budget.totalBudget.toLocaleString()} budget, and ${event.formData.environment} venue. How can I assist your planning today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appliedActionIds, setAppliedActionIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const quickPrompts = [
    'How can I reduce this budget by 15%?',
    'Suggest rain & weather contingency backup',
    'What top tasks should I complete this week?',
    'Create dietary & vegetarian menu ideas',
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/events/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          event,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error('Assistant service returned a network or processing error.');
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Here are my recommendations based on your event parameters.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: data.suggestedAction,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reach event assistant. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAction = (msgId: string, action: any) => {
    onApplySuggestedAction(action);
    setAppliedActionIds((prev) => [...prev, msgId]);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: `Conversation reset. I'm ready to assist with "${event.formData.name}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setAppliedActionIds([]);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistantDrawerTitle"
      className="fixed inset-0 z-50 overflow-hidden bg-[#2D142C]/30 backdrop-blur-xs flex justify-end animate-fade-in no-print"
    >
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-[#2D142C]/10">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#2D142C]/10 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2D142C] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-[#FA8F79]" />
            </div>
            <div>
              <h2 id="assistantDrawerTitle" className="font-serif text-base font-bold text-[#2D142C]">
                Planora Assistant
              </h2>
              <p className="text-[11px] text-[#2D142C]/60 truncate max-w-[240px]">
                Context: {event.formData.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              title="Clear chat history"
              className="p-1.5 rounded-lg text-[#2D142C]/60 hover:text-[#2D142C] hover:bg-[#2D142C]/5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#2D142C]/60 hover:text-[#2D142C] hover:bg-[#2D142C]/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2.5 bg-[#FAF8F5]/50 border-b border-[#2D142C]/8 flex items-center gap-2 overflow-x-auto text-xs">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#2D142C]/12 text-[#2D142C]/80 hover:text-[#2D142C] hover:border-[#2D142C]/30 whitespace-nowrap transition-colors disabled:opacity-50"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isActionApplied = appliedActionIds.includes(msg.id);

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-[#E06D53] text-white'
                      : 'bg-[#2D142C] text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-[#FA8F79]" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#2D142C] text-white'
                      : 'bg-[#FAF8F5] text-[#2D142C] border border-[#2D142C]/8'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Optional Action Button */}
                  {msg.suggestedAction && (
                    <div className="mt-3 pt-2.5 border-t border-[#2D142C]/10">
                      {isActionApplied ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Applied to Workspace
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApplyAction(msg.id, msg.suggestedAction)}
                          className="px-3 py-1.5 rounded-lg bg-[#2D142C] text-white hover:bg-[#1E0D1E] active:scale-95 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-[#FA8F79]" />
                          <span>{msg.suggestedAction.label}</span>
                        </button>
                      )}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1.5 text-right ${
                      isUser ? 'text-white/60' : 'text-[#2D142C]/40'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#2D142C] flex items-center justify-center shrink-0 text-white">
                <Bot className="w-4 h-4 text-[#FA8F79]" />
              </div>
              <div className="bg-[#FAF8F5] border border-[#2D142C]/8 rounded-2xl p-3 text-xs text-[#2D142C]/70 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E06D53]" />
                <span>Thinking through celebration details...</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => handleSend()}
                className="px-2 py-1 rounded bg-rose-600 text-white font-semibold text-[11px]"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#2D142C]/10 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask for budget cuts, menu ideas, timeline tips..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#2D142C]/15 text-xs sm:text-sm focus:outline-none focus:border-[#E06D53] focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 rounded-xl bg-[#2D142C] text-white hover:bg-[#1E0D1E] active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
