import { getBeekeeperWsUrl } from '@utils/queenbee/api'
import { parseResponseBody, toRecord } from '@utils/http'
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef } from 'react'
import {
    NativeChatSession,
    NativeSocketMessage,
    applyPromptError,
    applyPromptStarted,
    normalizeClientUpdate,
    updateLastAssistantMessage,
    upsertNativeClient,
} from './chatMessages'

type AiSocketText = {
    modelFailed: string
    socketDisconnected: string
}

type AiSocketOptions = {
    session: NativeChatSession | null
    text: AiSocketText
    setClients: Dispatch<SetStateAction<NativeClient[]>>
    setError: Dispatch<SetStateAction<string | null>>
    setSession: Dispatch<SetStateAction<NativeChatSession | null>>
    refresh: () => void
}

export function useAiSocket({
    session,
    text,
    setClients,
    setError,
    setSession,
    refresh,
}: AiSocketOptions): MutableRefObject<WebSocket | null> {
    const socketRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        const ws = new WebSocket(getBeekeeperWsUrl())
        socketRef.current = ws

        ws.onmessage = (event) => {
            try {
                const message = toRecord(parseResponseBody(event.data))
                if (!message) {
                    throw new Error('Invalid socket message')
                }

                handleSocketMessage(message)
            } catch (err) {
                console.log(err)
            }
        }

        ws.onerror = () => {
            setError(text.socketDisconnected)
        }

        return () => {
            socketRef.current = null
            ws.close()
        }
    }, [session?.conversationId, text.socketDisconnected])

    function handleSocketMessage(message: NativeSocketMessage) {
        if (message.type === 'update' && message.client) {
            const nextClient = normalizeClientUpdate(message.client)
            setClients(prev => upsertNativeClient(prev, nextClient))
            return
        }

        if (!session || session.conversationId !== message.conversationId) {
            return
        }

        if (message.type === 'prompt_started') {
            setSession(applyPromptStarted)
            return
        }

        if (message.type === 'prompt_delta') {
            setSession(prev => updateLastAssistantMessage(prev, message, true))
            return
        }

        if (message.type === 'prompt_complete') {
            setSession(prev => updateLastAssistantMessage(prev, message, false))
            refresh()
            return
        }

        if (message.type === 'prompt_error') {
            setSession(prev => applyPromptError(prev, message.error || text.modelFailed))
        }
    }

    return socketRef
}
