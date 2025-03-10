import { NextRequest, NextResponse } from 'next/server';


// Use `export async function POST` for App Router (app/api/ route.ts)
export async function POST(req: NextRequest) {
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL + "bedrock/invoke";
    console.log(baseURL)
    try {
        // Parse the request body
        const param = await req.json();
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

        return NextResponse.json({ success: true, response: responseText.response });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}