import { ArrowUpCircleIcon } from "@heroicons/react/16/solid"

export default function TextArea(){

    return (
        <div className = "w-full flex-row h-10 relative bottom-0">
            <textarea placeholder="text here..." className="h-5 w-full">
            </textarea>
            <button>
                <ArrowUpCircleIcon className = "aspect-square w-5 bg-gray-100 rounded hover:bg-gray-200" 
                />
            </button>
        </div>
    )
}