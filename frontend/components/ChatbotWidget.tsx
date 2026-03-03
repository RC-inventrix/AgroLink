"use client"

import { useState, useRef, useEffect } from "react"
import ReactMarkdown from 'react-markdown'

interface Message {
    id: string
    role: "user" | "bot"
    text: string
}

const WELCOME_MESSAGE: Message = {
    id: "welcome",
    role: "bot",
    text: "👋 Hi! I'm the AgroLink Support Assistant. How can I help you today?",
}

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null) // <-- NEW: Reference to control the input cursor

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isOpen])

    // NEW: Automatically put the cursor back in the input box when loading finishes
    useEffect(() => {
        if (!isLoading && isOpen) {
            inputRef.current?.focus()
        }
    }, [isLoading, isOpen])

    // NEW: Proper reset function that restores the welcome message
    const resetChat = () => {
        setMessages([WELCOME_MESSAGE])
        setInput("")
        setIsLoading(false)
    }

    const sendMessage = async () => {
        const trimmed = input.trim()
        if (!trimmed || isLoading) return

        setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: "user", text: trimmed }])
        setInput("")
        setIsLoading(true)

        // NEW: Failsafe timeout. If the server hangs, unlock the input after 10 seconds.
        const safetyTimeout = setTimeout(() => {
            setIsLoading(false)
        }, 10000)

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/api/chatbot/chat`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: trimmed }),
                }
            )

            if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`)
            const data = await res.json()
            setMessages((prev) => [...prev, { id: `bot-${Date.now()}`, role: "bot", text: data.reply }])

        } catch (error) {
            console.error("Chatbot frontend error:", error)
            setMessages((prev) => [
                ...prev,
                {
                    id: `bot-err-${Date.now()}`,
                    role: "bot",
                    text: "Sorry, I'm having trouble connecting right now. Please try again later.",
                },
            ])
        } finally {
            clearTimeout(safetyTimeout) // Clear the timeout if the request succeeds
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") sendMessage()
    }

    return (
        <>
            {/* FAB Button */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? "Close support chat" : "Open support chat"}
                style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    zIndex: 9999,
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                    fontSize: "24px",
                    transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background = "#15803d"
                }}
                onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background = "#16a34a"
                }}
            >
                {isOpen ? "✕" : "💬"}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "90px",
                        right: "24px",
                        zIndex: 9998,
                        width: "360px",
                        maxWidth: "calc(100vw - 48px)",
                        height: "480px",
                        borderRadius: "16px",
                        background: "#ffffff",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        fontFamily: "inherit",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            background: "#16a34a",
                            color: "#fff",
                            padding: "14px 16px",
                            fontWeight: 600,
                            fontSize: "15px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <span style={{ fontSize: "20px" }}>🌿</span>
                        AgroLink Support

                        {/* UPDATED: Calls the proper resetChat function */}
                        <button
                            onClick={resetChat}
                            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}>
                            Reset Chat
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                        }}
                    >
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    display: "flex",
                                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: "80%",
                                        padding: "8px 12px",
                                        borderRadius:
                                            msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                        background: msg.role === "user" ? "#16a34a" : "#f3f4f6",
                                        color: msg.role === "user" ? "#fff" : "#111827",
                                        fontSize: "14px",
                                        lineHeight: "1.5",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {/* Markdown Renderer ensures bullet points and bold text look perfect */}
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                <div
                                    style={{
                                        padding: "8px 14px",
                                        borderRadius: "16px 16px 16px 4px",
                                        background: "#f3f4f6",
                                        color: "#6b7280",
                                        fontSize: "14px",
                                    }}
                                >
                                    Typing…
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div
                        style={{
                            borderTop: "1px solid #e5e7eb",
                            padding: "10px 12px",
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                        }}
                    >
                        <input
                            ref={inputRef} // <-- NEW: Ref attached to input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a question…"
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                padding: "8px 12px",
                                fontSize: "14px",
                                outline: "none",
                                background: isLoading ? "#f9fafb" : "#fff",
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                            aria-label="Send message"
                            style={{
                                background: isLoading || !input.trim() ? "#9ca3af" : "#16a34a",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                padding: "8px 14px",
                                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                                fontSize: "14px",
                                fontWeight: 600,
                                transition: "background 0.2s",
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}