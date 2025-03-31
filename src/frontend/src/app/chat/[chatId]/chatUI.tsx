
"use client"
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '@/components/ui/chat/chat-bubble'
import { ChatMessageList } from '@/components/ui/chat/chat-message-list'
import { ChatButton } from './chatButton';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChartBarStacked, Terminal } from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import {Schema} from '../../../../amplify/data/resource';


interface Message {
    id: number;
    sender: "user" | "bot";
    message: string;
    isLoading?: boolean;
}

export default function ChatComponent({chatId, report} : {chatId: string, report: Record<string, any>}) {
    const [chat, setChat] = useState<Schema["Chat"]["type"]>()
    const [hasChat, sethasChat] = useState<boolean>(false);
    const [isMessageCompleted, setMessageCompleted] = useState<Boolean>(true);
    const client = generateClient<Schema>();
    const [hasNewMessage, setHasNewMessage] = useState<Boolean>(false);
    const [newMessage, setNewMessage] = useState<string>("");
    const [currentChatMessages, setCurrentChatMessages] = useState<Array<Schema["Message"]["type"]>>([]);
    const [fetchMessages, setFetchMessages] = useState<Boolean>(false);
    const [chatBotResponding, setChatBotResponding] = useState<Boolean>(false);


    const submitButtonEvent = (message: string, event: React.FormEvent<HTMLFormElement>) => {
        if (hasNewMessage) {
            setMessageCompleted(false);
            setTimeout(() => {
                setMessageCompleted(true)
            }, 5000);
            return;
        } else{
            setNewMessage(message);
            setHasNewMessage(true);
        }

        try{
            let textArea = event.currentTarget.elements.namedItem("message") as HTMLTextAreaElement;
            textArea.value = ""
        } catch(error){
            console.log(error)
        } 
    }

    useEffect(()=>{

        const getMessageChat = async () =>{
            try{
                let { data: fetchedChat} = await client.models.Chat.get({ id: chatId });
                if(fetchedChat){
                    setChat(fetchedChat)
                    console.log("fetch chat")
                    console.log(fetchedChat)
                } else{
                    console.log("new chat")
                    let {data: newChat} = await client.models.Chat.create({
                        id: chatId
                    })
                    if(newChat){
                        console.log("creating messages")
                        let {errors, data: newMessage} = await client.models.Message.create({
                            chatId: newChat?.id,
                            content: "Hello, how are you? I can help you with any questions you have with the report",
                            sender: "bot"
                        })
                        console.log("new message", newMessage, errors)
                        setChat(newChat)
                    }
                }
                setFetchMessages(true)
                sethasChat(true)
            } catch(error){
                console.log(error)
            }
        }
        console.log("entering getMessageChat")
        if(chatId !== "" && !hasChat){
            console.log("entered getMessageChat")
            getMessageChat()

        }

    },[chatId])

    useEffect(()=>{
        const getMessages = async () => {
            if(chat){
                let {data: chatMessages} = await chat.messages()
                chatMessages = chatMessages.sort((a, b) => 
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                
                console.log(chatMessages)
                setCurrentChatMessages(chatMessages.reverse())
            }
            setFetchMessages(false);
        }

        if(fetchMessages){
            getMessages()
        }

    },[fetchMessages])


    useEffect(()=>{

        const createMessages = async() => {
            let {errors, data: clientMessage} = await client.models.Message.create({
                chatId: chat?.id,
                content: newMessage,
                sender: "user"
            })
            console.log("client message", clientMessage, errors)
            setFetchMessages(true);
            setChatBotResponding(true);
            const responseAI = await fetch(`/api/getBotResponse`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                 },
                body: JSON.stringify({
                    tool: "owasp",
                    mode: "chat",
                    input_text: newMessage,
                    input_report: JSON.stringify(report)
                })
            });
            try {
                let {response: chatResponse} = await responseAI.json()
                console.log(chatResponse)
                let {errors, data: chatbotMessage } = await client.models.Message.create({
                    chatId: chat?.id,
                    content: chatResponse,
                    sender: "bot"
                })
                console.log("chat message", chatbotMessage, errors)
            } catch(error){
                console.log(error)
            }
            setChatBotResponding(false)
            setFetchMessages(true)
            console.log(clientMessage)
            setHasNewMessage(false)
        }

        if(hasNewMessage){
            createMessages()
        }


    }, [hasNewMessage])

    return (
        <div className="flex flex-col h-full w-full">
            {
                !isMessageCompleted ?
                    <>
                        <Alert>
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Heads up!</AlertTitle>
                            <AlertDescription>
                                Please try to send a message when the ongoing message has received a reply from the AI chatbot.
                            </AlertDescription>
                        </Alert>
                    </>
                    :
                    <></>
            }

            <ChatMessageList>
                {currentChatMessages.map((message) => {
                    const variant = message.sender === 'user' ? 'sent' : 'received';
                    return (
                        <ChatBubble key={message.id} variant={variant}>
                            <ChatBubbleAvatar fallback={variant === 'sent' ? 'Me' : 'AI'} />
                            <ChatBubbleMessage isLoading={false}>
                                {message.content}
                            </ChatBubbleMessage>
                        </ChatBubble>
                    )
                })}
                {(hasNewMessage && chatBotResponding) ?
                    <>
                     <ChatBubble key={"last message"} variant={'received'}>
                    <ChatBubbleAvatar fallback={'AI'} />
                    <ChatBubbleMessage isLoading={true}>
                    </ChatBubbleMessage>
                    </ChatBubble>
                    </>
                    :
                    <>
                    </>
                 }
            </ChatMessageList>
            <ChatButton submitButton={submitButtonEvent}></ChatButton>

        </div>



    )
}
