"use client";
import React, { useState, useRef, useEffect } from 'react';
import MarkdownRenderer from './markdown-renderer';
import AudioPlayer from './audio-player';
import { personaConfig } from '../utils/personas';
import Image from 'next/image';

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
  const [currentPersona, setCurrentPersona] = useState(persona);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessagesFromStorage = (currentPersona: string) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`chat-${currentPersona}`);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  };

  const saveMessagesToStorage = (currentPersona: string, messagesToSave: Message[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`chat-${currentPersona}`, JSON.stringify(messagesToSave));
    }
  };

  useEffect(() => {
    if (persona !== currentPersona) {
      const savedMessages = loadMessagesFromStorage(persona);
      setMessages(savedMessages);
      setInputMessage('');
      setIsLoading(false);
      setLatestMessageId(null);
      setCurrentPersona(persona);
    }
  }, [persona, currentPersona]);

  useEffect(() => {
    if (persona && messages.length === 0 && !isLoading) {
      const savedMessages = loadMessagesFromStorage(persona);
      setMessages(savedMessages);
    }
  }, [persona]);

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
          persona: currentPersona,
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

  const clearChat = () => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`chat-${currentPersona}`);
    }
    setLatestMessageId(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-5 bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl border border-white/20 overflow-hidden">
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100/50 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <Image
                src={personaConfig[persona as keyof typeof personaConfig]?.avatar || '/next.svg'}
                alt={personaConfig[persona as keyof typeof personaConfig]?.name || 'Assistant'}
                width={40}
                height={40}
                className="rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <h3 className="text-xs md:text-sm font-medium text-gray-700">
              {personaConfig[persona as keyof typeof personaConfig]?.name || 'Assistant'}
            </h3>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-3">
            <button
              onClick={clearChat}
              className="p-1.5 md:p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 group"
              aria-label="Clear chat history"
              title="Clear chat history"
            >
              <svg 
                className="h-4 w-4 md:h-5 md:w-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-1 md:space-x-2">
              <span className="text-xs text-gray-600 hidden sm:inline">Auto-play</span>
              <button
                onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                className={`relative inline-flex h-6 w-11 md:h-5 md:w-9 items-center rounded-full transition-colors touch-manipulation ${
                  autoPlayEnabled ? 'bg-purple-500' : 'bg-gray-300'
                }`}
                aria-label={`Auto-play ${autoPlayEnabled ? 'enabled' : 'disabled'}`}
              >
                <span
                  className={`inline-block h-4 w-4 md:h-3 md:w-3 transform rounded-full bg-white transition-transform shadow-sm ${
                    autoPlayEnabled 
                      ? 'translate-x-5 md:translate-x-5' 
                      : 'translate-x-0.5 md:translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[400px] md:h-[500px] overflow-y-auto px-3 md:px-4 py-4 md:py-6 space-y-3 md:space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Start chatting with {personaConfig[persona as keyof typeof personaConfig]?.name || 'Assistant'}
            </p>
            <p className="text-gray-400 text-xs">Ask anything about coding, tech, or career advice</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-3 md:mb-4`}
          >
            <div className={`flex items-start space-x-2 md:space-x-3 max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 mt-1">
                  <Image
                    src={personaConfig[persona as keyof typeof personaConfig]?.avatar || '/next.svg'}
                    alt={personaConfig[persona as keyof typeof personaConfig]?.name || 'Assistant'}
                    width={32}
                    height={32}
                    className="rounded-full object-cover border border-gray-200"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <div
                  className={`px-3 md:px-4 py-2 md:py-3 rounded-2xl ${
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
                
                {message.role === 'assistant' && (
                  <div className="mt-2 ml-1 md:ml-2">
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
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-3 md:mb-4">
            <div className="flex items-start space-x-2 md:space-x-3 max-w-[85%] md:max-w-[75%]">
              <div className="flex-shrink-0 mt-1">
                <Image
                  src={personaConfig[persona as keyof typeof personaConfig]?.avatar || '/next.svg'}
                  alt={personaConfig[persona as keyof typeof personaConfig]?.name || 'Assistant'}
                  width={32}
                  height={32}
                  className="rounded-full object-cover border border-gray-200"
                />
              </div>
              
              <div className="bg-gray-50 text-gray-800 px-3 md:px-4 py-2 md:py-3 rounded-2xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-3 md:px-4 py-3 md:py-4 border-t border-gray-100/50 bg-gray-50/30">
        <div className="flex items-end space-x-2 md:space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white border border-gray-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent resize-none text-sm placeholder:text-gray-400 shadow-sm min-h-[44px]"
              rows={1}
              disabled={isLoading}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 md:p-3 bg-black text-white rounded-xl md:rounded-2xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:shadow-none min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 md:h-5 md:w-5"
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
