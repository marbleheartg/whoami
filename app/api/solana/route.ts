import { NextRequest, NextResponse } from "next/server"

const SOLANA_RPC = "https://api.mainnet-beta.solana.com"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const response = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Solana RPC error:", error)
    return NextResponse.json({ error: "Failed to fetch from Solana RPC" }, { status: 500 })
  }
}
