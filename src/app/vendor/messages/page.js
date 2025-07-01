'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import VendorDashboardLayout from '@/components/vendor/layout/VendorLayout';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  PhoneIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import Loader from '@/components/shared/Loader';

export default function VendorMessagesPage() {
  const { data: session } = useSession();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (session?.user?.id) fetchChats();
  }, [session]);

  useEffect(() => {
    if (selectedChat) {
      const interval = setInterval(() => fetchMessages(selectedChat), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats');
      if (!response.ok) throw new Error('Failed to fetch chats');
      const data = await response.json();
      setChats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await fetch(`/api/messages?chatId=${chatId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/search/users?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleChatSelect = async (user) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: user.id,
          content: 'Chat started',
          isVendor: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to initialize chat');
      const data = await response.json();
      setSelectedChat(data.chatId);
      if (isMobileView) setShowChatWindow(true);
      setSearchQuery('');
      setSearchResults([]);
      await fetchChats();
      await fetchMessages(data.chatId);
    } catch (err) {
      console.error('Chat initialization error:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChat,
          content: message,
          isVendor: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      setMessage('');
      await fetchMessages(selectedChat);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) return <Loader/>;
  if (error) return <div>Error: {error}</div>;

  return (
    <VendorDashboardLayout>
      <div className="flex h-[calc(100vh-177px)] m-6 shadow-lg border-[0.2px] border-gray-200/80 rounded-xl bg-white text-gray-800">

        {/* Sidebar */}
        <div className={`md:block w-full md:w-1/3 p-4 overflow-auto bg-gray-100 rounded-l-xl ${isMobileView && showChatWindow ? 'hidden' : ''}`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full py-2 px-4 mb-2 rounded-xl border-[0.2px] border-gray-300 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="mb-4 rounded-xl">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleChatSelect(user)}
                  className="p-3 mt-2 rounded-xl cursor-pointer flex items-center gap-3 hover:bg-gray-200"
                >
                  {user.profile?.avatar ? (
                    <img src={user.profile.avatar} className="w-10 h-10 rounded-full" />
                  ) : (
                    <UserCircleIcon className="w-10 h-10 text-gray-400" />
                  )}
                  <div>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm flex items-center text-gray-500">
                      <PhoneIcon className="w-4 h-4 mr-1" />
                      {user.profile?.phoneNumber || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchResults.length === 0 && chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat.id);
                fetchMessages(chat.id);
                if (isMobileView) setShowChatWindow(true);
              }}
              className={`p-3 mt-2 rounded-xl cursor-pointer flex items-center gap-3 ${
                selectedChat === chat.id ? 'bg-indigo-100' : 'hover:bg-gray-200'
              }`}
            >
              {chat.user.profile?.avatar ? (
                <img src={chat.user.profile.avatar} className="w-10 h-10 rounded-full" />
              ) : (
                <UserCircleIcon className="w-10 h-10 text-gray-400" />
              )}
              <div>
                <div className="font-semibold">{chat.user.name}</div>
                {chat.messages[0] && (
                  <div className="text-sm text-gray-500 truncate max-w-[150px]">
                    {chat.messages[0].content}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col border-l-[0.2px] border-gray-300 rounded-r-xl ${isMobileView && !showChatWindow ? 'hidden' : ''}`}>
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="flex items-center px-4 py-3 bg-indigo-100 rounded-tr-xl gap-3 shadow-sm">
                <button
                  onClick={() => isMobileView && setShowChatWindow(false)}
                  className="md:hidden"
                >
                  <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                </button>
                {(() => {
                  const chatInfo = chats.find((c) => c.id === selectedChat);
                  if (!chatInfo) return null;
                  const profile = chatInfo.user.profile;
                  return (
                    <>
                      {profile?.avatar ? (
                        <img src={profile.avatar} className="w-10 h-10 rounded-full" />
                      ) : (
                        <UserCircleIcon className="w-10 h-10 text-gray-400" />
                      )}
                      <div>
                        <div className="font-semibold text-gray-800">{chatInfo.user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <PhoneIcon className="w-4 h-4 mr-1" />
                          {profile?.phoneNumber || 'N/A'}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-3 flex flex-col ${
                      msg.isVendor ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-xl max-w-xs text-sm leading-tight ${
                        msg.isVendor ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 ml-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white rounded-b-xl shadow-inner">
                <div className="flex space-x-2">
                  <textarea
                    rows={1}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 p-2 rounded-xl resize-none border-[0.2px] border-gray-300 bg-gray-100"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a chat or start a new conversation
            </div>
          )}
        </div>
      </div>
    </VendorDashboardLayout>
  );
}
