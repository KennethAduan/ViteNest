import type { InputHTMLAttributes } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import PasswordInput from '@/components/PasswordInput'

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string
    isPassword?: boolean
}

export function AuthField({ label, isPassword, id, ...props }: AuthFieldProps) {
    const fieldId = id ?? props.name
    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={fieldId}>{label}</Label>
            {isPassword ? (
                <PasswordInput id={fieldId} {...props} />
            ) : (
                <Input id={fieldId} {...props} />
            )}
        </div>
    )
}
