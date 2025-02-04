'use client';
import { BorderBeam } from "@/components/ui/border-beam";
import styles from "@/page.module.css";
import { useEffect, useState } from "react";
import Meteors from "@/components/ui/meteors";
import {JSONTree} from "react-json-tree";
import { ScrollArea } from "@/components/ui/scroll-area";
import jsPDF from "jspdf";
import ShinyButton from "@/components/ui/shiny-button";
import PulsatingButton from "@/components/ui/pulsating-button";

export default function Home() {

    const [url, setURL] = useState('');
    const [fetched, setFetch] = useState(true);
    let response = "";
    const baseURL = "http://a36abb63983b6472483debf966e2cafd-698803526.us-west-2.elb.amazonaws.com/zap/basescan";

    useEffect(() => {

        const helperFunction = async (value: string) => {
            const params = new URLSearchParams({
                'target_url': value
            });
            console.log(params);
            const fetchURL = baseURL + '?' + params;
            console.log(fetchURL);

            const res = await fetch(`${baseURL}?${params}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log(res);
            response = await res.json();
            console.log(response);
            setFetch(true);
        }
        // Retrieve data from the browser's history state
        const value = sessionStorage.getItem('url');
        console.log(value); // Outputs: 'value'

        if (value && !fetched) {
            setURL(value);
            helperFunction(value);
        }
    }, []);

    return (
        <div className={styles.background2}>
            <div className={styles.page}>
                <main className={styles.main}>
                    {fetched ?
                        <>
                            <div className="relative flex h-[500px] w-[1000px] flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
                                <h2> Results have been received</h2>
                                <ScrollArea className="h-500px w-1000px rounded-md border">
                                    <JSONTree data={response} theme="monokai" />
                                </ScrollArea>
                            </div>
                            <PulsatingButton>Download the PDF report</PulsatingButton>
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