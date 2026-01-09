import { MINIAPP } from "@/lib/constants"
import { NextResponse } from "next/server"

const { NEXT_PUBLIC_HOST } = process.env

export async function GET() {
  return NextResponse.json({
    miniapp: {
      version: "1",
      name: MINIAPP.title,
      iconUrl: `https://${NEXT_PUBLIC_HOST}/images/og/icon.png`,
      homeUrl: `https://${NEXT_PUBLIC_HOST}`,
      splashImageUrl: `https://${NEXT_PUBLIC_HOST}/images/og/splash.png`,
      splashBackgroundColor: MINIAPP.bgColor,
      subtitle: MINIAPP.description,
      description: MINIAPP.description,
      primaryCategory: MINIAPP.primaryCategory,
      tagline: MINIAPP.description,
      ogTitle: MINIAPP.title,
      ogDescription: MINIAPP.description,
      ogImageUrl: `https://${NEXT_PUBLIC_HOST}/images/og/cast.png`,
      castShareUrl: `https://${NEXT_PUBLIC_HOST}`,
      heroImageUrl: `https://${NEXT_PUBLIC_HOST}/images/og/hero.png`,
      canonicalDomain: NEXT_PUBLIC_HOST,
      screenshotUrls: [`https://${NEXT_PUBLIC_HOST}/images/og/screenshot.png`],
      requiredChains: MINIAPP.requiredChains,
      requiredCapabilities: MINIAPP.requiredCapabilities,
      tags: MINIAPP.tags,
      webhookUrl: MINIAPP.webhookUrl,
    },
  })
}
