// Transactions service for handling transaction history

export interface Transaction {
  uid: string;
  type: "deposit" | "withdrawal";
  type_display: string;
  amount: string;
  formatted_amount: string;
  recipient_phone: string;
  recipient_name: string;
  display_recipient_name: string | null;
  network: {
    uid: string;
    nom: string;
    code: string;
    country_name: string;
    country_code: string;
    image: string | null;
  };
  objet: string;
  status: "pending" | "success" | "failed" | "sent_to_user";
  status_display: string;
  reference: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  processing_duration: number | null;
  retry_count: number;
  max_retries: number;
  can_retry: boolean;
  error_message: string | null;
  processed_by_name: string;
  priority: number;
  fees: string | null;
  balance_before: string | null;
  balance_after: string | null;
  callback_url: string;
}

export interface TransactionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Transaction[];
}

class TransactionsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  }

  async getTransactions(
    accessToken: string, 
    page: number = 1, 
    limit: number = 10,
    type?: string,
    search?: string
  ): Promise<TransactionsResponse> {
    try {
      let url = `${this.baseUrl}/api/payments/user/transactions/?page=${page}&limit=${limit}`;
      if (type && type !== "all") {
        url += `&type=${encodeURIComponent(type)}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get transactions');
      }

      const data: TransactionsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const transactionsService = new TransactionsService();
