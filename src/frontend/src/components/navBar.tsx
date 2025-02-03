
type NavItem = {
    path: String,
    name: String,
    icon: JSX.Element
}


interface navCompoents {

}

export default function NavBar(){


    return(
        <div className = "h-screen w-35 border-blue-400 bg-blue-500">
        <nav>
            <ul>
                <li>something</li>
                <li>dashboard</li>
                <li>home</li>
            </ul>

        </nav>
        </div>
    )
}