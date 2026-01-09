"use client"

import { formatUnits } from "viem"
import { base } from "viem/chains"
import { useBalance, useReadContract } from "wagmi"
import HeroCard, { InfoRow } from "./HeroCard"

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

type BalanceCardProps = {
  address: `0x${string}`
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function BalanceCard({ address }: BalanceCardProps) {
  // Fetch native ETH balance
  const { data: ethBalance, isLoading: ethLoading } = useBalance({
    address,
    chainId: base.id,
  })

  // Fetch USDC balance
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
  const hasBalance = ethAmount > 0 || usdcAmount > 0

  if (!hasBalance && !isLoading) return null

  return (
    <HeroCard
      icon="💰"
      title={truncateAddress(address)}
      value={isLoading ? "loading..." : `${formatAmount(ethAmount)} ETH`}
      isLoading={isLoading}
      mono
    >
      {ethAmount > 0 && <InfoRow label="ETH" value={`${formatAmount(ethAmount)} ETH`} />}
      {usdcAmount > 0 && <InfoRow label="USDC" value={`$${formatUsd(usdcAmount)}`} />}
    </HeroCard>
  )
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
