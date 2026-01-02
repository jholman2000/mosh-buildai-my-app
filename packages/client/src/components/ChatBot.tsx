import axios from 'axios';
import ReactMarkDown from 'react-markdown';
import { set, useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { FaArrowUp } from 'react-icons/fa6';
import { useEffect, useRef, useState } from 'react';

type FormData = {
    prompt: string;
};

type ChatResponse = {
    message: string;
};

type Message = { content: string; role: 'user' | 'bot' };

// Use Snippet rafce to create below
const ChatBot = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const lastMessageRef = useRef<HTMLDivElement | null>(null);
    // useRef for conversationId to persist across renders without causing re-renders
    //
    const conversationId = useRef(crypto.randomUUID());
    const { register, handleSubmit, reset, formState } = useForm<FormData>();

    useEffect(() => {
        // Scroll to bottom when messages change
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const onSubmit = async ({ prompt }: FormData) => {
        try {
            setMessages((prev) => [...prev, { content: prompt, role: 'user' }]);

            reset({ prompt: '' });
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

    const onKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(onSubmit)();
        }
    };

    const onCopyMessage = (e: React.ClipboardEvent) => {
        const selection = window.getSelection()?.toString().trim();
        if (selection) {
            e.preventDefault();
            e.clipboardData.setData('text/plain', selection);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col flex-1 gap-3 mb-10 overflow-y-auto">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        onCopy={onCopyMessage}
                        ref={
                            index === messages.length - 1
                                ? lastMessageRef
                                : null
                        }
                        className={`px-3 py-1 rounded-xl
                            ${
                                message.role === 'user'
                                    ? 'bg-blue-600 text-white self-end'
                                    : 'bg-gray-100 text-black self-start'
                            }`}
                    >
                        <ReactMarkDown>{message.content}</ReactMarkDown>
                    </div>
                ))}
                {isBotTyping && (
                    <div className="flex self-start gap-1 px-3 py-3 bg-gray-200 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-gray-800 animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-gray-800 animate-pulse [animation-delay:0.2s]" />
                        <div className="w-2 h-2 rounded-full bg-gray-800 animate-pulse [animation-delay:0.4s]" />
                    </div>
                )}
                {error && <div className="text-red-600">{error}</div>}
            </div>
            <form
                // eslint-disable-next-line react-hooks/refs
                onSubmit={handleSubmit(onSubmit)}
                onKeyDown={onKeyDown}
                className="flex flex-col gap-2 items-end border-2 p-4 rounded-lg"
            >
                <textarea
                    {...register('prompt', {
                        required: true,
                        validate: (value) => value.trim().length > 0,
                    })}
                    className="w-full border-0 focus:outline-0 resize-none"
                    placeholder="Ask me anything"
                    autoFocus
                    maxLength={1000}
                />
                <Button
                    disabled={!formState.isValid}
                    className="rounded-full w-9 h-9"
                >
                    <FaArrowUp />
                </Button>
            </form>
        </div>
    );
};

export default ChatBot;
