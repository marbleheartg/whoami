import axiosAuth from "@/lib/api/config"
import { store } from "@/lib/store"
import { useQuery } from "@tanstack/react-query"

export type TokenBalance = {
  object: "token_balance"
  token: {
    object: "token"
    name: string
    symbol: string
    contract_address?: string
    decimals: number
    logo?: string
  }
  balance: {
    in_token: number | string
    in_usdc: number | string
  }
}

export type AddressBalance = {
  object: "address_balance"
  verified_address: {
    address: string
    network: string
  }
  token_balances: TokenBalance[]
}

export type UserBalanceResponse = {
  user_balance: {
    object: "user_balance"
    user: {
      fid: number
      username: string
      display_name: string
      pfp_url: string
    }
    address_balances: AddressBalance[]
  }
}

// Only show stablecoins (native ETH not available via this API)
function isAllowedToken(token: TokenBalance["token"]): boolean {
  const symbol = token.symbol?.toUpperCase() || ""
  return symbol === "USDC" || symbol === "USDT" || symbol === "DAI"
}

async function fetchUserBalances(fid: number): Promise<AddressBalance[]> {
  // Only fetch base network (ethereum returns empty for most users)
  const [baseRes] = await Promise.allSettled([axiosAuth.get<UserBalanceResponse>(`/api/neynar/v2/farcaster/user/balance?fid=${fid}&networks=base`)])

  const balances: AddressBalance[] = []

  if (baseRes.status === "fulfilled") {
    const addressBalances = baseRes.value.data.user_balance?.address_balances ?? []
    const filtered = addressBalances.map(ab => ({
      ...ab,
      token_balances: ab.token_balances.filter(tb => isAllowedToken(tb.token)),
    }))
    // Only include addresses that have tokens after filtering
    balances.push(...filtered.filter(ab => ab.token_balances.length > 0))
  }

  return balances
}

export function useUserBalances(fid: number | undefined) {
  const { session } = store()

  return useQuery({
    queryKey: ["user-balances", fid],
    queryFn: () => fetchUserBalances(fid!),
    enabled: !!fid && !!session,
  })
}
