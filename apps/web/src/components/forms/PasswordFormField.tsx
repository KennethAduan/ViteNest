import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field"
import PasswordInput from "@/components/PasswordInput"

type PasswordFormFieldProps = {
  label: string
  name: string
  value: string
  onBlur: () => void
  onChange: (value: string) => void
  isInvalid: boolean
  errors: Array<{ message?: string } | undefined>
  placeholder?: string
}

export function PasswordFormField({
  label,
  name,
  value,
  onBlur,
  onChange,
  isInvalid,
  errors,
  placeholder,
}: PasswordFormFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <FieldContent>
        <PasswordInput
          id={name}
          name={name}
          value={value}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={isInvalid}
          placeholder={placeholder}
        />
      </FieldContent>
      <FieldError errors={errors} />
    </Field>
  )
}
