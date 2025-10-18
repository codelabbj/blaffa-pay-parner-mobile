// Betting service for handling betting platform operations

import { parseBackendError, formatErrorMessage } from './error-utils'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

// ========== Interfaces ==========

export interface BettingPlatform {
  uid: string
  name: string
  logo: string | null
  is_active: boolean
  external_id: string
  min_deposit_amount: string
  max_deposit_amount: string
  min_withdrawal_amount: string
  max_withdrawal_amount: string
  description?: string
  can_deposit?: boolean
  can_withdraw?: boolean
  permission_is_active?: boolean
  granted_by_name?: string | null
  permission_granted_at?: string | null
  city?: string
  street?: string
  external_image?: string
}

export interface BettingPlatformWithStats extends BettingPlatform {
  my_stats: {
    total_transactions: number
    successful_transactions: number
    total_amount: number
    total_commission: number
    unpaid_commission: number
  }
}

export interface PlatformsWithPermissionsResponse {
  total_platforms: number
  authorized_count: number
  unauthorized_count: number
  authorized_platforms: BettingPlatform[]
  unauthorized_platforms: BettingPlatform[]
  all_platforms: BettingPlatform[]
}

export interface PlatformsWithStatsResponse {
  summary: {
    total_platforms: number
    authorized_count: number
    unauthorized_count: number
    platforms_with_transactions: number
  }
  authorized_platforms: BettingPlatformWithStats[]
  unauthorized_platforms: BettingPlatformWithStats[]
}

export interface BettingTransaction {
  uid: string
  reference: string
  partner_name: string
  platform_name: string
  transaction_type: 'deposit' | 'withdrawal'
  amount: string
  status: 'success' | 'pending' | 'failed' | 'cancelled'
  betting_user_id: string
  withdrawal_code: string | null
  external_transaction_id: string | null
  commission_rate: string
  commission_paid_at: string | null
  commission_amount: string
  commission_paid: boolean
  created_at: string
  external_response: any
  cancellation_requested_at: string | null
  cancelled_at: string | null
  partner_refunded: boolean
  partner_balance_before: string
  partner_balance_after: string
  is_cancellable?: boolean
  can_request_cancellation?: boolean
}

export interface BettingTransactionsResponse {
  count: number
  next: string | null
  previous: string | null
  results: BettingTransaction[]
}

export interface CreateDepositPayload {
  platform_uid: string
  betting_user_id: string
  amount: string
}

export interface CreateWithdrawalPayload {
  platform_uid: string
  betting_user_id: string
  withdrawal_code: string
}

export interface VerifyUserIdPayload {
  platform_uid: string
  betting_user_id: string
}

export interface VerifyUserIdResponse {
  UserId: number
  Name?: string
  CurrencyId?: number
}

export interface CommissionStats {
  total_transactions: number
  total_commission: string
  paid_commission: string
  unpaid_commission: string
  by_platform: Array<{
    platform__name: string
    count: number
    total_commission: number
    unpaid_commission: number
  }>
}

export interface UnpaidCommissionsResponse {
  total_unpaid_amount: number
  transaction_count: number
  transactions: BettingTransaction[]
}

export interface CommissionRatesResponse {
  deposit_rate: number
  withdrawal_rate: number
  last_updated: string | null
  updated_by: string | null
  message: string
}

export interface PaymentHistory {
  uid: string
  partner: number
  partner_name: string
  total_amount: string
  transaction_count: number
  paid_by: number
  paid_by_name: string
  period_start: string
  period_end: string
  notes: string
  created_at: string
}

export interface PaymentHistoryResponse {
  payment_count: number
  total_paid_amount: number
  payments: PaymentHistory[]
}

export interface ExternalPlatformData {
  id: string
  name: string
  image: string
  is_active: boolean
  order: number | null
  city: string
  street: string
  deposit_tuto_content: string
  deposit_link: string
  withdrawal_tuto_content: string
  withdrawal_link: string
  public_name: string
  minimun_deposit: number
  max_deposit: number
  minimun_with: number
  max_win: number
  why_withdrawal_fail: string | null
  enable: boolean
}

// ========== Service Functions ==========

