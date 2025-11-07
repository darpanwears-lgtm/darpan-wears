
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { generateColorFromString } from '@/lib/utils';
import { SendHorizonal, Bot } from 'lucide-react';
import { generateChatResponse } from '@/ai/flows/chat-flow';
import type { ChatInput } from '@/ai/flows/chat-shared';
import type { ChatMessage } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ChatPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const messagesCollection = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'chats', user.uid, 'messages') : null),
    [firestore, user]
  );

  const messagesQuery = useMemoFirebase(
    () => (messagesCollection ? query(messagesCollection, orderBy('timestamp', 'asc')) : null),
    [messagesCollection]
  );

  const { data: messages, isLoading: isMessagesLoading } = useCollection<ChatMessage>(messagesQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/chat');
    }
  }, [isUserLoading, user, router]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A bit of a hack to scroll to the bottom.
        // We get the underlying DOM element from the Radix component
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if(viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user || !firestore || !messagesCollection) return;

    const userMessage: Omit<ChatMessage, 'id'> = {
      senderId: 'user',
      text: inputMessage,
      timestamp: Date.now(),
    };

    setInputMessage('');
    setIsSending(true);

    try {
      // Add user message to Firestore
      await addDoc(messagesCollection, userMessage);

      // Prepare history for AI
      const history: ChatInput['history'] = (messages || []).map(m => ({
          senderId: m.senderId,
          text: m.text,
      }));
      history.push({ senderId: 'user', text: userMessage.text });

      // Get AI response
      const aiResponse = await generateChatResponse({ history });

      const aiMessage: Omit<ChatMessage, 'id'> = {
        senderId: 'ai',
        text: aiResponse.text,
        timestamp: Date.now(),
      };

      // Add AI message to Firestore
      await addDoc(messagesCollection, aiMessage);
    } catch (error) {
      console.error('Error in chat:', error);
      // Optionally show an error message in the chat
    } finally {
      setIsSending(false);
    }
  };
  
  const getInitials = (name: string | undefined | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const userInitial = getInitials(userProfile?.name);
  const avatarColor = userProfile?.name ? generateColorFromString(userProfile.name) : undefined;


  if (isUserLoading || !user) {
    return (
        <div className="flex flex-col h-screen container mx-auto p-4">
            <div className="flex-grow space-y-4">
                <Skeleton className="h-16 w-3/4 self-start rounded-lg" />
                <Skeleton className="h-16 w-3/4 self-end rounded-lg" />
                 <Skeleton className="h-16 w-3/4 self-start rounded-lg" />
            </div>
            <div className="flex items-center gap-2 mt-4">
                <Skeleton className="h-10 flex-grow" />
                <Skeleton className="h-10 w-10" />
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        <header className="p-4 border-b text-center">
            <h1 className="text-xl font-bold">AI Support Chat</h1>
            <p className="text-sm text-muted-foreground">Ask me anything about products or orders!</p>
        </header>

        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
            <div className="space-y-6">
                {isMessagesLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <p>Loading messages...</p>
                    </div>
                ) : (
                    messages?.map(message => (
                        <div
                            key={message.id}
                            className={`flex items-end gap-2 ${
                                message.senderId === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            {message.senderId === 'ai' && (
                                <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                                    <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                                message.senderId === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            </div>
                            {message.senderId === 'user' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback style={{ backgroundColor: avatarColor, color: 'white' }}>{userInitial}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))
                )}
                {isSending && (
                    <>
                        <div className="flex items-end gap-2 justify-end">
                            <Skeleton className="h-10 w-48 rounded-lg" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                         <div className="flex items-end gap-2 justify-start">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-10 w-48 rounded-lg" />
                        </div>
                    </>
                )}
            </div>
        </ScrollArea>

        <footer className="p-4 border-t">
            <div className="flex items-center gap-2">
            <Input
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && !isSending && handleSendMessage()}
                placeholder="Type your message..."
                disabled={isSending}
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isSending} size="icon">
                <SendHorizonal className="h-5 w-5" />
                <span className="sr-only">Send</span>
            </Button>
            </div>
        </footer>
    </div>
  );
}
