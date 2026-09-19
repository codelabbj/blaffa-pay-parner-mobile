import { type User } from './auth'
import { type AccountData } from './account'
import { type Network } from './networks'
import { type Transfer } from './transfers'
import { type Transaction } from './transactions'
import { type RechargeData } from './recharge'

export type PartnerV2ActivitySource = 'transaction' | 'transfer' | 'betting' | 'recharge' | 'bulk'

export interface PartnerV2ActivityItem {
  uid: string
  source: PartnerV2ActivitySource
  reference: string
  amount: string
  status: string
  status_display?: string
  created_at: string
  title: string
  subtitle: string
  label: string
  direction: 'in' | 'out'
  type?: string
  transaction_type?: string
  recipient_phone?: string
  recipient_name?: string
  display_recipient_name?: string
  receiver_name?: string
  receiver_email?: string
  sender_email?: string
  isTransferReceived?: boolean
  partner_name?: string
  platform_name?: string
  betting_user_id?: string
  total_count?: number
}

export interface PartnerV2BootstrapResponse {
  user: User
  account: AccountData
  activity: PartnerV2ActivityItem[]
}

export interface PartnerV2PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
}

async function authorizedGet(path: string, accessToken: string): Promise<Response> {
  return fetch(`${getBaseUrl()}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
}

class PartnerV2Service {
  async getBootstrap(accessToken: string): Promise<PartnerV2BootstrapResponse> {
    const response = await authorizedGet('/api/v2/partner/bootstrap/', accessToken)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to load partner bootstrap')
    }
    return response.json()
  }

  async getActivity(accessToken: string, limit: number = 10): Promise<PartnerV2ActivityItem[]> {
    const response = await authorizedGet(`/api/v2/partner/activity/?limit=${limit}`, accessToken)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to load activity')
    }
    const data = await response.json()
    return data.results || []
  }

  async getTransfers(
    accessToken: string,
    filters: {
      type?: string
      status?: string
      minAmount?: string
      maxAmount?: string
      dateFrom?: string
      dateTo?: string
      search?: string
      page?: number
      pageSize?: number
    } = {}
  ): Promise<PartnerV2PaginatedResponse<Transfer>> {
    const params = new URLSearchParams()
    if (filters.type) params.append('type', filters.type)
    if (filters.status) params.append('status', filters.status)
    if (filters.minAmount) params.append('min_amount', filters.minAmount)
    if (filters.maxAmount) params.append('max_amount', filters.maxAmount)
    if (filters.dateFrom) params.append('date_from', filters.dateFrom)
    if (filters.dateTo) params.append('date_to', filters.dateTo)
    if (filters.search) params.append('search', filters.search)
    params.append('page', String(filters.page || 1))
    params.append('page_size', String(filters.pageSize || 20))

    const response = await authorizedGet(`/api/v2/partner/transfers/?${params.toString()}`, accessToken)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to get transfers')
    }
    return response.json()
  }

  async getTransactions(
    accessToken: string,
    page: number = 1,
    pageSize: number = 20,
    type?: string,
    search?: string
  ): Promise<PartnerV2PaginatedResponse<Transaction>> {
    const params = new URLSearchParams()
    params.append('page', String(page))
    params.append('page_size', String(pageSize))
    if (type && type !== 'all') params.append('type', type)
    if (search) params.append('search', search)
    const response = await authorizedGet(`/api/v2/partner/transactions/?${params.toString()}`, accessToken)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to get transactions')
    }
    return response.json()
  }

  async getRecharges(
    accessToken: string,
    page: number = 1,
    pageSize: number = 20,
    status?: string,
    search?: string
  ): Promise<PartnerV2PaginatedResponse<RechargeData>> {
    const params = new URLSearchParams()
    params.append('page', String(page))
    params.append('page_size', String(pageSize))
    if (status && status !== 'all') params.append('status', status)
    if (search) params.append('search', search)
    const response = await authorizedGet(`/api/v2/partner/recharges/?${params.toString()}`, accessToken)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to get recharges')
    }
    return response.json()
  }

  async getNetworks(accessToken: string): Promise<PartnerV2PaginatedResponse<Network>> {
    const response = await authorizedGet('/api/v2/partner/networks/', accessToken)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to get networks')
    }
    return response.json()
  }
}

export const partnerV2Service = new PartnerV2Service()
