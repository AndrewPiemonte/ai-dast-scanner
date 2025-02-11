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

        const getReport = async (testName: string, value: string) => {
            console.log('getReport Called')

            const res = await fetch(`/api/getReport`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                 },
                body: JSON.stringify({value})
            });
            let report = ""
            try{
                let response = await res.json();
                console.log("got respose")
                console.log(response);

                const responseAI = await fetch(`/api/getEnhancedReport`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                     },
                    body: JSON.stringify({response})
                });

                let summary = await responseAI.json()
                console.log(summary)
                response["ai_summary"] = summary.response
                setJsonData(response);
                report = JSON.stringify(response)
            }catch(error){
                setJsonData({error: "an error occurred"})
                console.log(error)
            }

          


            try{
                console.log("adding test to dynamo db")
                const today = new Date().toLocaleString();
                console.log(today)
                const test = await client.models.reportInfo.create({
                    testName: testName,
                    testDate: today,
                    targetURL: value,
                    type: "basescan",
                    status: "success"
                })

                console.log(test)
                let reportName = test?.data?.id
                console.log('uploading report')
                uploadData({
                    path: ({ identityId }) => {
                        return `reports/${identityId}/${reportName}.json`;
                      },
                    data: report
                })
            } catch(error){
                console.log(error)
            }
            console.log('setting fetched to true')
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
            getReport(testName, value);
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
