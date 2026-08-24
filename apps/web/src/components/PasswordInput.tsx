
import { Eye, EyeOff } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { type InputHTMLAttributes, useState, type Ref } from "react";

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  showToggleLabel?: boolean;
  placeholder?: string;
  ref?: Ref<HTMLInputElement>;
}

// fallow-ignore-next-line complexity
function PasswordInput({
  showToggleLabel = false,
  placeholder = "Password",
  ref,
  ...inputProps
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid w-full  gap-6">
      <InputGroup>
        <InputGroupInput
          ref={ref}
          type={showPassword ? "text" : "password"}
          {...inputProps}
          placeholder={placeholder}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
            size="icon-xs"
            onClick={() => setShowPassword(!showPassword)}
            type="button"
          >
            {showPassword ? <Eye /> : <EyeOff />}
            {showToggleLabel && (
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export default PasswordInput;
