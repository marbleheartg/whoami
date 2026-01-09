"use client"

import { useNeynarUser } from "@/lib/hooks/useNeynarUser"
import { useUserData } from "@/lib/hooks/useUserData"
import { store } from "@/lib/store"
import sdk from "@farcaster/miniapp-sdk"
import clsx from "clsx"
import HeroCard, { InfoRow, StatBox, StatGrid } from "../components/HeroCard"
import WalletBalances from "../components/WalletBalances"

// Test FID for development (dwr.eth) - remove in production
const DEV_FID = 3

export default function Page() {
  const { user, client } = store()
  const farcasterFid = user?.fid ?? DEV_FID
  const { data: neynarUser, isLoading: neynarLoading } = useNeynarUser(farcasterFid)
  const {
    server,
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
    performance,
    isLoading,
  } = useUserData()

  const displayName = neynarUser?.display_name || user?.displayName || "anonymous"
  const username = neynarUser?.username || user?.username || "unknown"
  const fid = neynarUser?.fid || user?.fid

  return (
    <main className={clsx("flex flex-col gap-4", "px-5 pt-25 pb-10", "overflow-y-scroll overflow-x-hidden")}>
      {/* IP Address */}
      <HeroCard
        icon="🌐"
        title="your ip address"
        value={server?.ip || "unavailable"}
        isLoading={isLoading}
        mono
        subtitle={
          server?.geo && (
            <span className="flex items-center gap-2">
              <span className="text-lg">{getCountryFlag(server.geo.countryCode)}</span>
              {server.geo.city}, {server.geo.region}, {server.geo.country}
            </span>
          )
        }
      />

      {/* Location */}
      {server?.geo && (
        <HeroCard icon="📍" title="location" value={server.geo.city}>
          <StatGrid>
            <StatBox label="region" value={server.geo.region} />
            <StatBox label="country" value={server.geo.country} />
          </StatGrid>
          <div className="mt-3">
            <InfoRow label="zip code" value={server.geo.zip} />
            <InfoRow label="coordinates" value={`${server.geo.lat?.toFixed(4)}, ${server.geo.lon?.toFixed(4)}`} mono />
          </div>
        </HeroCard>
      )}

      {/* ISP */}
      {server?.geo && (
        <HeroCard icon="🔌" title="network provider" value={server.geo.isp} isLoading={isLoading}>
          <InfoRow label="organization" value={server.geo.org} />
          <InfoRow label="as number" value={server.geo.as} mono />
        </HeroCard>
      )}

      {/* Preferences */}
      {preferences && (
        <HeroCard icon="🎨" title="preferences" value={preferences.colorScheme}>
          <InfoRow label="color scheme" value={preferences.colorScheme === "dark" ? "🌙 dark" : "☀️ light"} />
          <InfoRow label="reduced motion" value={preferences.reducedMotion ? "✅ yes" : "❌ no"} />
          <InfoRow label="contrast" value={preferences.contrast} />
          <InfoRow label="color gamut" value={preferences.colorGamut.toUpperCase()} />
        </HeroCard>
      )}

      {/* Media Devices */}
      {media && (media.cameras > 0 || media.microphones > 0 || media.speakers > 0) && (
        <HeroCard icon="🎥" title="media devices" value={`${media.cameras + media.microphones + media.speakers} devices`}>
          <StatGrid>
            <StatBox label="cameras" value={media.cameras} />
            <StatBox label="microphones" value={media.microphones} />
          </StatGrid>
          <div className="mt-3">
            <InfoRow label="speakers" value={media.speakers} />
          </div>
        </HeroCard>
      )}

      {/* Storage */}
      {storage && storage.quota && (
        <HeroCard icon="💾" title="storage" value={formatBytes(storage.usage ?? 0)}>
          <InfoRow label="quota" value={formatBytes(storage.quota)} />
          <InfoRow label="used" value={storage.usage ? `${((storage.usage / storage.quota) * 100).toFixed(1)}%` : "—"} />
          <InfoRow label="persistent" value={storage.persistent ? "✅ yes" : "❌ no"} />
        </HeroCard>
      )}

      {/* Performance */}
      {performance && performance.usedJSHeapSize && (
        <HeroCard icon="⚡" title="memory" value={formatBytes(performance.usedJSHeapSize)}>
          <InfoRow label="heap limit" value={formatBytes(performance.jsHeapSizeLimit ?? 0)} />
          <InfoRow label="total heap" value={formatBytes(performance.totalJSHeapSize ?? 0)} />
          <InfoRow label="usage" value={`${(((performance.usedJSHeapSize ?? 0) / (performance.jsHeapSizeLimit ?? 1)) * 100).toFixed(1)}%`} />
        </HeroCard>
      )}

      {/* Browser */}
      <HeroCard icon="🌍" title="browser" value={`${browser?.name} ${browser?.version}`} isLoading={isLoading}>
        <InfoRow label="engine" value={browser?.engine} />
        <InfoRow label="language" value={browser?.language} />
        <InfoRow label="cookies" value={browser?.cookiesEnabled ? "✅ enabled" : "❌ disabled"} />
        <InfoRow label="do not track" value={browser?.doNotTrack ? "✅ enabled" : "❌ disabled"} />
        <InfoRow label="online" value={browser?.online ? "✅ yes" : "❌ offline"} />
      </HeroCard>

      {/* Device */}
      <HeroCard icon="💻" title="device" value={device?.platform} isLoading={isLoading}>
        <InfoRow label="vendor" value={device?.vendor} />
        <InfoRow label="cpu cores" value={device?.cores ? `${device.cores} cores` : "unknown"} />
        <InfoRow label="memory" value={device?.memory ? `${device.memory} GB` : "unknown"} />
        <InfoRow label="touch points" value={device?.touchPoints.toString()} />
        <InfoRow label="pixel ratio" value={`${device?.devicePixelRatio}x`} />
      </HeroCard>

      {/* Display */}
      <HeroCard icon="🖥️" title="display" value={`${screen?.width} × ${screen?.height}`} isLoading={isLoading}>
        <InfoRow label="available" value={`${screen?.availWidth} × ${screen?.availHeight}`} />
        <InfoRow label="viewport" value={`${windowInfo?.innerWidth} × ${windowInfo?.innerHeight}`} />
        <InfoRow label="color depth" value={`${screen?.colorDepth}-bit`} />
        <InfoRow label="orientation" value={screen?.orientation.replace("portrait-", "").replace("landscape-", "")} />
      </HeroCard>

      {/* Timezone */}
      <HeroCard icon="🕐" title="timezone" value={time?.timezone} isLoading={isLoading}>
        <InfoRow
          label="offset"
          value={`UTC${time?.timezoneOffset ? (time.timezoneOffset > 0 ? "-" : "+") + Math.abs(time.timezoneOffset / 60) : "±0"}`}
        />
        <InfoRow label="locale" value={time?.locale} />
        <InfoRow label="server time" value={server?.timestamp ? new Date(server.timestamp).toLocaleString() : "—"} />
      </HeroCard>

      {/* Connection */}
      {network && (
        <HeroCard icon="📶" title="connection" value={network.effectiveType.toUpperCase()}>
          <InfoRow label="downlink" value={`${network.downlink} Mbps`} />
          <InfoRow label="latency" value={`${network.rtt} ms`} />
          <InfoRow label="data saver" value={network.saveData ? "✅ on" : "❌ off"} />
        </HeroCard>
      )}

      {/* Battery */}
      {battery && (
        <HeroCard icon="🔋" title="battery" value={`${Math.round(battery.level)}%`}>
          <InfoRow label="status" value={battery.charging ? "⚡ charging" : "🔌 discharging"} />
          {battery.charging && battery.chargingTime !== Infinity && <InfoRow label="time to full" value={formatTime(battery.chargingTime)} />}
          {!battery.charging && battery.dischargingTime !== Infinity && (
            <InfoRow label="time remaining" value={formatTime(battery.dischargingTime)} />
          )}
        </HeroCard>
      )}

      {/* Graphics */}
      {webgl && (
        <HeroCard icon="🎮" title="graphics" value={webgl.vendor}>
          <InfoRow label="renderer" value={webgl.renderer} />
        </HeroCard>
      )}

      {/* User Agent */}
      <HeroCard icon="🔍" title="user agent" isLoading={isLoading}>
        <div className="text-[10px] font-mono opacity-60 break-all leading-relaxed">{server?.userAgent}</div>
      </HeroCard>

      {/* Farcaster Stats */}
      {neynarUser && (
        <HeroCard icon="📊" title="farcaster stats" value={`@${username}`} subtitle={displayName}>
          <StatGrid>
            <StatBox label="followers" value={formatNumber(neynarUser.follower_count)} />
            <StatBox label="following" value={formatNumber(neynarUser.following_count)} />
          </StatGrid>
          <div className="mt-3">
            <InfoRow label="power badge" value={neynarUser.power_badge ? "⚡ yes" : "❌ no"} />
            {neynarUser.score !== undefined && <InfoRow label="neynar score" value={neynarUser.score.toFixed(2)} />}
          </div>
        </HeroCard>
      )}

      {/* Bio */}
      {neynarUser?.profile?.bio?.text && <HeroCard icon="📝" title="bio" subtitle={neynarUser.profile.bio.text} />}

      {/* Farcaster Identity */}
      {(user || neynarUser) && (
        <HeroCard icon="🪪" title="farcaster identity" value={fid?.toString()} isLoading={neynarLoading} mono>
          <InfoRow label="username" value={`@${username}`} />
          <InfoRow label="display name" value={displayName} />
          {neynarUser?.custody_address && <InfoRow label="custody" value={truncateAddress(neynarUser.custody_address)} mono />}
        </HeroCard>
      )}

      {/* Verified Addresses */}
      {neynarUser?.verified_addresses &&
        (neynarUser.verified_addresses.eth_addresses.length > 0 || neynarUser.verified_addresses.sol_addresses.length > 0) && (
          <HeroCard
            icon="✅"
            title="verified addresses"
            value={`${neynarUser.verified_addresses.eth_addresses.length + neynarUser.verified_addresses.sol_addresses.length} addresses`}
          >
            {neynarUser.verified_addresses.eth_addresses.map((addr, i) => (
              <InfoRow key={`eth-${i}`} label={`eth ${i + 1}`} value={truncateAddress(addr)} mono />
            ))}
            {neynarUser.verified_addresses.sol_addresses.map((addr, i) => (
              <InfoRow key={`sol-${i}`} label={`sol ${i + 1}`} value={truncateAddress(addr)} mono />
            ))}
          </HeroCard>
        )}

      {/* Wallet Balances */}
      <WalletBalances
        ethAddresses={neynarUser?.verified_addresses?.eth_addresses || []}
        solAddresses={neynarUser?.verified_addresses?.sol_addresses || []}
      />

      {/* Farcaster Client */}
      {client && (
        <HeroCard icon="📱" title="farcaster client" value={client.clientFid ? `fid ${client.clientFid}` : "unknown"} mono>
          {client.added && <InfoRow label="app added" value="✅ yes" />}
          {client.safeAreaInsets && (
            <>
              <InfoRow label="safe area top" value={`${client.safeAreaInsets.top}px`} />
              <InfoRow label="safe area bottom" value={`${client.safeAreaInsets.bottom}px`} />
            </>
          )}
        </HeroCard>
      )}

      {/* Compose Cast Button */}
      <button
        onClick={() => {
          sdk.actions.composeCast({
            text: "just checked my data 🔍",
            embeds: [`https://${process.env.NEXT_PUBLIC_HOST}`],
          })
        }}
        className={clsx(
          "group relative mt-6 py-4 px-8 rounded-2xl overflow-hidden",
          "bg-linear-to-r from-violet-600/80 via-fuchsia-500/80 to-pink-500/80",
          "text-xl font-bold text-white tracking-wide",
          "active:scale-[0.97] transition-all duration-300",
          "flex items-center justify-center gap-3",
          "border border-white/20",
        )}
      >
        <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <span className="text-lg">✨</span>
        <span className="relative">share</span>
        <span className="text-lg">🔮</span>
      </button>
    </main>
  )
}

function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌍"
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

function formatTime(seconds: number): string {
  if (seconds === Infinity) return "unknown"
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function truncateAddress(address: string): string {
  if (!address || address.length < 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}
