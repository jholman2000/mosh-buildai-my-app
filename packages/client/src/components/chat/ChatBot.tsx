import axios from 'axios';
import { useRef, useState } from 'react';
import ChatMessages from './ChatMessages';
import type { Message } from './ChatMessages';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import type { ChatFormData } from './ChatInput';

type ChatResponse = {
    message: string;
};

//type Message = { content: string; role: 'user' | 'bot' };

// Use Snippet rafce to create below
const ChatBot = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // useRef for conversationId to persist across renders without causing re-renders
    //
    const conversationId = useRef(crypto.randomUUID());

    const onSubmit = async ({ prompt }: ChatFormData) => {
        try {
            setMessages((prev) => [...prev, { content: prompt, role: 'user' }]);
            setError(null);
            setIsBotTyping(true);

            const { data } = await axios.post<ChatResponse>('/api/chat', {
                prompt,
                conversationId: conversationId.current,
            });
            setMessages((prev) => [
                ...prev,
                { content: data.message, role: 'bot' },
            ]);
        } catch (error) {
            setIsBotTyping(false);
            setError('Failed to fetch response. Please try again.');
            console.error('Something broke:', error);
        } finally {
            setIsBotTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col flex-1 gap-3 mb-10 overflow-y-auto">
                <ChatMessages messages={messages} />
                {isBotTyping && <TypingIndicator />}
                {error && <div className="text-red-600">{error}</div>}
            </div>
            <ChatInput onSubmit={onSubmit} />
        </div>
    );
};

export default ChatBot;
