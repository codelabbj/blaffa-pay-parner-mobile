import { parseBackendError, formatErrorMessage } from './error-utils'

export interface BulkNetwork {
    uid: string;
    nom: string;
    code: string;
    country: string;
    image?: string | null;
    min_montant?: number;
    max_montant?: number;
}

export interface BulkAuthorizedNetworksResponse {
    success: boolean;
    restricted: boolean;
    count: number;
    networks: BulkNetwork[];
}

export interface BulkTransaction {
    amount: string;
    recipient_phone: string;
    network: string; // Network Unique ID
    objet: string;
    external_id: string | null;
}

export interface BulkPaymentSubmission {
    transactions: BulkTransaction[];
}

export interface BulkHistoryItem {
    uid: string;
    status: string;
    total_count: number;
    succeeded_count: number;
    failed_count: number;
    processed_count: number;
    total_amount: string;
    succeeded_amount: string;
    progress_percent: number;
    is_finished: boolean;
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
}

export interface BulkHistoryResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: BulkHistoryItem[];
}

class BulkPaymentService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    }

    async getAuthorizedNetworks(accessToken: string): Promise<BulkAuthorizedNetworksResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/payments/user/transactions/bulk-deposit/networks/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                const parsedError = parseBackendError(errorData);
                throw new Error(formatErrorMessage(parsedError));
            }

            return await response.json();
        } catch (error) {
            console.error('Get bulk networks error:', error);
            throw error;
        }
    }

    async getBulkHistory(accessToken: string, params: {
        page?: number;
        page_size?: number;
        status?: string;
        network?: string;
        date_from?: string;
        date_to?: string;
    }): Promise<BulkHistoryResponse> {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.page_size) queryParams.append('page_size', params.page_size.toString());
            if (params.status) queryParams.append('status', params.status);
            if (params.network) queryParams.append('network', params.network);
            if (params.date_from) queryParams.append('date_from', params.date_from);
            if (params.date_to) queryParams.append('date_to', params.date_to);

            const response = await fetch(`${this.baseUrl}/api/payments/user/transactions/bulk-deposit/list/?${queryParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                const parsedError = parseBackendError(errorData);
                throw new Error(formatErrorMessage(parsedError));
            }

            return await response.json();
        } catch (error) {
            console.error('Get bulk history error:', error);
            throw error;
        }
    }

    async submitBulkPayment(accessToken: string, payload: BulkPaymentSubmission): Promise<{ message: string; batch_id: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/api/payments/user/transactions/bulk-deposit/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                const parsedError = parseBackendError(data);
                throw new Error(formatErrorMessage(parsedError));
            }

            return data;
        } catch (error) {
            console.error('Submit bulk payment error:', error);
            throw error;
        }
    }
}

export const bulkPaymentService = new BulkPaymentService();