export const bettingService = {
  // Get authorized platforms
  async getPlatforms(accessToken: string) {
    try {
      const response = await fetch(`${BASE_URL}/api/payments/betting/user/platforms/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        const parsedError = parseBackendError(errorData)
        const formattedMessage = formatErrorMessage(parsedError)
        throw new Error(formattedMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get platforms error:', error)
      throw error
    }
  },

  // Get platform details
  async getPlatformDetails(accessToken: string, platformUid: string): Promise<BettingPlatform> {
    try {
      const response = await fetch(`${BASE_URL}/api/payments/betting/user/platforms/${platformUid}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        const parsedError = parseBackendError(errorData)
        const formattedMessage = formatErrorMessage(parsedError)
        throw new Error(formattedMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get platform details error:', error)
      throw error
    }
  },

  // Get platforms with permissions
  async getPlatformsWithPermissions(accessToken: string): Promise<PlatformsWithPermissionsResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/payments/betting/user/platforms/platforms_with_permissions/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        const parsedError = parseBackendError(errorData)
        const formattedMessage = formatErrorMessage(parsedError)
        throw new Error(formattedMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get platforms with permissions error:', error)
      throw error
    }
  },

  // Get platforms with stats
  async getPlatformsWithStats(accessToken: string): Promise<PlatformsWithStatsResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/payments/betting/user/platforms/platforms_with_stats/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        const parsedError = parseBackendError(errorData)
        const formattedMessage = formatErrorMessage(parsedError)
        throw new Error(formattedMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get platforms with stats error:', error)
      throw error
    }
  },

  // Get betting transactions
  async getTransactions(
    accessToken: string,
    status?: string,
    transactionType?: string,
    platform?: string,
    ordering: string = '-created_at',
    page: number = 1
  ): Promise<BettingTransactionsResponse> {
    try {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (transactionType) params.append('transaction_type', transactionType)
      if (platform) params.append('platform', platform)
      params.append('ordering', ordering)
      params.append('page', page.toString())

      const response = await fetch(
        `${BASE_URL}/api/payments/betting/user/transactions/my_transactions/?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        const parsedError = parseBackendError(errorData)
        const formattedMessage = formatErrorMessage(parsedError)
        throw new Error(formattedMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get betting transactions error:', error)
      throw error
    }
  },


  // Create betting deposit
  async createDeposit(accessToken: string, payload: CreateDepositPayload) {
    try {
      const response = await fetch(
        `${BASE_URL}/api/payments/betting/user/transactions/create_deposit/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        const parsedError = parseBackendError(errorData)
        const formattedMessage = formatErrorMessage(parsedError)
        throw new Error(formattedMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Create deposit error:', error)
      throw error
    }
  },

  // Create betting withdrawal
  async createWithdrawal(accessToken: string, payload: CreateWithdrawalPayload) {
    try {
      const response = await fetch(
        `${BASE_URL}/api/payments/betting/user/transactions/create_withdrawal/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        const parsedError = parseBackendError(errorData)
        const formattedMessage = formatErrorMessage(parsedError)
        throw new Error(formattedMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Create withdrawal error:', error)
      throw error
    }
  },

  // Get commission stats
  async getCommissionStats(
    accessToken: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<CommissionStats> {
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)

      const response = await fetch(
        `${BASE_URL}/api/payments/betting/user/commissions/my_stats/?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        const parsedError = parseBackendError(errorData)
        const formattedMessage = formatErrorMessage(parsedError)
        throw new Error(formattedMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get commission stats error:', error)
      throw error
    }
  },

  // Get unpaid commissions
  async getUnpaidCommissions(accessToken: string): Promise<UnpaidCommissionsResponse> {
    try {
      const response = await fetch(
        `${BASE_URL}/api/payments/betting/user/commissions/unpaid_commissions/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        const parsedError = parseBackendError(errorData)
        const formattedMessage = formatErrorMessage(parsedError)
        throw new Error(formattedMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get unpaid commissions error:', error)
      throw error
    }
  },

  // Get current commission rates
  async getCurrentRates(accessToken: string): Promise<CommissionRatesResponse> {
    try {
      const response = await fetch(
        `${BASE_URL}/api/payments/betting/user/commissions/current_rates/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        const parsedError = parseBackendError(errorData)
        const formattedMessage = formatErrorMessage(parsedError)
        throw new Error(formattedMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get current rates error:', error)
      throw error
    }
  },

  // Get payment history
  async getPaymentHistory(
    accessToken: string,
    limit: number = 50
  ): Promise<PaymentHistoryResponse> {
    try {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())

      const response = await fetch(
        `${BASE_URL}/api/payments/betting/user/commissions/payment_history/?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        const parsedError = parseBackendError(errorData)
        const formattedMessage = formatErrorMessage(parsedError)
        throw new Error(formattedMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get payment history error:', error)
      throw error
    }
  },

  // Verify betting user ID
  async verifyUserId(
    accessToken: string,
    payload: VerifyUserIdPayload
  ): Promise<VerifyUserIdResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/payments/betting/user/transactions/verify_user_id/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Check if it's an invalid user ID response
        if (response.status === 200 && errorData.UserId === 0) {
          throw new Error('Invalid betting user ID')
        }
        const parsedError = parseBackendError(errorData)
        const formattedMessage = formatErrorMessage(parsedError)
        throw new Error(formattedMessage)
      }

      const data = await response.json()
      
      // Check if user ID is invalid
      if (data.UserId === 0) {
        throw new Error('Invalid betting user ID')
      }

      return data
    } catch (error) {
      console.error('Verify user ID error:', error)
      throw error
    }
  },

  // Get external platform data
  async getExternalPlatformData(): Promise<ExternalPlatformData[]> {
    try {
      const response = await fetch('https://api.blaffa.net/blaffa/app_name', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get external platform data error:', error)
      throw error
    }
  },
}

