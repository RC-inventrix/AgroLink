"use client"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, ImageIcon, Loader2, CheckCheck, MoreVertical, Star, Edit } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Message {
  id: string
  senderId: number
  content: string
  imageUrl?: string | null
  timestamp: string
  isCurrentUser: boolean
  isRead?: boolean 
}

interface MessageViewProps {
  conversation: any
  messages: Message[]
  onSendMessage: (content: string, imageUrl?: string) => void
}

export function MessageView({ conversation, messages, onSendMessage }: MessageViewProps) {
  const [inputValue, setInputValue] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""); 

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        onSendMessage("[Image]", data.secure_url);
      }
    } catch (err) {
      console.error("Cloudinary Error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header logic remains the same */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.isCurrentUser && "flex-row-reverse")}>
            <div className={cn("flex flex-col gap-1 max-w-[70%]", message.isCurrentUser && "items-end")}>
              <div className={cn("rounded-lg px-4 py-2", message.isCurrentUser ? "bg-[#2d5016] text-white" : "bg-gray-100 text-gray-900")}>
                {message.imageUrl && (
                  <img src={message.imageUrl} alt="chat" className="max-w-xs rounded-md mb-2 cursor-pointer hover:opacity-90" onClick={() => window.open(message.imageUrl, '_blank')} />
                )}
                {message.content !== "[Image]" && <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-500">{new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                {message.isCurrentUser && <CheckCheck className={cn("h-3 w-3", message.isRead ? "text-blue-500" : "text-gray-400")} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-end gap-2">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          <Button variant="ghost" size="icon" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
          </Button>
          <Input placeholder="Type a message..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
          <Button onClick={handleSend} className="bg-[#f4a522] text-white h-10 px-6"><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  )
}