import { NextRequest, NextResponse } from 'next/server';

interface ResponseFormat {
    scan_id: string,
    status: string,
    message: string
}

// Use `export async function POST` for App Router (app/api/ route.ts)
export async function POST(req: NextRequest) {
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL + "zap/basescan";
    try {
        // Parse the request body
        const val = await req.json();
        console.log("api called")
        console.log({
            run_scan: val.run_scan,
            tools: val.tools
        })
        

        // Make the POST request from the backend 
        const zapServiceResponse = await fetch(baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({config: val})
        });
        
        const data: ResponseFormat = await zapServiceResponse.json();
        console.log(data)
        return NextResponse.json({ success: zapServiceResponse.status == 200, ...data});

    } catch (error) {
        console.log(error)
        return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
}