import { useState } from "react";
import { KeyRound, Send } from "lucide-react";
import { Input } from "../common/Input";
import { Button } from "../common/Button";

export function ScannerManualEntry({ onSubmit, disabled }) {
  const [code, setCode] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const v = code.trim().toUpperCase();
    if (!v) return;
    onSubmit?.(v);
    setCode("");
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input
        label="Manual ticket code"
        placeholder="e.g. TKT-A1B2C3D4"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        leftIcon={<KeyRound size={14} />}
        disabled={disabled}
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
      />
      <Button
        type="submit"
        disabled={disabled || !code.trim()}
        rightIcon={<Send size={14} />}
        className="w-full"
      >
        Validate code
      </Button>
    </form>
  );
}

export default ScannerManualEntry;