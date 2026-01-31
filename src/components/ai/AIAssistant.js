import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Sparkles, Bot, Lightbulb, X } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { sendMentorMessage, getQuickActions } from '../../services/aiService';
import ReactMarkdown from 'react-markdown';

/**
 * AI Assistant Component
 * 
 * A chat-based AI mentor that appears in the sidebar.
 * Provides contextual guidance based on user's project and stage.
 */
const AIAssistant = ({ stageName }) => {
  const { project, deliverables } = useProject();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get quick actions for current stage
  const quickActions = getQuickActions(stageName);

  // Add welcome message when project/stage changes
  useEffect(() => {
    if (project && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `Hi! I'm your Design Thinking mentor. I see you're working on **"${project.title}"** in the **${stageName}** stage. 

I'm here to guide you, not give answers. What would you like to explore?`,
      };
      setMessages([welcomeMessage]);
      setShowQuickActions(true);
    }
  }, [project, stageName, messages.length]);

  // Send message to AI
  const handleSend = useCallback(async (messageText = input) => {
    if (!messageText.trim() || loading) return;
    if (!project) {
      alert('Please select a project first to use the AI assistant.');
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setShowQuickActions(false);

    try {
      const response = await sendMentorMessage(
        messageText,
        project,
        stageName,
        deliverables,
        messages
      );

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I encountered an error. Please try again.',
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, project, stageName, deliverables, messages]);

  // Handle quick action click
  const handleQuickAction = (action) => {
    handleSend(action.label);
  };

  // Handle key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clear chat
  const handleClearChat = () => {
    setMessages([]);
    setShowQuickActions(true);
  };

  // No project selected state
  if (!project) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
          <Bot className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Mentor</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select a project in the Project tab to start getting personalized guidance.
        </p>
        <div className="text-xs text-gray-400">
          I'll help you through each stage of design thinking.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-none px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">AI Mentor</h3>
              <p className="text-xs text-gray-500">{stageName} Stage</p>
            </div>
          </div>
          {messages.length > 1 && (
            <button
              onClick={handleClearChat}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
        
        {/* Project Context Badge */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 bg-white/60 rounded-full px-2 py-1 w-fit">
          <Lightbulb className="w-3 h-3" />
          <span className="truncate max-w-[180px]">{project.title}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : message.isError
                  ? 'bg-red-50 text-red-700 border border-red-100'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none text-gray-800 ai-message">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-indigo-700">{children}</strong>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions (show when chat is fresh or after clearing) */}
      {showQuickActions && !loading && messages.length <= 1 && (
        <div className="flex-none px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">Quick questions for {stageName}:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.slice(0, 3).map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors border border-indigo-100"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-none p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your project..."
            className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent max-h-32"
            rows={1}
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="flex-none w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          I guide, I don't solve. Let's explore together.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
