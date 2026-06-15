/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../types";
import { Send, Sparkles, BookOpen, MessageSquare, Coffee, HelpCircle } from "lucide-react";

export const BookCompanionChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat logs or set initial greeting welcome
  useEffect(() => {
    const saved = localStorage.getItem("midusa_chat_history");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const initial: ChatMessage[] = [
        {
          id: "msg-1",
          sender: "saga",
          text: "Greetings, bibliophile. I am Midusa AI, your digital library oracle. I can help summarize any book in our collection, construct mind-bending discussion questions, or recommend your next masterpiece. What shall we explore together today?",
          timestamp: new Date().toISOString(),
          suggestedPrompts: [
            "Summarize 'The Midnight Library'",
            "Discussion prompts for 'Dune'",
            "Recommend a psychological thriller",
            "Core themes of 'Klara and the Sun'"
          ],
        },
      ];
      setMessages(initial);
      localStorage.setItem("midusa_chat_history", JSON.stringify(initial));
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("midusa_chat_history", JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getMockAIResponse = (userText: string): string => {
    const text = userText.toLowerCase();

    // Summary keyword triggers
    if (text.includes("summary") || text.includes("summarize")) {
      if (text.includes("midnight library")) {
        return `### 📖 Summary: *The Midnight Library* by Matt Haig \n\n**The Premise:** Nora Seed finds herself in a magical library between life and death. Every book on the shelf offers a chance to live another life she *could* have lived if she had made different choices.\n\n**Core Themes We Discuss:** \n1. **The Weight of Regret:** How focusing on 'what if' blinds us to present beauty.\n2. **Ordinary Magic:** The realization that an ordinary life can be deeply extraordinary.\n3. **Multiverse Philosophy:** A beautiful fictional framing of modern quantum decision-making.\n\n*Would you like me to generate 5 tailored discussion prompts for your club members based on Nora's journey?*`;
      }
      if (text.includes("dune")) {
        return `### 🏜️ Summary: *Dune* by Frank Herbert\n\nSet in the far future amidst a feudal interstellar empire, *Dune* follows young Paul Atreides as his family accepts the stewardship of the dangerous desert planet Arrakis (Dune), the only source of the most valuable substance in the universe: the spice Melange.\n\n**Themes to Highlight:**\n- **Ecological Balance:** Life adapting to extreme scarcity and climate change.\n- **Heroic Deification:** Herbert's brilliant warning against putting blind faith in charismatic leaders.\n- **Socio-Political Feudalism:** Power dynamics, religious engineering, and resource monopolies.\n\n*Highly recommended for discussion on resource scarcity and moral leadership!*`;
      }
      if (text.includes("klara")) {
        return `### ☀️ Summary: *Klara and the Sun* by Kazuo Ishiguro\n\nNarrated by Klara, an Artificial Friend with outstanding observational qualities, this quiet, poetic masterpiece explores her devotion to Josie, a sick teenager she is purchased to companion.\n\n**Key Discussion Strands:**\n1. **What is Love?** Can an artificial being possess a soul, or are they just matching algorithms?\n2. **The Sun as Deity:** Klara's beautiful, naive belief in the healing power of solar light.\n3. **Class Divisions:** High-stakes genetics, tutoring, and emotional substitution.\n\n*A gorgeous book choice for introducing ethical dilemmas around AI!*`;
      }
      return `### 📚 Midusa reads summaries\n\nI can summarize any book you are reading! Here are summaries we frequently analyze in the Sanctuary:\n- **The Midnight Library** (Regrets, multi-verses, second chances)\n- **Dune** (Ecology, mysticism, leadership boundaries)\n- **Klara and the Sun** (Artificial companionship, love, devotion)\n\n*Simply type: 'Summarize [Book Title]' or tell me any genre you are currently focusing on.*`;
    }

    // Prompts / list triggers
    if (text.includes("discussion") || text.includes("prompt") || text.includes("questions")) {
      let bookName = "your current read";
      if (text.includes("dune")) bookName = "Dune";
      else if (text.includes("midnight")) bookName = "The Midnight Library";
      else if (text.includes("klara")) bookName = "Klara and the Sun";

      return `### 🏺 Discussion Prompts for *${bookName}*\n\nHere are 4 highly evocative prompts for your next Midusa reads lounge discussion: \n\n1. **The Moral Pivot:** If you stood in the protagonist's shoes, would you have made the same choice, or did their pride dictate their downfall? \n2. **Socio-Ecological Mirrors:** How does the setting of the book act as an active character, influencing the psychological state of the cast?\n3. **Aesthetic & Vibe Match:** Which of Midusa's discussion vibes (e.g., *Mind-Bending* or *Poetic*) best matches this chapter, and why?\n4. **Personal Revelation:** Did a specific passage make you reflect on a choice or relationship in your own life?\n\n*Feel free to copy-paste these straight into the Discussion Lounge!*`;
    }

    // Recommendations triggers
    if (text.includes("recommend") || text.includes("recommendation") || text.includes("suggest")) {
      if (text.includes("thriller") || text.includes("mystery")) {
        return `### 🕵️ Recommendation: *The Silent Patient* by Alex Michaelides\n\n- **Vibe:** Dark & Grim, Psychological\n- **For Fans of:** Unreliable narrators and high-stakes twists.\n- **The Premise:** Alicia Berenson, a famous painter, shoots her fashion-photographer husband five times in the face and never speaks another word. Theo Faber, a forensic psychotherapist, attempts to unlock her secrets.\n\n*Alternatively, consider **Sharp Objects** by Gillian Flynn for a deeply atmospheric, poetic slow-burn thriller.*`;
      }
      if (text.includes("scifi") || text.includes("sci-fi") || text.includes("science fiction")) {
        return `### 🚀 Recommendation: *Project Hail Mary* by Andy Weir\n\n- **Vibe:** Mind-Bending, Wholesome\n- **For Fans of:** Technical problem-solving, science-backed exploration, and ultimate camaraderie.\n- **The Premise:** A lone astronaut must save Earth from an extinction-level solar crisis using his scientific wits, with the help of a surprising alien ally.\n\n*For more literary sci-fi, consider **Station Eleven** by Emily St. John Mandel.*`;
      }
      if (text.includes("poetic") || text.includes("classic") || text.includes("literary")) {
        return `### 🌸 Recommendation: *On Earth We're Briefly Gorgeous* by Ocean Vuong\n\n- **Vibe:** Poetic, Heartbreaking\n- **For Fans of:** Epistolary novels, gorgeous lyric prose, and intergenerational family depth.\n- **The Premise:** A young man writes a long letter to his illiterate mother, uncovering family traumas stemming from the Vietnam War.\n\n*A stunningly beautifully written book club pick.*`;
      }
      return `### 🍷 Curated Sanctuary Recommendations\n\nTo give you the most tailored recommendation, what "vibe" are you in the mood for?\n\n- **Psychological Thrillers** (e.g. *The Silent Patient*)\n- **Deep Sci-Fi** (e.g. *Project Hail Mary*)\n- **Poetic Literary Masterpieces** (e.g. *On Earth We're Briefly Gorgeous*)\n\n*Reply with: 'Recommend me a [sci-fi / thriller / poetic] book' and I'll pull the archives.*`;
    }

    // Vibe mentions
    if (text.includes("cozy") || text.includes("wholesome")) {
      return `### ☕ Cozy & Wholesome Readings\n\nIf you are looking for gentle, atmospheric reads to pair with herbal tea in the Reading Room, I highly recommend:\n- **The House in the Cerulean Sea** by TJ Klune (pure joy and acceptance)\n- **The Midnight Library** by Matt Haig (comforting reflections on life)\n\n*Both pairs beautifully with our 'Hearthside Crackle' fireplace ambient acoustic.*`;
    }

    // Default response
    return `### 🏛️ Midusa Reads Companion guidance\n\nI have parsed your request, but I want to make sure I deliver absolute literary precision. I am fully versed in:\n\n- **Detailed Summaries:** (Ask: *"Summarize Klara and the Sun"*\n- **Bespoke Recommendations:** (Ask: *"Recommend me a sci-fi book"* or *"What thriller is trending?"*)\n- **Discussion Lounge Starters:** (Ask: *"Give me Dune discussion questions"*)\n\nWhat literary sanctuary choice can I curate next?`;
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // 2. Add temporary typing response from Saga
    const typingId = `type-${Date.now()}`;
    const typingMsg: ChatMessage = {
      id: typingId,
      sender: "saga",
      text: "Consulting Midusa's extensive literary archive...",
      timestamp: new Date().toISOString(),
      isTyping: true,
    };

    setMessages((prev) => [...prev, typingMsg]);

    // 3. Complete response after realistic timeout
    setTimeout(() => {
      const systemResponse = getMockAIResponse(textToSend);
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== typingId);
        return [
          ...filtered,
          {
            id: `sys-${Date.now()}`,
            sender: "saga",
            text: systemResponse,
            timestamp: new Date().toISOString(),
          },
        ];
      });
    }, 1300);
  };

  // Render markdown helper (since user mentioned we can style it ourselves easily)
  const formatMsgText = (text: string) => {
    return text.split("\n\n").map((para, i) => {
      if (para.startsWith("### ")) {
        return (
          <h4 key={i} className="text-sm font-serif font-bold text-[#2C1D11] border-b border-[#E8EDE9] pb-1.5 mt-4 mb-2 first:mt-0 tracking-tight">
            {para.substring(4)}
          </h4>
        );
      }
      if (para.startsWith("**")) {
        // Quick list parser or bold parser
        return (
          <div key={i} className="my-2 bg-[#F5EFEB]/50 p-3 rounded-xl border border-[#E8EDE9] text-xs leading-relaxed italic text-[#2C1D11]">
            {para}
          </div>
        );
      }
      // Parse markdown-like list bullets safely
      if (para.includes("- ")) {
        return (
          <ul key={i} className="list-disc pl-5 my-2.5 space-y-1.5 text-xs text-[#2C1D11]">
            {para.split("\n").map((li, j) => (
              <li key={j}>{li.replace("- ", "").replace(/\*\*/g, "")}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={i} className="text-xs leading-relaxed text-[#2C1D11] mb-2 last:mb-0">
          {para.replace(/\*\*/g, "")}
        </p>
      );
    });
  };

  return (
    <div id="saga-ai-chat" className="bg-white rounded-3xl border border-[#E8EDE9] shadow-sm flex flex-col h-[650px] overflow-hidden animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#3C0002] to-[#1F0001] text-[#FDFBF7] p-5.5 flex items-center justify-between border-b border-[#F40009]/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#F40009]/20 border border-[#F40009]/40 flex items-center justify-center text-[#FFEBEB] animate-pulse">
            <Sparkles className="w-4.5 h-4.5 text-[#F40009]" />
          </div>
          <div>
            <h3 className="text-sm tracking-wide font-serif font-bold text-[#FFFDF9]">Midusa AI Companion</h3>
            <span className="text-xxxxs tracking-wider uppercase text-[#FFEBEB]/80 block font-mono">
              Offline Literary Companion • Actively Synthesized
            </span>
          </div>
        </div>
        <span className="bg-[#F40009]/20 text-[#FFEBEB] font-mono text-xxxxs px-2.5 py-1 rounded-full border border-[#F40009]/40">
          SENSING ACTIVE
        </span>
      </div>

      {/* Chat History Frame */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#FDFBF7]/40">
        {messages.map((msg) => {
          const isMe = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar Icon */}
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isMe ? "bg-[#1B0203] text-[#FDFBF7]" : "bg-[#F40009] text-[#FDFBF7]"
                }`}
              >
                <span className="text-xs font-mono font-bold">{isMe ? "ME" : "MI"}</span>
              </div>

              {/* Message bubble */}
              <div className="space-y-1">
                <div 
                  className={`p-4 rounded-2xl shadow-xxs border ${
                    isMe 
                      ? "bg-white border-[#E8EDE9] rounded-tr-none text-[#2C1D11]" 
                      : "bg-white border-[#C5A03A]/10 rounded-tl-none text-[#2C1D11]"
                  }`}
                >
                  {formatMsgText(msg.text)}

                  {/* Typing placeholder animation */}
                  {msg.isTyping && (
                    <div className="flex items-center gap-1 mt-2.5">
                      <span className="h-1.5 w-1.5 bg-[#5A7065] rounded-full animate-bounce"></span>
                      <span className="h-1.5 w-1.5 bg-[#5A7065] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-1.5 w-1.5 bg-[#5A7065] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  )}
                </div>

                {/* Quick Interactive Prompt Suggestions */}
                {!isMe && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 pl-1">
                    {msg.suggestedPrompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSend(prompt)}
                        type="button"
                        className="text-xxs bg-white hover:bg-[#F5EFEB] border border-[#E8EDE9] px-2.5 py-1.5 rounded-xl transition-all text-[#5A7065] font-light cursor-pointer shadow-xxxxs"
                      >
                        ⚡ {prompt}
                      </button>
                    ))}
                  </div>
                )}
                
                <span className="text-xxxxs text-[#5A7065] block pl-1 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-4 bg-white border-t border-[#E8EDE9] flex gap-3 items-center"
      >
        <input
          type="text"
          placeholder="Inscribe a query... (e.g. 'Recommend a thriller')"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-[#FDFBF7] border border-[#E8EDE9] rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:border-[#5A7065] transition-all text-[#2C1D11] placeholder-[#5A7065]/50"
        />

        <button
          type="submit"
          className="p-3.5 bg-[#F40009] hover:bg-[#B80006] text-[#FDFBF7] rounded-xl transition-colors shrink-0 cursor-pointer shadow-md flex items-center justify-center"
          title="Send query to Midusa Oracle"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
};
