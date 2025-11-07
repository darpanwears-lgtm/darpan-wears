
'use client';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn, generateColorFromString } from '@/lib/utils';
import { format } from 'date-fns';
import type { ChatMessage, UserProfile } from '@/lib/types';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';


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
                    {message.timestamp ? format(new Date(message.timestamp), 'p') : 'sending...'}
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

export default function ChatPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const userProfileRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
    const {data: userProfile} = useDoc<UserProfile>(userProfileRef);

    useEffect(() => {
        if (!isUserLoading && !user) {
            toast({
                title: 'Please Log In',
                description: 'You need to be logged in to access the chat.',
                variant: 'destructive'
            });
            router.push('/');
        }
    }, [user, isUserLoading, router, toast]);

    const messagesQuery = useMemoFirebase(
        () => (user && firestore ? query(collection(firestore, 'chats', user.uid, 'messages'), orderBy('timestamp', 'asc')) : null),
        [user, firestore]
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
        if (!message.trim() || !user || !firestore) return;
        
        setIsSending(true);

        const messagesColRef = collection(firestore, 'chats', user.uid, 'messages');
        const messageText = message;
        setMessage('');

        const messageData = {
            senderId: user.uid,
            senderName: userProfile?.name || 'Anonymous',
            text: messageText,
            timestamp: Date.now()
        };

        try {
            await addDoc(messagesColRef, messageData);
        } catch (error) {
            console.error("Error sending message:", error);
            toast({ title: 'Error', description: 'Could not send message.', variant: 'destructive' });
            setMessage(messageText); // Restore message on error
        } finally {
            setIsSending(false);
        }
    };
    
    if (isUserLoading || !user) {
        return <div className="flex justify-center items-center h-[calc(100vh-8rem)]"> <Loader2 className="animate-spin h-8 w-8" /> </div>;
    }

    const userInitial = getInitials(userProfile?.name);
    const userColor = generateColorFromString(userProfile?.name || user.uid);
    const adminInitial = 'A';
    const adminColor = generateColorFromString('Admin');

    return (
        <div className="container mx-auto py-8 flex justify-center">
            <Card className="w-full max-w-3xl h-[calc(100vh-10rem)] flex flex-col">
                <CardHeader>
                    <CardTitle>Chat with Admin</CardTitle>
                    <CardDescription>Ask questions or get help with your orders.</CardDescription>
                </CardHeader>
                <CardContent ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-3">
                    {messagesLoading && <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-6 w-6"/></div>}
                    {messages && messages.map(msg => {
                        const isSender = msg.senderId === user.uid;
                        return (
                            <ChatBubble 
                                key={msg.id} 
                                message={msg} 
                                isSender={isSender}
                                senderInitial={isSender ? userInitial : adminInitial}
                                senderColor={isSender ? userColor : adminColor}
                            />
                        )
                    })}
                     {messages && messages.length === 0 && !messagesLoading && (
                        <div className="text-center text-muted-foreground pt-10">No messages yet. Say hello!</div>
                     )}
                </CardContent>
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
            </Card>
        </div>
    )
}
