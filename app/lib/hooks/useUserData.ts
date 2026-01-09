import { useQuery } from "@tanstack/react-query"

export type GeoData = {
  country: string
  countryCode: string
  region: string
  regionCode: string
  city: string
  zip: string
  lat: number
  lon: number
  timezone: string
  isp: string
  org: string
  as: string
}

export type ServerData = {
  ip: string
  userAgent: string
  acceptLanguage: string
  referer: string | null
  geo: GeoData | null
  timestamp: string
}

export type BatteryInfo = {
  charging: boolean
  level: number
  chargingTime: number
  dischargingTime: number
}

export type NetworkInfo = {
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
}

export type BrowserInfo = {
  name: string
  version: string
  engine: string
  language: string
  languages: string[]
  cookiesEnabled: boolean
  doNotTrack: boolean
  online: boolean
  pdfViewerEnabled: boolean
  webdriver: boolean
}

export type DeviceInfo = {
  platform: string
  vendor: string
  cores: number
  memory: number | null
  touchPoints: number
  devicePixelRatio: number
}

export type ScreenInfo = {
  width: number
  height: number
  availWidth: number
  availHeight: number
  colorDepth: number
  pixelDepth: number
  orientation: string
}

export type WindowInfo = {
  innerWidth: number
  innerHeight: number
  outerWidth: number
  outerHeight: number
  scrollX: number
  scrollY: number
}

export type TimeInfo = {
  timezone: string
  timezoneOffset: number
  locale: string
}

export type WebGLInfo = {
  vendor: string
  renderer: string
}

export type PreferencesInfo = {
  colorScheme: "dark" | "light" | "no-preference"
  reducedMotion: boolean
  reducedTransparency: boolean
  contrast: "more" | "less" | "no-preference"
  colorGamut: "srgb" | "p3" | "rec2020" | "unknown"
}

export type MediaDevicesInfo = {
  cameras: number
  microphones: number
  speakers: number
}

export type StorageInfo = {
  quota: number | null
  usage: number | null
  persistent: boolean
}

export type PerformanceInfo = {
  jsHeapSizeLimit: number | null
  totalJSHeapSize: number | null
  usedJSHeapSize: number | null
}

export type UserData = {
  server: ServerData | null
  browser: BrowserInfo | null
  device: DeviceInfo | null
  screen: ScreenInfo | null
  window: WindowInfo | null
  time: TimeInfo | null
  network: NetworkInfo | null
  battery: BatteryInfo | null
  webgl: WebGLInfo | null
  preferences: PreferencesInfo | null
  media: MediaDevicesInfo | null
  storage: StorageInfo | null
  performance: PerformanceInfo | null
}

function detectBrowser(ua: string): { name: string; version: string; engine: string } {
  const browsers = [
    { name: "Firefox", regex: /Firefox\/(\d+\.\d+)/ },
    { name: "Opera", regex: /OPR\/(\d+\.\d+)/ },
    { name: "Edge", regex: /Edg\/(\d+\.\d+)/ },
    { name: "Chrome", regex: /Chrome\/(\d+\.\d+)/ },
    { name: "Safari", regex: /Version\/(\d+\.\d+).*Safari/ },
    { name: "IE", regex: /MSIE (\d+\.\d+)/ },
  ]

  for (const browser of browsers) {
    const match = ua.match(browser.regex)
    if (match) {
      return {
        name: browser.name,
        version: match[1],
        engine: ua.includes("Gecko") ? "Gecko" : ua.includes("WebKit") ? "WebKit" : ua.includes("Trident") ? "Trident" : "Unknown",
      }
    }
  }

  return { name: "Unknown", version: "Unknown", engine: "Unknown" }
}

function getWebGLInfo(): WebGLInfo | null {
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
      if (debugInfo) {
        return {
          vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
          renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
        }
      }
    }
  } catch {
    // WebGL not available
  }
  return null
}

function getPreferences(): PreferencesInfo {
  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "no-preference"

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const reducedTransparency = window.matchMedia("(prefers-reduced-transparency: reduce)").matches

  const contrast = window.matchMedia("(prefers-contrast: more)").matches
    ? "more"
    : window.matchMedia("(prefers-contrast: less)").matches
    ? "less"
    : "no-preference"

  const colorGamut = window.matchMedia("(color-gamut: rec2020)").matches
    ? "rec2020"
    : window.matchMedia("(color-gamut: p3)").matches
    ? "p3"
    : window.matchMedia("(color-gamut: srgb)").matches
    ? "srgb"
    : "unknown"

  return { colorScheme, reducedMotion, reducedTransparency, contrast, colorGamut }
}

