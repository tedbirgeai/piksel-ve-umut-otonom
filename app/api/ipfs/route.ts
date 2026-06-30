// app/api/ipfs/route.ts
import { NextResponse } from "next/server";

const IPFS_API = process.env.IPFS_API ?? "http://127.0.0.1:5001";

/**
 * İçeriği yerel IPFS (Kubo) düğümüne pinler.
 * İstemci /api/ipfs'e içerik gönderir; bu route onu düğüme ekler ve CID döndürür.
 */
export async function POST(req: Request) {
  try {
    const { content, name } = await req.json();

    const form = new FormData();
    form.append(
      "file",
      new Blob([content], { type: "application/json" }),
      name ?? "lesson.json",
    );

    const res = await fetch(`${IPFS_API}/api/v0/add?pin=true&cid-version=1`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `IPFS düğümü yanıt vermedi (${res.status}).` },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json({ cid: data.Hash });
  } catch {
    return NextResponse.json(
      {
        error:
          "Yerel IPFS düğümüne ulaşılamadı. `ipfs daemon` çalıştığından emin olun.",
      },
      { status: 503 },
    );
  }
}
