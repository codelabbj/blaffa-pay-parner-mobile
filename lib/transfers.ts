// Transfer service for handling user-to-user transfers

export interface User {
  uid: string;
  display_name: string;
}

export interface UsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface Transfer {
  uid: string;
  reference: string;
  sender: number;
  sender_name: string;
  sender_email: string;
  receiver: number;
  receiver_name: string;
  receiver_email: string;
  amount: string;
  fees: string;
  status: string;
  description: string;
  sender_balance_before: string;
  sender_balance_after: string;
  receiver_balance_before: string;
  receiver_balance_after: string;
  completed_at: string;
  failed_reason: string;
  created_at: string;
  updated_at: string;
}

export interface SendTransferPayload {
  receiver_uid: string;
  amount: string;
  description: string;
}

export interface SendTransferResponse {
  success: boolean;
  message: string;
  transfer: Transfer;
}

export interface TransfersResponse {
  success: boolean;
  count: number;
  transfers: Transfer[];
}

export interface TransferStatsResponse {
  success: boolean;
  summary: {
    total_sent: number;
    total_received: number;
    amount_sent: number;
    amount_received: number;
  };
  sent_transfers: Transfer[];
  received_transfers: Transfer[];
}

class TransferService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  }

  // Search for users/receivers
  async searchUsers(accessToken: string, search: string): Promise<UsersResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/users/search/?search=${encodeURIComponent(search)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to search users');
      }

      const data: UsersResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  }

  // Send transfer
  async sendTransfer(accessToken: string, payload: SendTransferPayload): Promise<SendTransferResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/betting/user/transfers/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // If it's a validation error with field-specific messages, throw the full error object
        if (errorData.receiver_uid || errorData.amount || errorData.description) {
          throw new Error(JSON.stringify(errorData));
        }
        throw new Error(errorData.detail || 'Failed to send transfer');
      }

      const data: SendTransferResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Send transfer error:', error);
      throw error;
    }
  }

  // Get transfer history with filters
  async getTransfers(
    accessToken: string, 
    type: string = 'sent', 
    status: string = 'completed', 
    minAmount: string = '', 
    maxAmount: string = '', 
    dateFrom: string = '2025-03-01', 
    dateTo: string = '2025-09-30', 
    ordering: string = '-created_at'
  ): Promise<TransfersResponse> {
    try {
      const params = new URLSearchParams({
        type,
        status,
        min_amount: minAmount,
        max_amount: maxAmount,
        date_from: dateFrom,
        date_to: dateTo,
        ordering
      });

      const response = await fetch(`${this.baseUrl}/api/payments/betting/user/transfers/?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get transfers');
      }

      const data: TransfersResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Get transfers error:', error);
      throw error;
    }
  }

  // Get transfer statistics
  async getTransferStats(accessToken: string): Promise<TransferStatsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/betting/user/transfers/my_transfers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get transfer stats');
      }

      const data: TransferStatsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Get transfer stats error:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const transferService = new TransferService();