async function getMediaDevices(): Promise<MediaDevicesInfo> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return {
      cameras: devices.filter(d => d.kind === "videoinput").length,
      microphones: devices.filter(d => d.kind === "audioinput").length,
      speakers: devices.filter(d => d.kind === "audiooutput").length,
    }
  } catch {
    return { cameras: 0, microphones: 0, speakers: 0 }
  }
}

async function getStorageInfo(): Promise<StorageInfo> {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate()
      const persisted = (await navigator.storage.persisted?.()) ?? false
      return {
        quota: estimate.quota ?? null,
        usage: estimate.usage ?? null,
        persistent: persisted,
      }
    }
  } catch {
    // Storage API not available
  }
  return { quota: null, usage: null, persistent: false }
}

function getPerformanceInfo(): PerformanceInfo {
  const memory = (performance as Performance & { memory?: MemoryInfo }).memory
  if (memory) {
    return {
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      totalJSHeapSize: memory.totalJSHeapSize,
      usedJSHeapSize: memory.usedJSHeapSize,
    }
  }
  return { jsHeapSizeLimit: null, totalJSHeapSize: null, usedJSHeapSize: null }
}

async function fetchUserData(): Promise<UserData> {
  // Fetch server data
  const response = await fetch("/api/whoami")
  const serverData: ServerData = await response.json()

  // Get browser info
  const ua = navigator.userAgent
  const browserInfo = detectBrowser(ua)

  const browser: BrowserInfo = {
    name: browserInfo.name,
    version: browserInfo.version,
    engine: browserInfo.engine,
    language: navigator.language,
    languages: [...navigator.languages],
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === "1",
    online: navigator.onLine,
    pdfViewerEnabled: navigator.pdfViewerEnabled ?? false,
    webdriver: navigator.webdriver ?? false,
  }

  // Get device info
  const device: DeviceInfo = {
    platform: navigator.platform,
    vendor: navigator.vendor,
    cores: navigator.hardwareConcurrency || 0,
    memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory || null,
    touchPoints: navigator.maxTouchPoints || 0,
    devicePixelRatio: window.devicePixelRatio || 1,
  }

  // Get screen info
  const screen: ScreenInfo = {
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    colorDepth: window.screen.colorDepth,
    pixelDepth: window.screen.pixelDepth,
    orientation: window.screen.orientation?.type || "unknown",
  }

  // Get window info
  const windowInfo: WindowInfo = {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  }

  // Get time info
  const time: TimeInfo = {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
  }

  // Get network info
  let network: NetworkInfo | null = null
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection
  if (connection) {
    network = {
      effectiveType: connection.effectiveType || "unknown",
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false,
    }
  }

  // Get battery info
  let battery: BatteryInfo | null = null
  try {
    const batteryManager = await (navigator as Navigator & { getBattery?: () => Promise<BatteryManager> }).getBattery?.()
    if (batteryManager) {
      battery = {
        charging: batteryManager.charging,
        level: batteryManager.level * 100,
        chargingTime: batteryManager.chargingTime,
        dischargingTime: batteryManager.dischargingTime,
      }
    }
  } catch {
    // Battery API not available
  }

  // Get WebGL info
  const webgl = getWebGLInfo()

  // Get preferences
  const preferences = getPreferences()

  // Get media devices
  const media = await getMediaDevices()

  // Get storage info
  const storage = await getStorageInfo()

  // Get performance info
  const performanceInfo = getPerformanceInfo()

  return {
    server: serverData,
    browser,
    device,
    screen,
    window: windowInfo,
    time,
    network,
    battery,
    webgl,
    preferences,
    media,
    storage,
    performance: performanceInfo,
  }
}

export function useUserData() {
  const query = useQuery({
    queryKey: ["user-data"],
    queryFn: fetchUserData,
  })

  return {
    server: query.data?.server ?? null,
    browser: query.data?.browser ?? null,
    device: query.data?.device ?? null,
    screen: query.data?.screen ?? null,
    window: query.data?.window ?? null,
    time: query.data?.time ?? null,
    network: query.data?.network ?? null,
    battery: query.data?.battery ?? null,
    webgl: query.data?.webgl ?? null,
    preferences: query.data?.preferences ?? null,
    media: query.data?.media ?? null,
    storage: query.data?.storage ?? null,
    performance: query.data?.performance ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  }
}

// Type declarations for browser APIs
interface NetworkInformation {
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

interface BatteryManager {
  charging: boolean
  level: number
  chargingTime: number
  dischargingTime: number
}

interface MemoryInfo {
  jsHeapSizeLimit: number
  totalJSHeapSize: number
  usedJSHeapSize: number
}
