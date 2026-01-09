import axiosAuth from "@/lib/api/config"
import { store } from "@/lib/store"
import { useQuery } from "@tanstack/react-query"

export type NeynarUser = {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  custody_address: string
  profile: {
    bio: {
      text: string
    }
    location?: {
      latitude: number
      longitude: number
      address?: {
        city: string
        state: string
        state_code: string
        country: string
        country_code: string
      }
    }
  }
  follower_count: number
  following_count: number
  verifications: string[]
  verified_addresses: {
    eth_addresses: string[]
    sol_addresses: string[]
  }
  power_badge: boolean
  experimental?: {
    neynar_user_score: number
  }
  score?: number
}

async function fetchNeynarUser(fid: number): Promise<NeynarUser | null> {
  const { data } = await axiosAuth.get<{ users: NeynarUser[] }>(`/api/neynar/v2/farcaster/user/bulk?fids=${fid}`)
  return data.users?.[0] ?? null
}

export function useNeynarUser(fid: number | undefined) {
  const { session } = store()

  return useQuery({
    queryKey: ["neynar-user", fid],
    queryFn: () => fetchNeynarUser(fid!),
    enabled: !!fid && !!session,
  })
}
