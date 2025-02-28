import 'react'

type ContainerProps = { 
    content: React.ReactNode
}

export default function ScrollArea(props: ContainerProps){
    return(
        <div className="h-full w-full overflow-y-scroll border-gray-400 bg-green-400">
            <h1>📣 Welcme to the chat</h1>
            {props.content}
        </div>
    )
}