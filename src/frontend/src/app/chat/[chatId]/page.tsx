
export default async function ChatBotPage({params,}:{params : Promise<{chatId: string}>}){
    const chatId = (await params).chatId
    return(
        <h1>{chatId}</h1>
    )
}