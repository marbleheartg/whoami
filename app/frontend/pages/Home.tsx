import clsx from "clsx"
import { useConnection } from "wagmi"

export default function Home() {
  const { address: userAddress } = useConnection()

  return (
    <main className={clsx("flex flex-col gap-5", "px-5 pt-20 pb-26", "overflow-y-scroll overflow-x-hidden")}>
      <div className={clsx("p-4 pt-[15px]", "bg-white/10 glass rounded-2xl", "overflow-hidden")}>
        <h1>Home name</h1>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta perferendis maxime neque explicabo animi magnam libero labore minus nostrum,
        modi commodi unde repellat autem, aspernatur, itaque tenetur odit exercitationem. Officia.
      </div>
    </main>
  )
}
