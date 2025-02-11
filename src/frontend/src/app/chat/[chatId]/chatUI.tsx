
"use client"
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleAction, ChatBubbleActionWrapper } from '@/components/ui/chat/chat-bubble'
import { ChatMessageList } from '@/components/ui/chat/chat-message-list'
import { ChatButton } from './chatButton';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import {Schema} from '../../../../amplify/data/resource';


interface Message {
    id: number;
    sender: "user" | "bot";
    message: string;
    isLoading?: boolean;
}

const messages: Message[] = [
    {
        id: 0,
        message: 'Hello, how has your day been? I can help you with any questions you have with the report',
        sender: 'bot',
        isLoading: false
    },
    {
        id: 1,
        message: 'What strategies can I use to further secure my app given the report has been generated',
        sender: 'user',
        isLoading: false
    }
];


export default function ChatComponent({chatId} : {chatId: string}) {
    const [chat, setChat] = useState<Schema["Chat"]["type"]>()
    const [hasChat, sethasChat] = useState<boolean>(false);
    const [newMessages, setMessages] = useState<Message[]>(messages);
    const [isMessageCompleted, setMessageCompleted] = useState<Boolean>(true);
    const client = generateClient<Schema>();
    const [hasNewMessage, setHasNewMessage] = useState<Boolean>(false);
    const [newMessage, setNewMessage] = useState<string>("");
    const [currentChatMessages, setCurrentChatMessages] = useState<Array<Schema["Message"]["type"]>>([]);
    const [fetchMessages, setFetchMessages] = useState<Boolean>(false);
    const [chatBotResponding, setChatBotResponding] = useState<Boolean>(false);


    const submitButtonEvent = (message: string, event: React.FormEvent<HTMLFormElement>) => {
        console.log("message is", message)
        let messageLength = newMessages.length;
        let obj = newMessages[messageLength - 1];
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
                        setChat(newChat)
                        let botMessage = await client.models.Message.create({
                            chatId: chatId,
                            content: "Hello, how are you? I can help you with any questions you have with the report",
                            sender: "bot"
                        })
                    }
                    console.log(newChat)
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
            let clientMessage = await client.models.Message.create({
                chatId: chat?.id,
                content: newMessage,
                sender: "user"
            })
            setFetchMessages(true);
            const responseAI = await fetch(`/api/getBotResponse`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                 },
                body: JSON.stringify({input_text: newMessage})
            });
            setChatBotResponding(true)
            try {
                let {response: chatResponse} = await responseAI.json()
                console.log(chatResponse)
                let chatbotMessage = await client.models.Message.create({
                    chatId: chat?.id,
                    content: chatResponse,
                    sender: "bot"
                })
                console.log(chatbotMessage)
                setFetchMessages(true)
            } catch(error){
                console.log(error)
            }
            setChatBotResponding(false)
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
