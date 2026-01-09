import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Get IP from headers (works with most hosting providers)
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const cfConnectingIp = request.headers.get("cf-connecting-ip")

  const ip = cfConnectingIp || forwarded?.split(",")[0]?.trim() || realIp || "unknown"

  // Get other headers
  const userAgent = request.headers.get("user-agent") || "unknown"
  const acceptLanguage = request.headers.get("accept-language") || "unknown"
  const referer = request.headers.get("referer") || null

  // Try to get geolocation from IP using a free API
  let geo = null
  if (ip && ip !== "unknown" && ip !== "::1" && ip !== "127.0.0.1") {
    try {
      const geoResponse = await fetch(
        `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`,
      )
      if (geoResponse.ok) {
        const geoData = await geoResponse.json()
        if (geoData.status === "success") {
          geo = {
            country: geoData.country,
            countryCode: geoData.countryCode,
            region: geoData.regionName,
            regionCode: geoData.region,
            city: geoData.city,
            zip: geoData.zip,
            lat: geoData.lat,
            lon: geoData.lon,
            timezone: geoData.timezone,
            isp: geoData.isp,
            org: geoData.org,
            as: geoData.as,
          }
        }
      }
    } catch {
      // Geolocation failed, continue without it
    }
  }

  return NextResponse.json({
    ip,
    userAgent,
    acceptLanguage,
    referer,
    geo,
    timestamp: new Date().toISOString(),
  })
}
