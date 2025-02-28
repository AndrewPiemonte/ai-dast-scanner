import { NextRequest, NextResponse } from 'next/server';


// Use `export async function POST` for App Router (app/api/ route.ts)
export async function POST(req: NextRequest) {
    const baseURL = "http://a36abb63983b6472483debf966e2cafd-698803526.us-west-2.elb.amazonaws.com/zap/basescan";
    try {
        // Parse the request body
        const val = await req.json();
        const target_url = val.value
        console.log("just got value")
        console.log(target_url)
        console.log("about to parse value")
        const params = new URLSearchParams({
            'target_url': target_url
        });
        console.log(params)
        console.log(`${baseURL}?${params}`)

        // Make the POST request from the backend 
        const zapServiceResponse = await fetch(`${baseURL}?${params}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await zapServiceResponse.json();
        console.log(data)

        return NextResponse.json({ success: true, report: data });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}