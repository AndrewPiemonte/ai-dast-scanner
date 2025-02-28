import HorizontalLayout from "@/components/horizontalLayout"
import NavBar from "@/components/navBar"
import ScrollArea from "@/components/scrollArea"
import TextArea from "@/components/textArea"

function messages(){
    return(
        <>
            <ul>
                <li>This is a message</li>
            </ul>
            <TextArea />
        </>
    )
}

function content(){
    return(
        <>
        <NavBar />
        <ScrollArea
            content = { messages() }
        />
        </>
    )
}


export default function dashBoard(){
    return(
        <HorizontalLayout
        content = {content()}
        />
    )
}