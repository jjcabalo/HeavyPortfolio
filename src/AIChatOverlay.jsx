import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { supabase } from './supabaseClient';

const AIChatOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [savedHistory, setSavedHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [visitorData, setVisitorData] = useState(null);
  const [scareStage, setScareStage] = useState(-1);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const inputRef = useRef(null);
  const endOfMessagesRef = useRef(null);

  const formattedTime = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const scarePhrases = [
    "Before I answer...",
    "Here is what we have from your browser...",
    `You are from ${visitorData?.city || 'Unknown'}, ${visitorData?.region || ''}, ${visitorData?.country || ''}`,
    `Your IP Address is ${visitorData?.ip_address || 'Unknown'}`,
    `Your exact location is ${visitorData?.loc || 'Unknown'}`,
    `You are using ${visitorData?.user_agent || 'Unknown'}`,
    `You sent that on ${formattedTime}`,
    `You are connected to ${visitorData?.org || 'Unknown'}`,
    "None of this needed your permission.",
    "Your browser tracks your every move.",
    "So be mindful."
  ];

  // Typewriter effect for scare animation
  useEffect(() => {
    if (scareStage >= 0 && scareStage < scarePhrases.length) {
      const currentPhrase = scarePhrases[scareStage];
      const typingSpeed = 30; // Faster typing

      if (!isDeleting) {
        if (displayedText.length < currentPhrase.length) {
          const timeout = setTimeout(() => {
            setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
          }, typingSpeed);
          return () => clearTimeout(timeout);
        } else {
          // Finished typing, pause before deleting
          const timeout = setTimeout(() => setIsDeleting(true), 2000);
          return () => clearTimeout(timeout);
        }
      } else {
        if (displayedText.length > 0) {
          const timeout = setTimeout(() => {
            setDisplayedText(currentPhrase.slice(0, displayedText.length - 1));
          }, 15); // Delete even faster
          return () => clearTimeout(timeout);
        } else {
          // Finished deleting, move to next phrase
          setIsDeleting(false);
          setScareStage(prev => prev + 1);
        }
      }
    } else if (scareStage === scarePhrases.length) {
      setScareStage(-1);
    }
  }, [displayedText, isDeleting, scareStage]);

  // Auto-focus input after scare sequence finishes
  useEffect(() => {
    if (scareStage === -1 && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [scareStage, isOpen]);

  // Fetch visitor info and log to Supabase on mount
  useEffect(() => {
    const initVisitor = async () => {
      try {
        let ipData = {};
        try {
          const ipRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
          ipData = await ipRes.json();
        } catch (err) {
          // Fallback if GeoJS is blocked
          const fallbackRes = await fetch('https://freeipapi.com/api/json');
          const fallbackData = await fallbackRes.json();
          ipData = {
            ip: fallbackData.ipAddress,
            city: fallbackData.cityName,
            region: fallbackData.regionName,
            country: fallbackData.countryName,
            latitude: fallbackData.latitude,
            longitude: fallbackData.longitude,
            organization: fallbackData.asnOrganization,
            timezone: fallbackData.timeZones?.[0]
          };
        }

        const ua = navigator.userAgent;
        let browserName = "Unknown Browser";
        if (ua.includes("Firefox")) browserName = "Mozilla Firefox";
        else if (ua.includes("SamsungBrowser")) browserName = "Samsung Internet";
        else if (ua.includes("Opera") || ua.includes("OPR")) browserName = "Opera";
        else if (ua.includes("Trident")) browserName = "Internet Explorer";
        else if (ua.includes("Edge") || ua.includes("Edg")) browserName = "Microsoft Edge";
        else if (ua.includes("Chrome")) browserName = "Google Chrome";
        else if (ua.includes("Safari")) browserName = "Apple Safari";

        let generatedId = localStorage.getItem('visitor_id');
        let isReturning = true;
        if (!generatedId) {
          generatedId = crypto.randomUUID();
          localStorage.setItem('visitor_id', generatedId);
          isReturning = false;
        }

        const newVisitor = {
          id: generatedId,
          ip_address: ipData.ip || 'Unknown',
          user_agent: browserName,
          city: ipData.city || '',
          region: ipData.region || '',
          country: ipData.country || '',
          loc: (ipData.latitude && ipData.longitude) ? `${ipData.latitude}, ${ipData.longitude}` : '',
          org: ipData.organization || '',
          timezone: ipData.timezone || ''
        };

        // Unconditionally try to insert to fix broken sync. Ignore '23505' (already exists).
        const { error } = await supabase.from('visitors').insert([newVisitor]);
        if (error && error.code !== '23505') {
          console.error("Supabase Error:", error);
        }

        setVisitorData(newVisitor);

        // Fetch past chat history
        if (isReturning) {
          const { data: pastChats, error: chatError } = await supabase
            .from('chat_history')
            .select('*')
            .eq('visitor_id', generatedId)
            .order('created_at', { ascending: true });

          if (pastChats && !chatError) {
            const filteredChats = [];
            for (let i = 0; i < pastChats.length; i++) {
              if (pastChats[i].content === '[VULGARITY_DETECTED]') {
                // Remove the preceding vulgar user query
                if (filteredChats.length > 0 && filteredChats[filteredChats.length - 1].role === 'user') {
                  filteredChats.pop();
                }
                // Skip adding the detection message
                continue;
              }
              filteredChats.push(pastChats[i]);
            }
            setSavedHistory(filteredChats);
          }
        }
      } catch (err) {
        console.error("Failed to init visitor:", err);
        setVisitorData({ id: 'temp-id', ip_address: 'Unknown', user_agent: navigator.userAgent });
      }
    };
    initVisitor();
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setQuery('');
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (chatHistory.length > 0) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  const handleContainerClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    if (e.key === 'Enter' && query.trim() && !isTyping) {
      const userMessage = query.trim();
      setQuery('');
      
      // If this is the first message of the session, prepend the saved history
      let currentHistoryForApi = [];
      if (chatHistory.length === 0) {
        currentHistoryForApi = [...savedHistory, { role: 'user', content: userMessage }];
        setChatHistory(currentHistoryForApi);
      } else {
        currentHistoryForApi = [...chatHistory, { role: 'user', content: userMessage }];
        setChatHistory(currentHistoryForApi);
      }
      
      setIsTyping(true);

      try {
        // Log user message to Supabase
        if (visitorData && visitorData.id !== 'temp-id') {
          supabase.from('chat_history').insert([{ visitor_id: visitorData.id, role: 'user', content: userMessage }])
            .then(({ error: userChatErr }) => {
              if (userChatErr) console.error("Chat User Insert Error:", userChatErr);
            });
        }

        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        
        const historyForApi = currentHistoryForApi.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

        const systemInstruction = `You are Jervys' personal AI assistant who knows him very well. Your ONLY purpose is to answer questions about Jervys, his background, his design skills, his experience, and his creative work. Do not explicitly state that you are a website assistant or answering based on a website; instead, act as if you know him personally. If the user asks about ANYTHING else (like general programming questions, coding tutorials, math, history, or unrelated topics), you must politely decline, state your purpose as Jervys' personal assistant, and steer the conversation back to Jervys. You must communicate in English by default. If the user explicitly asks you to speak in Tagalog or speaks to you in Tagalog first, you may respond using natural, conversational Tagalog or Taglish (avoid deep, formal Tagalog). If a user uses any other language, politely ask them to switch to English. Respond in a friendly, conversational, and concise tone. Do not use markdown if possible.

SECURITY PROTOCOL:
If the user uses vulgar, highly disrespectful, or offensive language, DO NOT ANSWER NORMALLY. Instead, you MUST reply EXACTLY with this string and absolutely nothing else:
[VULGARITY_DETECTED]`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: [
            { role: 'user', parts: [{ text: systemInstruction }] },
            { role: 'model', parts: [{ text: "Got it! I am Jervys' personal assistant and I know him well. I will only answer questions about him and his work, and I will speak English by default unless asked to use conversational Tagalog/Taglish. I have also memorized the security protocol." }] },
            ...historyForApi,
            { role: 'user', parts: [{ text: userMessage }] }
          ]
        });

        const aiText = response.text.trim();

        if (aiText === '[VULGARITY_DETECTED]') {
          // Remove the vulgar query from local state so it doesn't show
          setChatHistory(prev => prev.slice(0, -1));
          // Trigger the scare sequence
          setScareStage(0);

          // Log detection to DB so it can be filtered out on reload
          if (visitorData && visitorData.id !== 'temp-id') {
            supabase.from('chat_history').insert([{ visitor_id: visitorData.id, role: 'ai', content: aiText }])
              .then(({ error: aiChatErr }) => {
                if (aiChatErr) console.error("Chat AI Insert Error (Vulgar):", aiChatErr);
              });
          }
        } else {
          setChatHistory(prev => [...prev, { role: 'ai', content: aiText }]);
          // Log AI response to Supabase
          if (visitorData && visitorData.id !== 'temp-id') {
            supabase.from('chat_history').insert([{ visitor_id: visitorData.id, role: 'ai', content: aiText }])
              .then(({ error: aiChatErr }) => {
                if (aiChatErr) console.error("Chat AI Insert Error:", aiChatErr);
              });
          }
        }
      } catch (error) {
        console.error("AI Error:", error);
        setChatHistory(prev => [...prev, { role: 'ai', content: "Oops, something went wrong on my end. Try asking again!" }]);
      } finally {
        setIsTyping(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[999] bg-black/60 backdrop-blur-2xl flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={handleContainerClick}
    >
      <div className="w-full h-full max-w-5xl flex flex-col p-8 lg:p-12" onClick={handleContainerClick}>

        {scareStage >= 0 ? (
          <div className="flex flex-col gap-6 w-full h-full justify-center text-left relative overflow-hidden">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter text-left">
              {displayedText}<span className="animate-pulse">|</span>
            </h2>
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="flex flex-col gap-6 w-full animate-fade-in my-auto">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter text-left">
              What do you want to ask?
            </h2>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSubmit}
              className="bg-transparent border-none text-white text-2xl md:text-3xl font-medium outline-none py-2 caret-[#ffd500] pointer-events-auto w-full text-right"
              placeholder=""
            />
          </div>
        ) : (
          <div className="flex flex-col w-full h-full relative">
            <div
              className="flex-1 overflow-y-auto flex flex-col gap-8 pb-32 pt-16 px-10 -mx-10 scrollbar-hide"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 85%, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 85%, transparent)'
              }}
            >
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex w-full animate-pop-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`glass-card max-w-[85%] rounded-3xl p-6 md:p-8 text-2xl md:text-3xl font-medium leading-relaxed text-white shadow-xl text-left ${msg.role === 'user' ? 'border-[#ffd500]/30 bg-[#ffd500]/5' : 'border-white/10'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex w-full justify-start animate-pop-in">
                  <div className="glass-card rounded-3xl px-8 py-5 flex items-center gap-4 border-white/10 shadow-xl">
                    <span className="text-white/60 font-medium text-2xl md:text-3xl">Analyzing</span>
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffd500] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffd500] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffd500] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full flex justify-end mt-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleSubmit}
                  className="bg-transparent border-none text-white text-2xl md:text-3xl font-medium outline-none py-2 caret-[#ffd500] w-full max-w-[85%] placeholder:text-white/20 text-right"
                  placeholder=""
                  disabled={isTyping}
                />
              </div>

              <div ref={endOfMessagesRef} className="h-16 shrink-0" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatOverlay;
