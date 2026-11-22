import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Sparkles, Send, ShieldAlert, Bot, User, Volume2, VolumeX } from 'lucide-react';
import { api } from '../../services/api';
import type { AIMessage } from '../../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, patientId }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await api.getAIHistory(patientId);
      setMessages(res.messages);
    } catch (e) {
      console.error('Failed loading AI history', e);
    }
  }, [patientId]);

  useEffect(() => {
    if (isOpen) loadHistory();
  }, [isOpen, loadHistory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    const userMsg: AIMessage = { id: `temp-${Date.now()}`, sender: 'user', message: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setSending(true);

    try {
      const res = await api.sendAIMessage(patientId, query);
      setMessages(prev => [...prev, res.reply]);
    } catch (e) {
      console.error('Failed sending AI msg', e);
    } finally {
      setSending(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    'What is my plan today?',
    'What should I eat for lunch?',
    'How much activity is planned today?',
    'Show my heart-rate trend.',
    'Summarize my recent reports.',
    'How has my sleep changed this month?'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg h-[680px] max-h-[92vh] rounded-3xl bg-white border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between" style={{ backgroundColor: 'var(--bg-card-secondary)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--pastel-lavender)' }}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">CareSync AI Assistant</h3>
              <p className="text-[10px] text-[var(--text-secondary)]">Contextual health advisor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSpeak(messages[messages.length - 1]?.message || '')}
              className="p-2 rounded-xl transition"
              style={{ backgroundColor: isSpeaking ? 'var(--pastel-blue)' : 'var(--bg-card)' }}
              title="Voice readout"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-[var(--bg-card-secondary)] text-[var(--text-secondary)]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-4 py-2 text-[10px] flex items-center gap-1.5 border-b border-[var(--border)]" style={{ backgroundColor: 'var(--pastel-blue)' }}>
          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Non-diagnostic. Explains guidance from your care plan. Cannot modify prescriptions.</span>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
          {messages.length === 0 && !sending && (
            <p className="text-sm text-[var(--text-secondary)] text-center py-8">Ask a question about your health to get started</p>
          )}
          {messages.map((m, idx) => (
            <div key={m.id || idx} className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: m.sender === 'user' ? 'var(--pastel-blue)' : 'var(--pastel-lavender)' }}>
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className="p-4 rounded-2xl max-w-[85%] leading-relaxed"
                style={m.sender === 'user'
                  ? { backgroundColor: 'var(--pastel-blue)', borderTopRightRadius: 4 }
                  : { backgroundColor: 'var(--bg-card-secondary)', borderTopLeftRadius: 4 }}
              >
                <p className="whitespace-pre-line">{m.message}</p>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs italic">
              <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: 'var(--pastel-lavender)' }} />
              <span>Analyzing context…</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 border-t border-[var(--border)]">
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Suggested questions</p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-[var(--border)] hover:bg-[var(--bg-card-secondary)] whitespace-nowrap flex-shrink-0 transition text-xs font-medium"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-[var(--border)] flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about your health plan, vitals, or meals…"
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="input flex-1"
          />
          <button onClick={() => handleSend()} disabled={sending || !inputMsg.trim()} className="btn btn-primary !px-3 disabled:opacity-40">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};