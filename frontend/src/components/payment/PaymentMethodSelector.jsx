import { CreditCard, Smartphone, Building2 } from "lucide-react";
import { Radio } from "../common/Radio";
import { cn } from "../../utils/cn";

const METHODS = [
  {
    id: "card",
    label: "Card",
    description: "Visa, Mastercard, Verve",
    icon: CreditCard,
  },
  {
    id: "bank_transfer",
    label: "Bank transfer",
    description: "Pay directly from your bank",
    icon: Building2,
  },
  {
    id: "ussd",
    label: "USSD / Mobile",
    description: "Pay from your mobile phone",
    icon: Smartphone,
  },
];

export function PaymentMethodSelector({ value = "card", onChange, className }) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {METHODS.map((m) => {
        const Icon = m.icon;
        return (
          <Radio
            key={m.id}
            name="payment-method"
            value={m.id}
            checked={value === m.id}
            onChange={() => onChange?.(m.id)}
            containerClassName={cn(
              "p-4",
              value === m.id && "border-primary bg-primary/5"
            )}
            label={
              <span className="flex items-center gap-2">
                <Icon size={16} className="text-primary" />
                {m.label}
              </span>
            }
            description={m.description}
          />
        );
      })}
    </div>
  );
}

export default PaymentMethodSelector;