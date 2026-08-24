import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type TextFormFieldProps = {
  label: string
  name: string
  value: string
  onBlur: () => void
  onChange: (value: string) => void
  isInvalid: boolean
  errors: Array<{ message?: string } | undefined>
  type?: string
  placeholder?: string
}

export function TextFormField({
  label,
  name,
  value,
  onBlur,
  onChange,
  isInvalid,
  errors,
  type,
  placeholder,
}: TextFormFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <FieldContent>
        <Input
          id={name}
          name={name}
          value={value}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={isInvalid}
          type={type}
          placeholder={placeholder}
        />
      </FieldContent>
      <FieldError errors={errors} />
    </Field>
  )
}
