import { NextResponse } from 'next/server';
import * as conf from "@/utils/conf.json"
import fs from 'fs';
import path from 'path';


// Use `export async function POST` for App Router (app/api/ route.ts)
export async function POST() {
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL + "config";
    const confPath = path.resolve(process.cwd(), "src/utils/conf.json")
    console.log(baseURL)
    console.log(confPath)
    try {

        const res = await fetch(baseURL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (res.ok){
            let configurations = await res.json()
            if (configurations?.config != null && configurations?.config != conf){
            fs.writeFileSync(confPath, JSON.stringify(configurations.config, null, 4), 'utf8')
            }
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({success: false})
        }

    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}