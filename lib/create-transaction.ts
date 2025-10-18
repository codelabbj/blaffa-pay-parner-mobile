// Transaction creation service

import { parseBackendError, formatErrorMessage } from './error-utils'

export interface CreateTransactionPayload {
  type: "deposit" | "withdrawal";
  amount: number;
  recipient_phone: string;
  network: string;
}

export interface CreateTransactionResponse {
  uid: string;
  reference: string;
  type: string;
  amount: string;
  recipient_phone: string;
  recipient_name: string | null;
  objet: string;
  status: string;
  network: string;
  network_name: string;
  created_at: string;
  updated_at: string;
}

class CreateTransactionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  }

  // Create a new transaction
  async createTransaction(accessToken: string, payload: CreateTransactionPayload): Promise<CreateTransactionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/user/transactions/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle different types of errors
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        } else if (response.status === 400) {
          // Handle validation errors using structured error parsing
          const parsedError = parseBackendError(errorData)
          const formattedMessage = formatErrorMessage(parsedError)
          throw new Error(formattedMessage)
        } else if (response.status === 403) {
          throw new Error('Insufficient permissions. Please contact support.');
        } else if (response.status === 404) {
          throw new Error('Network or recipient not found. Please check your selection.');
        } else if (response.status === 422) {
          throw new Error('Transaction validation failed. Please check your account balance and details.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          // If it's a validation error with field-specific messages, stringify it
          if (errorData && typeof errorData === 'object') {
            throw new Error(JSON.stringify(errorData));
          }
          throw new Error(errorData.detail || 'Failed to create transaction');
        }
      }

      const data: CreateTransactionResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Create transaction error:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const createTransactionService = new CreateTransactionService();
