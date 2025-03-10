'use client';
import { BorderBeam } from "@/components/ui/border-beam";
import styles from "./../page.module.css";
import { use, useEffect, useState } from "react";
import Meteors from "@/components/ui/meteors";
import {JSONTree} from "react-json-tree";
import { ScrollArea } from "@/components/ui/scroll-area";
import PulsatingButton from "@/components/ui/pulsating-button";
import { uploadData } from "@aws-amplify/storage";
import { useRouter } from "next/navigation"; 
import jsPDF from "jspdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource'; // Path to your backend resource definition
import {Button} from "@/components/ui/button"

interface ResponseFormat {
    success: boolean,
    scan_id: string,
    status: "failed" | "completed" | "initiated" | "running",
    message: string
}

interface DisplayFormat {
    status: string,
    message: string
}


export default function Home() {
    const router = useRouter()
    const dashboard = () => {
      router.push("/retrieve")
    }
    console.log('home called')
    const client = generateClient<Schema>();
    const [called, setCalled] = useState(false);
    const [fetched, setFetch] = useState(false);
    const [displayData, setDisplayData] = useState<DisplayFormat>({status: "No Test Has been Launched",message: "Please go back to the Dashboard and Create a new Test"});
    let pageHeight = 0;
    let lineNumber = 10;

    const printPDF = (doc: jsPDF, obj:Record<string, any>) => {
        for (let key in obj) {
            if (typeof (obj[key]) === "string") {

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
            try{
            const res = await fetch(`/api/launchTest`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                 },
                body: JSON.stringify({value})
            });
            let response: ResponseFormat = await res.json();
            console.log("got respose")
            console.log(response);
            if (!response.success){
                setDisplayData(
                    {message: "Could not connect with server",
                    status: "Status: Failed"
                    })
                    setFetch(true);
                return;
            } else {
            setDisplayData({
                message: response.message,
                status: "Status: " + response.status 
            })
            }
            console.log("adding test to dynamo db")
            const today = new Date().toLocaleString();
            console.log(response)
            await client.models.reportInfo.create({
                testName: testName,
                scan_id: response.scan_id,
                testDate: today,
                targetURL: value,
                type: "basescan",
                status: response.status
            })
            }catch(error){
                setDisplayData(
                    {message: "An Error Occured",
                    status: "Status: Failed"
                    })
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
                            <Card className="mx-auto max-w-sm p-4">
                                    <CardTitle className="text-3xl text-center p-2">
                                        {displayData.message}
                                    </CardTitle>
                                <CardContent>
                                    <p className= "text-2xl">
                                        {displayData.status}
                                    </p>
                                    <Button onClick={dashboard} className="mt-6 w-full p-4 text-lg">
                                        Back to Dashboard
                                    </Button>
                                </CardContent>
                            </Card>
                        </>
                        :
                        <>
                               <div className="relative flex h-[350px] w-[500px] flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
                                    <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-6xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
                                        Starting Test
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