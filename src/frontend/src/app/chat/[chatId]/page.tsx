
"use client";
import React, { useState, useEffect, useRef } from "react";
import ChatComponent from "./chatUI"; // Your AI Chat UI component
import { candyWrapperTheme, JsonEditor } from 'json-edit-react';
import { downloadData } from "aws-amplify/storage";
import { Button } from '@/components/ui/button'
import { useRouter } from "next/navigation";
import { formatReport } from "@/utils/format";
import { isJsonObject, isArrayOfJsons } from "@/utils/check";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from 'remark-gfm';
import "./table.css";
import PieChart, {PieChartProps} from "./Piechart";
import HistogramChart, {HistogramProps} from "./Histogramchart";

interface ChartProps{
    pieChart: PieChartProps,
    histogram: HistogramProps
}


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
    const [risks, setRisks] = useState<PieChartProps>({
        informational: 0,
        low: 0,
        medium: 0,
        high: 0
    })
    const [histdata, setHistData] = useState<HistogramProps>({data: [{title: "info not found", value: 5}]})
    
    useEffect(()=>{
        const getReport = async () =>{
            try{
            const id = (await params).chatId;
            setChatId(id)
            let reportFile: Record<string, any>
            try{
            reportFile = await downloadData({
                path: ({identityId}) => {
                    return `reports/${identityId}/${id}.json`
                }
            }).result;
            } catch(error){
                reportFile = {error: "Could not load test"}
                console.log(error)
            }
            let report = await reportFile.body.text();
            let jsonReport = JSON.parse(report)
            let chartProps: ChartProps = vulnerablityCount(jsonReport)
            setRisks(chartProps.pieChart)
            if(chartProps.histogram.data.length > 0){
                setHistData(chartProps.histogram)
            }
            setJsonReport(jsonReport)
            setData(formatReport(jsonReport))
            } catch(error){
                console.log(error)
                setData("Error: report not found")
            }
        }
        getReport()
    }, [])

    function vulnerablityCount(report: Record<string, any>): ChartProps {
        console.log("vulnerability count")
        console.log(report)
        let risks: PieChartProps = {
            informational: 0,
            low: 0,
            medium: 0,
            high: 0
        }
        let vulnerabilities: HistogramProps = {data: []};
        if (isArrayOfJsons(report?.site)){
            console.log("found sites")
            let sites = report.site
            for(let i=0; i< sites.length; i++){
                let site = sites[i]
                console.log("some site", site)
                console.log("alertearray", site.alerts)
                if (isArrayOfJsons(site?.alerts)){
                    console.log("found alerts")
                    let alerts = site.alerts
                    console.log("alerts", alerts)
                    for(let j = 0; j< alerts.length; j++){
                        let alert = alerts[j]
                        console.log("alert", alert)
                        if(isJsonObject(alert)){
                            try{
                                let count: number = Number(alert.count)
                                let severity: string = alert.riskdesc.split(/\s+/)[0].toLowerCase() 
                                let name: string = alert.name
                                vulnerabilities.data.push({title: name, value: count })
                                switch (severity){
                                    case "high": risks.high += count; break;
                                    case "medium": risks.medium += count; break;
                                    case "low": risks.low += count; break;
                                    case "informational": risks.informational += count; break;
                                    default: console.log("risk not found ", severity)
                                }
                                } catch (error){
                                console.log(error)
                            }
                        }
                    }
                }
            }
        }
        console.log(risks)
        let props: ChartProps = {pieChart: risks, histogram: vulnerabilities}
        return props
    } 



    return (
        <div className="flex h-screen">
            {/* Left Side - File Viewer */}
            <div className="w-1/2 h-full overflow-y-auto border-r p-4">
            <div className="px-5 text-lg">
            </div>
            
            <div className="w-800px">
            <Button onClick={dashboard } className="z-10 absolute top-0 left-0 m-2">Back to Dashboard</Button>
            <div className="my-10">
            <div  className="times">
                <h1>Security Test Report</h1>
                <PieChart {...risks} /> 
                <br />
                <HistogramChart data = {histdata.data}/>

                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {data}
                </ReactMarkdown>
                </div> 
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


