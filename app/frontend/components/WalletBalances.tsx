"use client"

import { useQuery } from "@tanstack/react-query"
import { formatUnits } from "viem"
import { base } from "viem/chains"
import { useBalance, useReadContract } from "wagmi"
import HeroCard from "./HeroCard"

// USDC on Base
const USDC_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" as const
const USDC_DECIMALS = 6

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const

// Using local API proxy to avoid CORS
const SOLANA_PROXY = "/api/solana"

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function formatAmount(num: number): string {
  if (num >= 1000) return num.toFixed(2)
  if (num >= 1) return num.toFixed(4)
  if (num >= 0.0001) return num.toFixed(6)
  if (num === 0) return "0"
  return num.toExponential(2)
}

function formatUsd(amount: number): string {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`
  if (amount >= 1000) return `${(amount / 1000).toFixed(2)}K`
  return amount.toFixed(2)
}

// EVM address balance row
function EvmBalance({ address }: { address: `0x${string}` }) {
  const { data: ethBalance, isLoading: ethLoading } = useBalance({
    address,
    chainId: base.id,
  })

  const { data: usdcBalance, isLoading: usdcLoading } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
    chainId: base.id,
  })

  const ethAmount = ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)) : 0
  const usdcAmount = usdcBalance ? parseFloat(formatUnits(usdcBalance, USDC_DECIMALS)) : 0
  const isLoading = ethLoading || usdcLoading

  if (!isLoading && ethAmount === 0 && usdcAmount === 0) return null

  return (
    <div className="py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] opacity-40">BASE</span>
        <span className="text-[10px] font-mono opacity-50">{truncateAddress(address)}</span>
      </div>
      {isLoading ? (
        <div className="text-xs opacity-50">loading...</div>
      ) : (
        <div className="flex gap-4 text-xs">
          {ethAmount > 0 && <span>{formatAmount(ethAmount)} ETH</span>}
          {usdcAmount > 0 && <span>${formatUsd(usdcAmount)} USDC</span>}
        </div>
      )}
    </div>
  )
}

// Solana balance fetcher via proxy
async function fetchSolBalance(address: string): Promise<number> {
  try {
    const response = await fetch(SOLANA_PROXY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }),
    })
    const data = await response.json()
    console.log("SOL balance response:", address, data)
    // Balance is in lamports (1 SOL = 1e9 lamports)
    return (data.result?.value || 0) / 1e9
  } catch (err) {
    console.error("Failed to fetch SOL balance:", err)
    return 0
  }
}

// Solana address balance row
function SolanaBalance({ address }: { address: string }) {
  const {
    data: solBalance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sol-balance", address],
    queryFn: () => fetchSolBalance(address),
  })

  const solAmount = solBalance || 0

  return (
    <div className="py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] opacity-40">SOL</span>
        <span className="text-[10px] font-mono opacity-50">{truncateAddress(address)}</span>
      </div>
      {isLoading ? (
        <div className="text-xs opacity-50">loading...</div>
      ) : error ? (
        <div className="text-xs opacity-50">error loading</div>
      ) : (
        <div className="flex gap-4 text-xs">
          <span>{formatAmount(solAmount)} SOL</span>
        </div>
      )}
    </div>
  )
}

type WalletBalancesProps = {
  ethAddresses?: string[]
  solAddresses?: string[]
}

export default function WalletBalances({ ethAddresses = [], solAddresses = [] }: WalletBalancesProps) {
  const totalWallets = ethAddresses.length + solAddresses.length
  if (totalWallets === 0) return null

  return (
    <HeroCard icon="💰" title="wallet balances" value={`${totalWallets} wallets`}>
      {ethAddresses.map(addr => (
        <EvmBalance key={addr} address={addr as `0x${string}`} />
      ))}
      {solAddresses.map(addr => (
        <SolanaBalance key={addr} address={addr} />
      ))}
    </HeroCard>
  )
}
