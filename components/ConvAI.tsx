"use client"

import * as React from "react";
import {useState, useEffect} from "react";
import {Conversation} from "@11labs/client";

declare global {
    interface Window {
        Telegram?: {
            WebApp?: any;
        }
    }
}

async function requestMicrophonePermission() {
    try {
        await navigator.mediaDevices.getUserMedia({audio: true})
        return true
    } catch {
        console.error('Microphone permission denied')
        return false
    }
}

async function getSignedUrl(): Promise<string> {
    const response = await fetch('/api/signed-url')
    if (!response.ok) {
        throw Error('Failed to get signed url')
    }
    const data = await response.json()
    return data.signedUrl
}

export default function ConvAI() {
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [status, setStatus] = useState('Нажмите для начала разговора')
    const [mounted, setMounted] = useState(false)

    // Инициализация после монтирования компонента
    useEffect(() => {
        setMounted(true);
        
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            
            // Расширяем на весь экран
            tg.expand();
            
            // Готовность приложения
            tg.ready();

            // Устанавливаем основной цвет кнопки из темы Telegram
            const mainButtonColor = tg.themeParams?.button_color || '#34d399';
            document.documentElement.style.setProperty('--main-button-color', mainButtonColor);
        }

        return () => {
            if (conversation) {
                conversation.endSession();
            }
        };
    }, []);

    // Не рендерим ничего до монтирования компонента
    if (!mounted) {
        return null;
    }

    async function startConversation() {
        const hasPermission = await requestMicrophonePermission()
        if (!hasPermission) {
            setStatus("Нет доступа к микрофону")
            return;
        }
        try {
            setStatus('Подключение...')
            const signedUrl = await getSignedUrl()
            const conversation = await Conversation.startSession({
                signedUrl: signedUrl,
                onConnect: () => {
                    setIsConnected(true)
                    setIsSpeaking(true)
                    setStatus('Говорите...')
                },
                onDisconnect: () => {
                    setIsConnected(false)
                    setIsSpeaking(false)
                    setStatus('Нажмите для начала разговора')
                },
                onError: (error) => {
                    console.log(error)
                    setStatus('Произошла ошибка')
                },
                onModeChange: ({mode}) => {
                    setIsSpeaking(mode === 'speaking')
                    setStatus(mode === 'speaking' ? 'Агент говорит...' : 'Агент слушает...')
                },
            })
            setConversation(conversation)
        } catch (error) {
            console.error(error)
            setStatus('Ошибка подключения')
        }
    }

    async function endConversation() {
        if (!conversation) {
            return
        }
        try {
            await conversation.endSession()
            setConversation(null)
            setStatus('Нажмите для начала разговора')
        } catch (error) {
            console.error(error)
            setStatus('Ошибка при завершении разговора')
        }
    }

    const toggleConversation = async () => {
        if (!conversation) {
            await startConversation()
        } else {
            await endConversation()
        }
    }

    return (
        <div className="flex flex-col items-center gap-8 min-h-screen py-8">
            <div className="relative w-56 h-56">
                {/* Фоновый градиент */}
                <div 
                    className={`
                        absolute inset-0 
                        rounded-full 
                        animate-gradient
                        ${isConnected ? 'animate-glow' : ''}
                        blur-[1px]
                    `}
                />
                
                {/* Основная кнопка */}
                <button
                    onClick={toggleConversation}
                    className={`
                        absolute inset-[3px]
                        rounded-full 
                        flex items-center justify-center 
                        transition-all duration-300 ease-in-out
                        shadow-lg hover:shadow-xl
                        backdrop-blur-md
                        bg-white/90
                        hover:bg-white/95
                        ${isConnected ? 'animate-pulse-scale' : 'hover:scale-105'}
                        group
                    `}
                >
                    {/* Внутренний градиент */}
                    <div 
                        className={`
                            absolute inset-0
                            rounded-full
                            animate-gradient
                            opacity-10
                            group-hover:opacity-20
                            transition-opacity
                        `}
                    />
                    
                    {/* Иконка */}
                    <svg 
                        viewBox="0 0 24 24" 
                        className={`
                            relative
                            w-24 h-24 
                            ${isConnected ? 'text-red-500' : 'text-emerald-500'}
                            transition-colors duration-300
                            drop-shadow-md
                        `}
                        fill="currentColor"
                    >
                        <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V6z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                </button>
            </div>
            <div className="text-gray-600 text-lg font-medium">
                {status}
            </div>
        </div>
    );
}