import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fontKhand, fontManrope, fontMontserrat } from "@/themes/font";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-screen w-full">
      <div className="flex w-full lg:w-1/2 flex-col justify-center bg-[#f8f8f8]/80 p-12 text-left">
        <h1
          className={cn(
            "text-2xl font-bold text-[#333]",
            fontMontserrat.className
          )}
        >
          Helth.ai
        </h1>
        <h2
          className={cn(
            fontKhand.className,
            "mt-4 text-6xl font-extrabold leading-tight text-[#333]"
          )}
        >
          Providing health check solution for concrete
        </h2>
        <p className={cn("mt-4 text-lg text-[#666]", fontManrope.className)}>
          Our innovative approach utilizes the latest in deep learning
          technology to monitor the integrity of concrete structures, ensuring
          long-term durability and safety. Our comprehensive diagnostics provide
          actionable insights for maintenance and repair, tailored to meet the
          needs of engineers and construction professionals.
        </p>
        <Link href="/predict">
          <Button
            className={cn(
              "mt-6 w-40 bg-black text-white",
              fontManrope.className
            )}
            size={"lg"}
          >
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
}
