import { NextRequest, NextResponse } from 'next/server';


// Use `export async function POST` for App Router (app/api/ route.ts)
export async function GET(req: NextRequest) {
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL + "zap/scan-status/";
    try {
        // Parse the request body
        const  { searchParams } = new URL(req.url)
        const scanId = searchParams.get("scan_id");
        console.log("just got prompt")
        console.log(scanId)

        if (!scanId) {
            return NextResponse.json({ status: "failed", report:"Scan ID is required" }, { status: 400 });
        }

        // Make the POST request from the backend 
        const res = await fetch(`${baseURL}${scanId}`);

        const responseText = await res.json();
        console.log(responseText)
        if (responseText.report){
            return NextResponse.json({ success: true, report: JSON.stringify(responseText.report), status: responseText.status, message: responseText.message });
        } else{
            return NextResponse.json({ success: true, report: "", status: responseText.status, message: responseText.message});
        }
    } catch (error) {
        return NextResponse.json({ success: false, report: (error as Error).message }, { status: 500 });
    }
}