
'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import type { Chat, ChatMessage } from '@/lib/types';
import { cn, generateColorFromString } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, Send } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/auth-context';

function ChatBubble({ message, isSender, senderInitial, senderColor }: { message: ChatMessage, isSender: boolean, senderInitial: string, senderColor: string }) {
    return (
        <div className={cn("flex items-end gap-2", isSender ? "justify-end" : "justify-start")}>
             {!isSender && (
                <Avatar className="h-8 w-8">
                     <AvatarFallback style={{ backgroundColor: senderColor, color: 'white' }}>{senderInitial}</AvatarFallback>
                </Avatar>
            )}
            <div className={cn("max-w-xs md:max-w-md rounded-lg px-4 py-2", isSender ? "bg-primary text-primary-foreground" : "bg-muted")}>
                <p className="text-sm">{message.text}</p>
                 <p className="text-xs text-right mt-1 opacity-70">
                    {message.timestamp ? format(message.timestamp, 'p') : 'sending...'}
                </p>
            </div>
             {isSender && (
                <Avatar className="h-8 w-8">
                    <AvatarFallback style={{ backgroundColor: senderColor, color: 'white' }}>{senderInitial}</AvatarFallback>
                </Avatar>
            )}
        </div>
    )
}

export function AdminChat() {
    const firestore = useFirestore();
    const { isAdmin } = useAuth();
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const chatsQuery = useMemoFirebase(
        () => (firestore ? query(collection(firestore, 'chats'), orderBy('lastMessageTimestamp', 'desc')) : null),
        [firestore]
    );
    const { data: chats, isLoading: chatsLoading } = useCollection<Chat>(chatsQuery);

    const messagesQuery = useMemoFirebase(
        () => (selectedChat && firestore ? query(collection(firestore, 'chats', selectedChat.userId, 'messages'), orderBy('timestamp', 'asc')) : null),
        [selectedChat, firestore]
    );
    const { data: messages, isLoading: messagesLoading } = useCollection<ChatMessage>(messagesQuery);
    
    useEffect(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);
    
    const getInitials = (name: string | undefined | null) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !selectedChat || !firestore || !isAdmin) return;
        
        setIsSending(true);

        const messagesColRef = collection(firestore, 'chats', selectedChat.userId, 'messages');
        const messageData = {
            senderId: 'admin', // Special ID for admin
            text: message,
            timestamp: Date.now()
        };

        try {
            await addDoc(messagesColRef, messageData);
            setMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
            {/* Chat List */}
            <Card className="md:col-span-1 flex flex-col">
                <CardContent className="p-0 flex-grow">
                    <ScrollArea className="h-full">
                         {chatsLoading && <div className="p-4 flex justify-center items-center"><Loader2 className="h-6 w-6 animate-spin"/></div>}
                        {chats && chats.map(chat => (
                            <div key={chat.id} 
                                 className={cn("p-4 border-b cursor-pointer hover:bg-muted/50", selectedChat?.id === chat.id && "bg-muted")}
                                 onClick={() => setSelectedChat(chat)}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback style={{backgroundColor: generateColorFromString(chat.userName), color: 'white'}}>
                                            {getInitials(chat.userName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow overflow-hidden">
                                        <p className="font-semibold truncate">{chat.userName}</p>
                                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground self-start">{format(chat.lastMessageTimestamp, 'p')}</p>
                                </div>
                            </div>
                        ))}
                         {chats && chats.length === 0 && !chatsLoading && (
                            <p className="p-4 text-center text-muted-foreground">No customer chats yet.</p>
                         )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Message Area */}
            <Card className="md:col-span-2 flex flex-col">
                 {selectedChat ? (
                    <>
                        <div className="p-4 border-b">
                            <h3 className="font-semibold">{selectedChat.userName}</h3>
                        </div>
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messagesLoading && <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-6 w-6"/></div>}
                            {messages && messages.map(msg => {
                                const isSender = msg.senderId === 'admin';
                                return (
                                    <ChatBubble 
                                        key={msg.id} 
                                        message={msg} 
                                        isSender={isSender}
                                        senderInitial={isSender ? "A" : getInitials(selectedChat.userName)}
                                        senderColor={isSender ? "var(--primary)" : generateColorFromString(selectedChat.userName)}
                                    />
                                )
                            })}
                        </div>
                        <div className="p-4 border-t">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <Input 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    disabled={isSending}
                                />
                                <Button type="submit" disabled={isSending || !message.trim()} size="icon">
                                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </form>
                        </div>
                    </>
                 ) : (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-muted-foreground">Select a chat to view messages</p>
                    </div>
                 )}
            </Card>
        </div>
    )
}
