import { NextRequest, NextResponse } from 'next/server';


// Use `export async function POST` for App Router (app/api/ route.ts)
export async function POST(req: NextRequest) {
    const baseURL = "http://a36abb63983b6472483debf966e2cafd-698803526.us-west-2.elb.amazonaws.com/bedrock/invoke/report";
    try {
        // Parse the request body
        const param = await req.json();
        console.log("just got prompt")
        console.log(param)

        // Make the POST request from the backend 
        const botResponse = await fetch(`${baseURL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(param)
        });

        const responseText = await botResponse.json();
        console.log(responseText)

        return NextResponse.json({ success: true, response: responseText });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}