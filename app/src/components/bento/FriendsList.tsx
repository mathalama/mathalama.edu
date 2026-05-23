import React, { useState, useEffect, useRef } from 'react';
import { useLmsStore } from '../../store/useLmsStore';
import { Friend } from '../../mocks/db';
import { PublicProfileModal } from './PublicProfileModal';

export const FriendsList: React.FC = () => {
  const { friends, sendMessageToFriend, simulateLivePresence } = useLmsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatFriendId, setActiveChatFriendId] = useState<string | null>(null);
  const [chatMessageText, setChatMessageText] = useState('');
  const [selectedProfileFriend, setSelectedProfileFriend] = useState<Friend | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Run live activity presence updates every 20 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      simulateLivePresence();
    }, 20000);
    return () => clearInterval(timer);
  }, [simulateLivePresence]);

  // Scroll to bottom of chat history when message updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [friends, activeChatFriendId]);

  const activeFriend = friends.find(f => f.id === activeChatFriendId);
  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusDot = (status: Friend['presenceStatus']) => {
    switch (status) {
      case 'online':
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border-2 border-white shadow-sm" />;
      case 'watching_video':
        return <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse border-2 border-white shadow-sm" />;
      case 'doing_quiz':
        return <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse border-2 border-white shadow-sm" />;
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 border-2 border-white shadow-sm" />;
    }
  };

  const getStatusLabelColor = (status: Friend['presenceStatus']) => {
    switch (status) {
      case 'watching_video': return 'text-blue-600 font-bold';
      case 'doing_quiz': return 'text-indigo-600 font-bold';
      case 'online': return 'text-emerald-600 font-bold';
      default: return 'text-zinc-400';
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatFriendId || !chatMessageText.trim()) return;
    sendMessageToFriend(activeChatFriendId, chatMessageText.trim());
    setChatMessageText('');
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-bento p-6 shadow-bento hover:shadow-bento-hover transition-all duration-300 flex flex-col h-[480px]">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-black text-zinc-950 font-outfit tracking-tight flex items-center gap-2">
            Мой Клуб и Друзья 
            <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-bold">
              {friends.filter(f => f.presenceStatus !== 'offline').length} онлайн
            </span>
          </h3>
          <p className="text-xs text-zinc-400">Кликни на аватар для просмотра профиля или на имя для чата</p>
        </div>
      </div>

      {/* Search Input */}
      {!activeChatFriendId && (
        <div className="relative mb-4">
          <input 
            type="text" 
            placeholder="Поиск друзей..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/60 transition-all font-medium text-zinc-800"
          />
          <svg className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      )}

      {/* Friends list container */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {activeChatFriendId && activeFriend ? (
          /* STEAM-STYLE INTEGRATED CHAT */
          <div className="flex flex-col h-full bg-zinc-50 rounded-2xl border border-zinc-100 p-3.5 overflow-hidden">
            
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <img 
                  src={activeFriend.avatar} 
                  alt={activeFriend.name} 
                  onClick={() => setSelectedProfileFriend(activeFriend)}
                  className="w-7 h-7 rounded-lg object-cover cursor-pointer hover:opacity-85 border border-zinc-200 shadow-sm"
                />
                <div>
                  <h4 
                    onClick={() => setSelectedProfileFriend(activeFriend)}
                    className="text-xs font-black text-zinc-950 hover:underline cursor-pointer"
                  >
                    {activeFriend.name}
                  </h4>
                  <span className="text-[9px] text-zinc-500 font-bold block leading-tight">
                    {activeFriend.presenceContext}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => setActiveChatFriendId(null)}
                className="text-xs font-bold text-zinc-400 hover:text-zinc-600 px-2 py-1 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                Назад
              </button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 mb-3 bg-white border border-zinc-200/50 rounded-xl p-3">
              {activeFriend.chatHistory.length > 0 ? (
                activeFriend.chatHistory.map((msg, index) => {
                  const isMe = msg.senderId === 'current-student';
                  return (
                    <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-normal font-medium shadow-sm border ${
                        isMe 
                          ? 'bg-brand text-white border-brand-dark rounded-tr-none' 
                          : 'bg-zinc-50 text-zinc-800 border-zinc-200 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-zinc-400 mt-1 font-bold">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-400 text-[11px] font-bold text-center">
                  Нет сообщений. Поздоровайтесь первым! 👋
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Сообщение..."
                value={chatMessageText}
                onChange={(e) => setChatMessageText(e.target.value)}
                className="flex-1 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 font-medium text-zinc-800"
              />
              <button 
                type="submit"
                className="bg-brand hover:bg-brand-dark text-white px-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center active:scale-95 shadow border border-brand-dark"
              >
                Отправить
              </button>
            </form>
          </div>
        ) : (
          /* STANDARD LIST VIEW */
          filteredFriends.map((friend) => (
            <div 
              key={friend.id} 
              className="flex items-center justify-between p-2 rounded-2xl hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-all duration-150"
            >
              <div className="flex items-center gap-3.5">
                {/* Avatar click opens public profile */}
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => setSelectedProfileFriend(friend)}
                  title="Посмотреть глобальный профиль"
                >
                  <img 
                    src={friend.avatar} 
                    alt={friend.name} 
                    className="w-10 h-10 rounded-2xl object-cover border border-zinc-200/80 group-hover:scale-105 group-hover:shadow-md transition-all duration-150"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5">
                    {getStatusDot(friend.presenceStatus)}
                  </div>
                </div>

                <div>
                  <h4 
                    onClick={() => setActiveChatFriendId(friend.id)}
                    className="text-xs font-black text-zinc-950 hover:text-brand cursor-pointer hover:underline font-outfit"
                  >
                    {friend.name}
                  </h4>
                  <span className={`text-[10px] ${getStatusLabelColor(friend.presenceStatus)} block leading-normal`}>
                    {friend.presenceContext}
                  </span>
                </div>
              </div>

              {/* Chat action button */}
              <button 
                onClick={() => setActiveChatFriendId(friend.id)}
                className="text-[10px] font-black text-brand bg-brand-light hover:bg-brand hover:text-white px-3 py-1.5 rounded-xl border border-brand/10 transition-all shadow-sm active:scale-95 uppercase tracking-wide"
              >
                Чат
              </button>
            </div>
          ))
        )}
      </div>

      {/* Steam-Style Public Profile Overlay */}
      {selectedProfileFriend && (
        <PublicProfileModal 
          isOpen={!!selectedProfileFriend} 
          onClose={() => setSelectedProfileFriend(null)} 
          student={selectedProfileFriend}
        />
      )}
    </div>
  );
};
