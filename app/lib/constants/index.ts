const CA = "0x"

const MINIAPP = {
  title: "whoami",
  description: "your digital fingerprint",
  tags: ["analytics", "privacy", "identity", "tools", "utility"],
  primaryCategory: "utility",
  webhookUrl: "https://api.neynar.com/f/app/f152da60-bbd8-4d98-98b7-303904c2e200/event",
  bgColor: "#0f2239",
  requiredCapabilities: ["actions.ready"],
  requiredChains: ["eip155:8453"],
}

const MINIAPP_METADATA = {
  version: "next",
  imageUrl: `https://${process.env.NEXT_PUBLIC_HOST}/images/og/cast.png`,
  aspectRatio: "3:2",
  button: {
    title: "open",
    action: {
      type: "launch_miniapp",
      url: `https://${process.env.NEXT_PUBLIC_HOST}`,
      name: MINIAPP.title,
      splashImageUrl: `https://${process.env.NEXT_PUBLIC_HOST}/images/og/splash.png`,
      splashBackgroundColor: MINIAPP.bgColor,
    },
  },
}

export { CA, MINIAPP, MINIAPP_METADATA }
