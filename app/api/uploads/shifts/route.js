import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB limit per file
const allowedContentTypes = ["image/*"];

export async function POST(request) {
  try {
    const body = await request.json();

    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
        return {
          allowedContentTypes,
          maximumSizeInBytes: MAX_FILE_SIZE_BYTES,
          addRandomSuffix: true,
          tokenPayload: clientPayload,
          allowOverwrite: false,
        };
      },
      // Optional hook for when uploads complete. Currently we just acknowledge the event.
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to handle blob upload request:", error);
    return NextResponse.json({ error: "Failed to prepare upload." }, { status: 500 });
  }
}
