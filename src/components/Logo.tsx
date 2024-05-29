import { cn } from "@/lib/utils";
import { fontMontserrat } from "@/themes/font";

export default function Logo() {
  return (
    <div className={cn(fontMontserrat.className, "font-semibold text-xl")}>
      Helth.ai
    </div>
  );
}
