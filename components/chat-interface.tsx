"use client";
import React, { useState, useRef, useEffect } from 'react';
import MarkdownRenderer from './markdown-renderer';
import AudioPlayer from './audio-player';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
}

interface ChatInterfaceProps {
  persona: string;
}

const ChatInterface = ({ persona }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [latestMessageId, setLatestMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages from localStorage for current persona
  const loadMessagesFromStorage = (currentPersona: string) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`chat-${currentPersona}`);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  };

  // Save messages to localStorage for current persona
  const saveMessagesToStorage = (currentPersona: string, messagesToSave: Message[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`chat-${currentPersona}`, JSON.stringify(messagesToSave));
    }
  };

  // Clear messages when persona changes and load saved messages for new persona
  useEffect(() => {
    const savedMessages = loadMessagesFromStorage(persona);
    setMessages(savedMessages);
    setInputMessage('');
    setIsLoading(false);
    setLatestMessageId(null);
  }, [persona]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessagesToStorage(persona, messages);
    }
  }, [messages, persona]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputMessage };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona,
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const messageId = Date.now().toString();
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response,
        id: messageId
      };
      setMessages(prev => [...prev, assistantMessage]);
      setLatestMessageId(messageId);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-5 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-100/50 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="text-sm font-medium text-gray-700">
              {persona === 'hitesh' ? 'Hitesh Choudhary' : 'Piyush Garg'}
            </h3>
          </div>
          
          {/* Auto-play Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Auto-play</span>
            <button
              onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                autoPlayEnabled ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  autoPlayEnabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-[500px] overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Start chatting with {persona === 'hitesh' ? 'Hitesh' : 'Piyush'}
            </p>
            <p className="text-gray-400 text-xs">Ask anything about coding, tech, or career advice</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div className="max-w-[75%]">
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-black text-white shadow-lg shadow-purple-500/25'
                    : 'bg-gray-50 text-gray-800 border border-gray-100'
                }`}
              >
                {message.role === 'assistant' ? (
                  <MarkdownRenderer 
                    content={message.content} 
                    className="text-sm leading-relaxed"
                  />
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
              
              {/* Audio Player for Assistant Messages */}
              {message.role === 'assistant' && (
                <div className="mt-2 ml-2">
                  <AudioPlayer
                    text={message.content}
                    persona={persona}
                    autoPlay={autoPlayEnabled && message.id === latestMessageId}
                    className="text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-50 text-gray-800 max-w-[75%] px-4 py-3 rounded-2xl border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-4 border-t border-gray-100/50 bg-gray-50/30">
        <div className="flex items-end space-x-3">
          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent resize-none text-sm placeholder:text-gray-400 shadow-sm"
              rows={1}
              disabled={isLoading}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 bg-black text-white rounded-2xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:shadow-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 20l16-8-16-8v6l10 2-10 2v6z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
