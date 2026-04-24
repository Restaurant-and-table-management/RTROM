import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { sendChatbotMessage, type ChatbotAction, type ChatbotResponse } from '../services/chatbotApi';

type ChatMessage = {
  id: string;
  role: 'user' | 'bot';
  text: string;
  status?: 'typing' | 'sent';
  actions?: ChatbotAction[];
};

const STORAGE_KEY = 'rtrom-chatbot-session-id';
const quickReplyDefaults = ['Book Table', 'View Menu', 'Track Order'];

function Chatbot() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [quickReplies, setQuickReplies] = useState(quickReplyDefaults);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'bot',
      text: 'Hi, I can help you book a table, open the menu, track an order, or answer quick restaurant questions.',
      status: 'sent',
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const launcherOffset = useMemo(() => {
    return location.pathname === '/customer/menu' ? 'bottom-28' : 'bottom-6';
  }, [location.pathname]);

  useEffect(() => {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) {
      setSessionId(existing);
      return;
    }

    const generated = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, generated);
    setSessionId(generated);
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isOpen]);

  const submitMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || isSending) return;

    setIsOpen(true);
    setIsSending(true);
    setInput('');

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: message,
      status: 'sent',
    };

    const typingId = crypto.randomUUID();
    setMessages((current) => [
      ...current,
      userMessage,
      { id: typingId, role: 'bot', text: '', status: 'typing' },
    ]);

    try {
      const response = await sendChatbotMessage(message, sessionId || undefined);

      if (!sessionId && response.sessionId) {
        setSessionId(response.sessionId);
        window.localStorage.setItem(STORAGE_KEY, response.sessionId);
      }

      setQuickReplies(response.quickReplies?.length ? response.quickReplies : quickReplyDefaults);
      await animateBotReply(typingId, response);
      handleSmartActions(response);
    } catch (error) {
      const fallback =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Something went wrong while contacting the assistant. Please try again.';

      setMessages((current) =>
        current.map((item) =>
          item.id === typingId
            ? { ...item, text: fallback, status: 'sent', actions: [] }
            : item
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const animateBotReply = async (typingId: string, response: ChatbotResponse) => {
    const text = response.reply || 'I’m here to help.';

    for (let index = 1; index <= text.length; index += 1) {
      const slice = text.slice(0, index);
      setMessages((current) =>
        current.map((item) =>
          item.id === typingId
            ? { ...item, text: slice, status: index === text.length ? 'sent' : 'typing', actions: index === text.length ? response.actions : [] }
            : item
        )
      );
      await wait(index < 24 ? 16 : 10);
    }
  };

  const handleSmartActions = (response: ChatbotResponse) => {
    const navigateAction = response.actions?.find((action) => action.type === 'navigate' && action.target);
    if (!navigateAction?.target) return;

    const target = navigateAction.target;
    const shouldProtectCustomerRoute = target.startsWith('/customer') && !isAuthenticated;
    const finalTarget = shouldProtectCustomerRoute ? '/login' : target;

    window.setTimeout(() => {
      if (location.pathname !== finalTarget) {
        navigate(finalTarget);
      }
    }, 700);
  };

  const onSubmit = async (event: any) => {
    event.preventDefault();
    await submitMessage(input);
  };

  return (
    <>
      {isOpen ? (
        <div className={`fixed right-6 ${launcherOffset} z-[60] h-[32rem] w-[22rem] max-w-[calc(100vw-2rem)] rounded-3xl border border-[color:var(--border)] bg-white shadow-[var(--shadow-lg)]`}>
          <div className="flex items-center justify-between rounded-t-3xl bg-[color:var(--primary)] px-5 py-4 text-white">
            <div>
              <p className="text-sm font-semibold">RTROM Assistant</p>
              <p className="text-xs text-slate-300">Ask about bookings, menu, and orders</p>
            </div>
            <button
              type="button"
              className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                <path d="M5.22 5.22a.75.75 0 011.06 0L10 8.94l3.72-3.72a.75.75 0 111.06 1.06L11.06 10l3.72 3.72a.75.75 0 11-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 11-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 010-1.06z" />
              </svg>
            </button>
          </div>

          <div ref={listRef} className="flex h-[22.5rem] flex-col gap-3 overflow-y-auto bg-[color:var(--surface-alt)] px-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={[
                    'max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                    message.role === 'user'
                      ? 'rounded-br-md bg-[color:var(--accent)] text-white'
                      : 'rounded-bl-md bg-white text-[color:var(--text-primary)]',
                  ].join(' ')}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.text || <span className="inline-flex gap-1"><span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--text-secondary)] [animation-delay:-0.3s]" /><span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--text-secondary)] [animation-delay:-0.15s]" /><span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--text-secondary)]" /></span>}
                  </p>

                  {message.role === 'bot' && message.actions?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.actions.map((action, index) => (
                        <button
                          key={`${message.id}-${index}`}
                          type="button"
                          className="rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-primary)] transition hover:bg-[color:var(--surface-alt)]"
                          onClick={() => {
                            if (action.target) {
                              const target = action.target.startsWith('/customer') && !isAuthenticated ? '/login' : action.target;
                              navigate(target);
                            }
                          }}
                        >
                          {action.label || 'Open'}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[color:var(--border)] bg-white px-4 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  className="rounded-full bg-[color:var(--surface-alt)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-secondary)] transition hover:bg-[color:var(--primary)] hover:text-white"
                  onClick={() => submitMessage(reply)}
                >
                  {reply}
                </button>
              ))}
            </div>

            <form className="flex items-center gap-2" onSubmit={onSubmit}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask something..."
                className="input"
                disabled={isSending}
              />
              <button
                type="submit"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--accent)] text-white transition hover:bg-[color:var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSending || !input.trim()}
                aria-label="Send message"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
                  <path d="M2.24 2.24a.75.75 0 01.8-.18l14 5.25a.75.75 0 010 1.38l-14 5.25A.75.75 0 012 13.25V10.5l7.25-.5L2 9.5V2.75a.75.75 0 01.24-.51z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`fixed right-6 ${launcherOffset} z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--primary)] text-white shadow-2xl transition hover:scale-105`}
        aria-label="Open chatbot"
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5m-7 6l2.2-2.2a2 2 0 011.4-.58H18a3 3 0 003-3V7a3 3 0 00-3-3H6A3 3 0 003 7v7a3 3 0 003 3h.5" />
        </svg>
      </button>
    </>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default Chatbot;
