import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
        주문이 취소되었습니다.
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  return (
    <div className="flex w-full items-start">
      {ORDER_STATUS_FLOW.map((step, i) => {
        const done = i <= currentIndex;
        const isLast = i === ORDER_STATUS_FLOW.length - 1;
        return (
          <div key={step} className={cn("flex flex-1 flex-col items-center", i === 0 && "flex-none items-start")}>
            <div className="flex w-full items-center">
              {i !== 0 && (
                <div className={cn("h-px flex-1", done ? "bg-ink" : "bg-line")} />
              )}
              <div
                className={cn(
                  "flex h-3 w-3 shrink-0 items-center justify-center rounded-full border",
                  done ? "border-ink bg-ink" : "border-line bg-surface"
                )}
              />
              {!isLast && i === 0 && <div className={cn("h-px flex-1", i < currentIndex ? "bg-ink" : "bg-line")} />}
            </div>
            <span
              className={cn(
                "mt-2 whitespace-nowrap text-center font-body text-[11px]",
                done ? "text-ink" : "text-muted"
              )}
            >
              {ORDER_STATUS_LABEL[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
