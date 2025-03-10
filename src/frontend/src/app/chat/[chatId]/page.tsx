
"use client";
import React, { useState, useEffect } from "react";
import ChatComponent from "./chatUI"; // Your AI Chat UI component
import { candyWrapperTheme, JsonEditor } from 'json-edit-react';
import { downloadData } from "aws-amplify/storage";
import { Button } from '@/components/ui/button'
import { useRouter } from "next/navigation";
import { formatReport } from "@/utils/format";
import Markdown from "react-markdown";

export default function SplitScreen ({params}:{
    params : Promise<{chatId: string}>;
}) {
    const router = useRouter()
    const dashboard = () => {
      router.push("/retrieve")
    }
    const [data, setData] = useState<string>("loading report");
    const [jsonReport, setJsonReport] = useState<Record<string, any>>({report: "no report"})
    const [chatId, setChatId] = useState<string>("");
    
    useEffect(()=>{
        const getReport = async () =>{
            try{
            const id = (await params).chatId;
            setChatId(id)
            const reportFile = await downloadData({
                path: ({identityId}) => {
                    return `reports/${identityId}/${id}.json`
                }
            }).result;
            let report = await reportFile.body.text();
            let jsonReport = JSON.parse(report)
            setJsonReport(jsonReport)
            setData(formatReport(jsonReport))
            } catch(error){
                console.log(error)
                setData("Error: report not found")
            }
        }
        getReport()
    }, [])
    


    return (
        <div className="flex h-screen">
            

            {/* Left Side - File Viewer */}
            {/* <div className="w-1/2 border-r p-4"> */}
            {/* <div className="w-[400px] max-w-[400px] h-full overflow-y-auto border-r p-4"></div> */}
            <div className="w-1/2 h-full overflow-y-auto border-r p-4">
            <div className="px-5 text-lg">
            </div>
            
            <div className="w-800px">
            <Button onClick={dashboard } className="z-10 absolute top-0 left-0 m-2">Back to Dashboard</Button>
            <div className="my-10">
                <Markdown>{`${data}`}</Markdown>
            </div>
            </div>
            </div>
            {/* Right Side - Chat UI */}
            <div className="w-1/2 h-full overflow-y-auto border-r p-4">
                <ChatComponent chatId={chatId} report={jsonReport} />
            </div>
        </div>
    );
};


