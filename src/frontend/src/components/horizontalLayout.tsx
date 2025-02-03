
type HorizontalLayoutProps = {
    content : JSX.Element
}

export default function HorizontalLayout(props: HorizontalLayoutProps){
    return (
        <div className = "flex flex-row h-screen w-screen bg-red-500">
            {props.content}
        </div>
    )
}