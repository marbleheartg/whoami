import sdk from "@farcaster/miniapp-sdk"
import clsx from "clsx"
import NextImage from "next/image"
import { useEffect, useState } from "react"
import { NavLink } from "react-router"
import { base } from "viem/chains"
import { useConnect, useConnectors, useSwitchChain } from "wagmi"
import { store } from "../../lib/store"

const Header = () => {
  const { user } = store()
  const [scrolled, setScrolled] = useState(false)

  const { mutate: connect } = useConnect()
  const connectors = useConnectors()
  const { mutate: switchChain } = useSwitchChain()
  const session = store.getState().session

  useEffect(() => {
    connect({ connector: connectors[0] })
    switchChain({ chainId: base.id })

    setTimeout(() => {
      connect({ connector: connectors[0] })
      switchChain({ chainId: base.id })
    }, 2000)
  }, [session])

  useEffect(() => {
    const handleScroll = (e?: Event) => {
      const main = document.querySelector("main")
      const mainScroll = main?.scrollTop || 0
      const windowScroll = window.scrollY || document.documentElement.scrollTop || 0
      setScrolled(mainScroll > 0 || windowScroll > 0)
    }

    // Listen to main element scroll
    const main = document.querySelector("main")
    main?.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      main?.removeEventListener("scroll", handleScroll)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header
      className={clsx(
        "fixed top-5 z-30",
        "bg-white/5 glass rounded-full overflow-hidden",
        "flex items-center",
        scrolled ? "left-1/2 -translate-x-1/2 w-fit p-1 gap-3" : "inset-x-5 px-3 py-2 justify-between",
      )}
    >
      <NextImage className="rounded-full" src={"/images/logo.svg"} alt="logo" width={32} height={32} priority />

      <NavLink to="/home" onClick={() => sdk.haptics.impactOccurred("medium")}>
        <div className={clsx("relative flex items-center", "glass rounded-2xl", "h-8", "pl-2 pr-[35px]")}>
          <div className="text-base text-(--heading)">{user ? user.displayName : "nickname"}</div>

          <div className={clsx("absolute right-px top-px aspect-square w-[29px]", "border-2 border-(--bg-border) rounded-full", "cursor-pointer")}>
            <NextImage src={user?.pfpUrl || "https://placekittens.com/32/32"} fill alt="pfp" className="rounded-full" priority />
          </div>
        </div>
      </NavLink>
    </header>
  )
}

export default Header
