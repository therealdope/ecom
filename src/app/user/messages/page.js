'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import UserDashboardLayout from '@/components/user/layout/UserDashboardLayout';
import { UserIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function MessagesPage() {
  const { data: session } = useSession();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchChats();
    }
  }, [session]);

  useEffect(() => {
    if (selectedChat) {
      const interval = setInterval(() => {
        fetchMessages(selectedChat);
      }, 3000);
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

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 2) {
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

  const handleChatSelect = async (vendor) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: vendor.id,
          content: 'Chat started',
          isVendor: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize chat');
      }

      const data = await response.json();
      setSelectedChat(data.chatId);
      setSearchQuery('');
      setSearchResults([]);
      await fetchChats();
      await fetchMessages(data.chatId);
    } catch (err) {
      console.error('Chat initialization error:', err);
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
          isVendor: false
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      setMessage('');
      await fetchMessages(selectedChat);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <UserDashboardLayout>
      <div className="flex h-screen">
        {/* Chat list (sidebar) - hidden on mobile when a chat is selected */}
        <div
          className={`md:block w-full md:w-1/3 border-r p-4 overflow-auto bg-white ${
            selectedChat ? 'hidden' : ''
          }`}
        >
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full p-2 border rounded mb-4"
          />
          {searchResults.length > 0 && (
            <div className="mb-4 border rounded bg-white">
              {searchResults.map((vendor) => (
                <div
                  key={vendor.id}
                  onClick={() => handleChatSelect(vendor)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {vendor.name}
                </div>
              ))}
            </div>
          )}

          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat.id);
                fetchMessages(chat.id);
              }}
              className={`p-2 rounded cursor-pointer flex items-center space-x-2 ${
                selectedChat === chat.id ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
            >
              {chat.vendor.profile?.logo ? (
                <img
                  src={chat.vendor.profile.logo}
                  alt={chat.vendor.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-gray-400" />
              )}
              <div>
                <div className="font-semibold">{chat.vendor.name}</div>
                {chat.messages[0] && (
                  <div className="text-sm text-gray-500 truncate max-w-[150px]">
                    {chat.messages[0].content}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Chat window */}
        <div
          className={`flex-1 flex flex-col ${
            !selectedChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedChat ? (
            <>
              {/* Chat header with back button on small screens */}
              <div className="flex items-center px-4 py-3 border-b bg-white shadow-sm space-x-3">
                {/* Back button on small screens */}
                <button
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden focus:outline-none"
                >
                  <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                </button>

                {(() => {
                  const chatInfo = chats.find((c) => c.id === selectedChat);
                  if (!chatInfo) return null;
                  const profile = chatInfo.vendor.profile;
                  return (
                    <>
                      {profile?.logo ? (
                        <img
                          src={profile.logo}
                          alt={chatInfo.vendor.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <UserIcon className="w-10 h-10 text-gray-400" />
                      )}
                      <div>
                        <div className="font-semibold">{chatInfo.vendor.name}</div>
                        <div className="text-sm text-gray-500">Online</div>
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
                    className={`mb-4 flex flex-col ${
                      msg.isVendor ? 'items-start' : 'items-end'
                    }`}
                  >
                    <div
                      className={`inline-block p-3 rounded-xl max-w-xs text-sm leading-snug ${
                        msg.isVendor
                          ? 'bg-white border text-gray-900'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
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
                    className="flex-1 p-2 border rounded resize-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a chat or start a new conversation
            </div>
          )}
        </div>
      </div>
    </UserDashboardLayout>
  );
}
