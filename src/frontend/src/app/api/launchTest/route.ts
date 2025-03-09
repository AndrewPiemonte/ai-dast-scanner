import { NextRequest, NextResponse } from 'next/server';

interface ResponseFormat {
    scan_id: string,
    status: string,
    message: string
}

// Use `export async function POST` for App Router (app/api/ route.ts)
export async function POST(req: NextRequest) {
    const baseURL = process.env.ELB_URL + "zap/basescan/";
    try {
        // Parse the request body
        const val = await req.json();
        const target_url = val.value
        
        const params = new URLSearchParams({
            'target_url': target_url
        });

        console.log(`${baseURL}?${params}`)
        

        // Make the POST request from the backend 
        const zapServiceResponse = await fetch(baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        });
        
        const data: ResponseFormat = await zapServiceResponse.json();
        console.log(data)
        return NextResponse.json({ success: zapServiceResponse.status == 200, ...data});

    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}