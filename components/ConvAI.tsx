"use client"

import * as React from "react";
import {useState} from "react";
import {Conversation} from "@11labs/client";

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
        <div className="flex flex-col items-center gap-6">
            <button
                onClick={toggleConversation}
                className={`
                    w-48 h-48 
                    rounded-full 
                    flex items-center justify-center 
                    transition-all duration-300 ease-in-out
                    shadow-lg hover:shadow-xl
                    ${isConnected 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }
                `}
            >
                <svg 
                    viewBox="0 0 24 24" 
                    className="w-16 h-16 text-white"
                    fill="currentColor"
                >
                    <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V6z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
            </button>
            <div className="text-gray-600 text-lg font-medium">
                {status}
            </div>
        </div>
    )
}