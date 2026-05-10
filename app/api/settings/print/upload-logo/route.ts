import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ message: "No file uploaded" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Convert to base64 for easy DB storage and PDF usage
    const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

    return NextResponse.json({ url: base64String });
  } catch (error) {
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
