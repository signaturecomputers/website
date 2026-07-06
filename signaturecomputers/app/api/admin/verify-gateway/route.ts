import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { key } = await request.json();

        if (!key) {
            return NextResponse.json({ success: false, reason: "Missing key" }, { status: 400 });
        }

        const envKeys = process.env.ADMIN_ACCESS_KEY || '';
        const validEnvKeys = envKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);

        if (validEnvKeys.includes(key)) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, reason: "Key mismatch against environment variables." }, { status: 401 });
    } catch (error: any) {
        return NextResponse.json({ success: false, reason: error.message }, { status: 500 });
    }
}
