// Error parsing utilities for handling backend error responses

export interface StructuredError {
  [field: string]: string | string[]
}

export interface ParsedError {
  message: string
  field?: string
  type: 'structured' | 'simple' | 'network'
}

/**
 * Parse backend error response into user-friendly message
 * Handles structured errors like {"password":["Mot de passe incorrect."]}
 */
export function parseBackendError(error: any): ParsedError {
  // Handle network errors
  if (!error || typeof error !== 'object') {
    return {
      message: typeof error === 'string' ? error : 'An unexpected error occurred',
      type: 'simple'
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    try {
      // Try to parse JSON error message
      const parsed = JSON.parse(error.message)
      if (typeof parsed === 'object' && parsed !== null) {
        return parseStructuredError(parsed)
      }
    } catch {
      // If not JSON, return the error message as is
      return {
        message: error.message,
        type: 'simple'
      }
    }
  }

  // Handle direct structured error objects
  if (typeof error === 'object' && error !== null) {
    return parseStructuredError(error)
  }

  return {
    message: 'An unexpected error occurred',
    type: 'simple'
  }
}

/**
 * Parse structured error object into user-friendly message
 */
function parseStructuredError(errorData: StructuredError): ParsedError {
  const errorMessages: string[] = []
  const fields: string[] = []

  Object.keys(errorData).forEach(field => {
    const fieldValue = errorData[field]
    
    if (Array.isArray(fieldValue)) {
      // Handle array of error messages for a field
      const fieldMessages = fieldValue.join(', ')
      errorMessages.push(fieldMessages)
      fields.push(field)
    } else if (typeof fieldValue === 'string' && fieldValue.trim()) {
      // Handle single error message for a field
      errorMessages.push(fieldValue.trim())
      fields.push(field)
    }
  })

  if (errorMessages.length === 0) {
    return {
      message: 'An error occurred',
      type: 'structured'
    }
  }

  // Join all error messages
  const finalMessage = errorMessages.join('. ')
  
  return {
    message: finalMessage,
    field: fields.length === 1 ? fields[0] : undefined,
    type: 'structured'
  }
}

/**
 * Get user-friendly field names for error display
 */
export function getFieldDisplayName(field: string): string {
  const fieldMap: Record<string, string> = {
    'password': 'Password',
    'email': 'Email',
    'phone': 'Phone Number',
    'first_name': 'First Name',
    'last_name': 'Last Name',
    'amount': 'Amount',
    'recipient_phone': 'Recipient Phone',
    'network': 'Network',
    'proof_image': 'Proof Image',
    'proof_description': 'Proof Description',
    'old_password': 'Current Password',
    'new_password': 'New Password',
    'confirm_password': 'Confirm Password',
    'contact_method': 'Contact Method'
  }

  return fieldMap[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Format error message with field context
 */
export function formatErrorMessage(parsedError: ParsedError): string {
  if (parsedError.type === 'structured' && parsedError.field) {
    const fieldName = getFieldDisplayName(parsedError.field)
    return `${fieldName}: ${parsedError.message}`
  }
  
  return parsedError.message
}
