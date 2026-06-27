"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { togglePayment, type TogglePaymentState } from "../../actions";
import { SubmitButton } from "../../_components/SubmitButton";

const INITIAL: TogglePaymentState = { status: "idle" };

/**
 * Per-member mark-paid / mark-due toggle. Uses useActionState so a failed write
 * shows inline feedback right by the button instead of silently doing nothing.
 */
export function PaymentToggleForm({
  memberId,
  period,
  isPaid,
  amount,
}: {
  memberId: string;
  period: string;
  isPaid: boolean;
  amount: number;
}) {
  const t = useTranslations("admin.payments");
  const tc = useTranslations("admin.common");
  const [state, formAction] = useActionState(togglePayment, INITIAL);

  return (
    <form
      action={formAction}
      className="flex shrink-0 flex-col items-start gap-1 sm:items-end"
    >
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <input type="hidden" name="memberId" value={memberId} />
        <input type="hidden" name="period" value={period} />
        <input type="hidden" name="paid" value={isPaid ? "1" : "0"} />
        {isPaid ? (
          <input type="hidden" name="amount" value={amount} />
        ) : (
          <>
            <Input
              name="amount"
              type="number"
              min="0"
              step="1"
              defaultValue={amount}
              aria-label={t("collected")}
              className="h-9 w-24 text-right text-sm"
            />
            <Select
              name="method"
              defaultValue="cash"
              aria-label={t("method")}
              className="h-9 w-36 text-sm"
            >
              <option value="cash">{t("cash")}</option>
              <option value="transfer">{t("transfer")}</option>
              <option value="other">{t("other")}</option>
            </Select>
          </>
        )}
        <SubmitButton
          variant={isPaid ? "outline" : "success"}
          size="sm"
          pendingLabel={tc("loading")}
        >
          {isPaid ? (
            t("markDue")
          ) : (
            <>
              <Check />
              {t("markPaid")}
            </>
          )}
        </SubmitButton>
      </div>
      {state.status === "error" ? (
        <span role="alert" className="text-xs text-destructive-foreground">
          {tc("saveError")}
        </span>
      ) : null}
    </form>
  );
}
