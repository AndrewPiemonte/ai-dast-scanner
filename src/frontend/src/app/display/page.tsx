'use client';
import { BorderBeam } from "@/components/ui/border-beam";
import styles from "./../page.module.css";
import { use, useEffect, useState } from "react";
import Meteors from "@/components/ui/meteors";
import {JSONTree} from "react-json-tree";
import { ScrollArea } from "@/components/ui/scroll-area";
import PulsatingButton from "@/components/ui/pulsating-button";
import { uploadData } from "@aws-amplify/storage";
import jsPDF from "jspdf";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource'; // Path to your backend resource definition

interface ResponseFormat {
    success: boolean,
    scan_id: string,
    status: "failed" | "completed" | "initiated" | "running",
    message: string
}


export default function Home() {
    console.log('home called')
    const client = generateClient<Schema>();
    const [called, setCalled] = useState(false);
    const [fetched, setFetch] = useState(false);
    const [jsonData, setJsonData] = useState<Record<string, any> | null>(null);
    let pageHeight = 0;
    let lineNumber = 10;

    const printPDF = (doc: jsPDF, obj:Record<string, any>) => {
        for (let key in obj) {
            if (typeof (obj[key]) === "string") {
                // console.log(obj[key]);

                if (lineNumber + 10 > pageHeight - 10) {
                    doc.addPage();
                    lineNumber = 10;
                }

                const result = `${key} : ${obj[key]}`;
                var dim = doc.getTextDimensions(result, { maxWidth: 180 });
                doc.text(result, 10, lineNumber, { maxWidth: 180 });

                lineNumber = lineNumber + dim.h;

            } else if (Array.isArray(obj[key])) {
                if (lineNumber + 10 > pageHeight - 10) {
                    doc.addPage();
                    lineNumber = 10;
                }

                const result = `${key} :  is of type Array with index described below`;
                doc.text(result, 10, lineNumber);
                lineNumber = lineNumber + 10;

                printPDF(doc, obj[key]);

            } else {
                if (lineNumber + 10 > pageHeight - 10) {
                    doc.addPage();
                    lineNumber = 10;
                }

                const result = `${key} : is of type object described below `;
                doc.text(result, 10, lineNumber);
                lineNumber = lineNumber + 10;

                printPDF(doc, obj[key]);
            }
        }


    }


    const downloadPdf = () => {
        try{
        const doc = new jsPDF();
        pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(12);
        
        if (jsonData != null){
            printPDF(doc, jsonData);
        }

        const pdfBlob = doc.output("blob");

        // Create a URL for the Blob
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Open the PDF in a new tab
        window.open(pdfUrl, "_blank");


        } catch(error){
            console.log(error)
        }
        
    };


    useEffect(() => {
        const launchTest = async (testName: string, value: string) => {
            console.log('getReport Called')
            const res = await fetch(`/api/launchTest`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                 },
                body: JSON.stringify({value})
            });
            try{
                let response: ResponseFormat = await res.json();
                console.log("got respose")
                console.log(response);
                setJsonData(response);
                if (!response.success){
                    setJsonData({error: "Failed to Launch Test",
                                message: response.message
                    })
                } else {
                    setJsonData({message: response.message,
                                status: response.status
                    })
                }
                console.log("adding test to dynamo db")
                const today = new Date().toLocaleString();
                const test = await client.models.reportInfo.create({
                    testName: testName,
                    scan_id: response.scan_id,
                    testDate: today,
                    targetURL: value,
                    type: "basescan",
                    status: response.status
                })
            }catch(error){
                setJsonData({error: "an error occurred"})
                console.log(error)
            }
            setFetch(true);
        }

        // Retrieve data from the browser's history state
        const value = sessionStorage.getItem('url');
        const testName = sessionStorage.getItem('testName')
        console.log(value); // Outputs: 'value'

        if (value && testName && !called) {
            console.log('getting report');
            setCalled(true);
            console.log(fetched);
            launchTest(testName, value);
        }

        
    }, []);

    return (
        <div className={styles.background2}>
            <div className={styles.page}>
                <main className={styles.main}>
                    {fetched ?
                        <>
                            <div className="flex h-[500px] w-[1000px] flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
                                <h2> Results have been received</h2>
                                <ScrollArea className="h-500px w-1000px rounded-md border">
                                    <JSONTree data = {jsonData} shouldExpandNodeInitially={() => true} />
                                </ScrollArea>
                            </div>
                            <PulsatingButton onClick={downloadPdf}>Download the PDF report</PulsatingButton>
                        </>
                        :
                        <>
                               <div className="relative flex h-[350px] w-[500px] flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
                                    <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-6xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
                                        Fetching
                                </span>
                                <BorderBeam size={250} duration={12} delay={9} />
                                <Meteors number={100} />
                                </div>
                        </>
                    }
                </main>
            </div>
        </div >
    );
}
