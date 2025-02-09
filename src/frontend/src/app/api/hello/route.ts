import { NextRequest, NextResponse } from 'next/server';


// Use `export async function POST` for App Router (app/api/ route.ts)
export async function GET(req: NextRequest) {
    return NextResponse.json({success: true, data:"hello"});
}