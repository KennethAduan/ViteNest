export function stringFieldProps(field: {
  name: string
  state: {
    value: string
    meta: {
      isTouched: boolean
      isValid: boolean
      errors: Array<{ message?: string } | undefined>
    }
  }
  handleBlur: () => void
  handleChange: (value: string) => void
}) {
  return {
    name: field.name,
    value: field.state.value,
    onBlur: field.handleBlur,
    onChange: field.handleChange,
    isInvalid: field.state.meta.isTouched && !field.state.meta.isValid,
    errors: field.state.meta.errors,
  }
}
