### Blaffa Pay Partner – App Overview

This document inventories the app’s architecture, API integrations, features (pages, buttons, logic), and the user app flow, to help you reuse it in another project.


### Tech stack
- **Framework**: Next.js 14 (App Router) with React 18
- **Mobile**: Capacitor (`@capacitor/android`, `@capacitor/app`)
- **UI**: Tailwind CSS v4, Radix UI, `lucide-react`
- **State/Providers**: Custom context providers in `lib/contexts.tsx`
- **Analytics**: Vercel Analytics


### High-level architecture
- Root layout `app/layout.tsx` wraps the app with:
  - `ThemeProvider`, `LanguageProvider`, `AuthProvider` from `lib/contexts.tsx`
  - Injects a small script to capture Android hardware back events
- Entry screen `app/page.tsx` implements a mobile-first single-screen router via React state:
  - Maintains `currentScreen` and a `navigationHistory` stack
  - Wires button-driven navigation and guards (permissions)
  - Hooks into hardware back via `lib/mobile-back-button.ts`


### Key directories
- `app/` – Next.js app shell (`layout.tsx`, `page.tsx`, `globals.css`)
- `components/` – Feature screens and UI primitives
- `lib/` – Services (API), contexts, utilities, translations, mobile back handler
- `hooks/` – Reusable hooks (`use-mobile.ts`, `use-toast.ts`)


### Context providers and hooks
- `useAuth` from `lib/contexts.tsx` exposes:
  - State: `user`, `accountData`, `transactions`, `networks`, `recharges`, `isAuthenticated`, `isLoading`
  - Actions: `login`, `logout`, `refreshToken`, `refreshAccountData`, `refreshTransactions`, `refreshNetworks`, `refreshRecharges`, `createTransaction`, `createRecharge`
- `useTheme` – theme state with system sync (light/dark)
- `useLanguage`/`useTranslation` – English/French i18n via `lib/translations.ts`


### Screens (components)
- Auth: `login-screen.tsx`
- Dashboard: `dashboard-screen.tsx`
- Account operations: `deposit-screen.tsx`, `withdraw-screen.tsx`, `transaction-history-screen.tsx`, `transaction-details-modal.tsx`
- Recharges: `recharge-screen.tsx`, `recharge-history-screen.tsx`
- Transfers: `transfer-screen.tsx`, `transfer-history-screen.tsx`
- Betting: `betting-platforms-screen.tsx`, `betting-deposit-screen.tsx`, `betting-withdraw-screen.tsx`, `betting-transactions-screen.tsx`, `betting-commissions-screen.tsx`
- Settings/profile: `settings-screen.tsx`, `profile-screen.tsx`
- Other: `notification-screen.tsx`, `permission-denied-screen.tsx`, `splash-screen.tsx`, `error-boundary.tsx`, `theme-provider.tsx`


### API base and auth
- Base URL: `process.env.NEXT_PUBLIC_API_BASE_URL` (fallback `http://localhost:8000`)
- Auth tokens are stored in `localStorage` and auto-refreshed


### API integrations (services under `lib/`)
- Auth (`lib/auth.ts`)
  - POST `/api/auth/login/` → `{ access, refresh, user }`
  - POST `/api/auth/token/refresh/`
  - GET `/api/auth/profile/`
- Account (`lib/account.ts`)
  - GET `/api/payments/user/account/`
- Transactions (`lib/transactions.ts`)
  - GET `/api/payments/user/transactions/?page={n}&limit={n}`
- Create Transaction (`lib/create-transaction.ts`)
  - POST `/api/payments/user/transactions/` with `{ type, amount, recipient_phone, network }`
- Networks (`lib/networks.ts`)
  - GET `/api/payments/networks/`
- Recharges (`lib/recharge.ts`)
  - GET `/api/payments/user/recharges/?page={n}&limit={n}`
  - POST `/api/payments/user/recharges/` (FormData: `amount`, optional `proof_image`, `proof_description`, `transaction_date`)
- Transfers (`lib/transfers.ts`)
  - GET `/api/auth/users/search/?search={q}`
  - POST `/api/payments/betting/user/transfers/`
  - GET `/api/payments/betting/user/transfers/?{type,status,min_amount,max_amount,date_from,date_to,ordering}`
  - GET `/api/payments/betting/user/transfers/my_transfers`
- Betting (`lib/betting.ts`)
  - GET `/api/payments/betting/user/platforms/`
  - GET `/api/payments/betting/user/platforms/{platformUid}/`
  - GET `/api/payments/betting/user/platforms/platforms_with_permissions/`
  - GET `/api/payments/betting/user/platforms/platforms_with_stats/`
  - GET `/api/payments/betting/user/transactions/my_transactions/?{status,transaction_type,platform,ordering,page}`
  - POST `/api/payments/betting/user/transactions/create_deposit/`
  - POST `/api/payments/betting/user/transactions/create_withdrawal/`
  - GET `/api/payments/betting/user/commissions/my_stats/?{date_from,date_to}`
  - GET `/api/payments/betting/user/commissions/unpaid_commissions/`
  - GET `/api/payments/betting/user/commissions/current_rates/`
  - GET `/api/payments/betting/user/commissions/payment_history/?limit={n}`
  - POST `/api/payments/betting/user/transactions/verify_user_id/`
  - External data: GET `https://api.blaffa.net/blaffa/app_name`
- Error handling helper: `lib/error-utils.ts` (parses field errors and formats messages)


### Permission model
- `user` flags: `can_use_momo_pay`, `can_use_mobcash_betting`, `can_use_transfer`, `can_process_ussd_transaction`
- USSD-sensitive flows (Deposit, Withdraw, Transaction History) check `can_process_ussd_transaction`; otherwise route to `permission-denied-screen`


### Pull-to-refresh (drag down screen refresh)
- Implementation: Custom pull-to-refresh across multiple screens
- Screens with pull-to-refresh:
  - `dashboard-screen.tsx` - Refreshes account data, transactions, recharges, and recent history
  - `deposit-screen.tsx` - Visual refresh indicator (no API call, placeholder)
  - `withdraw-screen.tsx` - Visual refresh indicator (no API call, placeholder)
  - `recharge-screen.tsx` - Visual refresh indicator (no API call, placeholder)
  - `transaction-history-screen.tsx` - Refreshes transaction list
  - `recharge-history-screen.tsx` - Refreshes recharge list
  - `transfer-screen.tsx` - Visual refresh indicator (no API call, placeholder)
- State management:
  ```typescript
  const [pullToRefreshState, setPullToRefreshState] = useState({
    isPulling: false,      // Whether user is actively pulling
    pullDistance: 0,       // Distance pulled in pixels
    isRefreshing: false,   // Whether refresh is in progress
    startY: 0,             // Initial touch Y position
    currentY: 0,           // Current touch Y position
    canPull: true          // Whether pull-to-refresh is enabled
  })
  ```
- Touch event handlers:
  - `handleTouchStart`: Captures initial touch position when scroll is at top
  - `handleTouchMove`: 
    - Only active when `scrollTop === 0` (at top of page)
    - Calculates pull distance from start position
    - Max distance: 120px (prevents over-pulling)
    - Sets `isPulling: true` when distance > 10px
    - Prevents default scroll when pulling down
  - `handleTouchEnd`: 
    - Triggers refresh if `pullDistance >= 80px` (refreshThreshold)
    - Otherwise resets state and bounces back
- Visual indicator:
  - Fixed position at top center (`fixed top-4 left-1/2`)
  - Shows `RefreshCw` icon with spinning animation when refreshing
  - Themed styling (dark/light) with backdrop blur
  - Only visible when `isPulling || isRefreshing` is true
- Transform effect:
  - Container uses `transform: translateY(${pullDistance}px)` for visual feedback
  - Transition animation when releasing (smooth bounce back)
  - No transition during active pulling for responsive feel
- Scroll position detection:
  - `useEffect` listener on scroll events
  - Resets `canPull: true` when scroll returns to top
  - Prevents pull-to-refresh when scrolled down
- Refresh actions (screen-specific):
  - Dashboard: `Promise.all([refreshAccountData(), refreshTransactions(), refreshRecharges(), loadRecentHistory()])`
  - Transaction History: `refreshTransactions()`
  - Recharge History: `refreshRecharges()`
  - Other screens: Placeholder timeout (1 second) - ready for API integration
- Constants:
  - `refreshThreshold`: 80px (minimum pull to trigger refresh)
  - `maxPullDistance`: 120px (maximum visual pull distance)
  - `pullingThreshold`: 10px (minimum to show as "pulling")


### Dashboard activities dropdown menu
- Location: `components/dashboard-screen.tsx` (lines 1108-1191)
- Trigger: `MoreHorizontal` icon button next to "Activité récente" header
- Behavior: Toggles `showDropdown` state; closes on outside click via `dropdownRef` and click handler
- Menu options:
  1) "Historique des Transactions" → `onNavigateToTransactionHistory()` (History icon)
  2) "Historique des Recharges" → `onNavigateToRechargeHistory()` (Battery icon)
  3) "Historique des transferts" → `onNavigateToTransferHistory()` (Send icon)
  4) "Transactions de Paris" → `onNavigateToBettingTransactions()` (Activity icon)
- UI: Themed dropdown (dark/light), backdrop blur, positioned absolute right/top-10, z-50, rounded-2xl
- Recent Activity List:
  - Unified history from multiple sources (transactions, betting, recharges, transfers)
  - Items show: type icon, recipient/partner name, type badge, date, status, reference with copy button, amount
  - Clicking an item opens `TransactionDetailsModal` with full details
  - Data fetched via `loadRecentHistory()` which combines:
    - Account transactions (first 3)
    - Betting transactions (first 3)
    - Recharges (first 3)
    - Transfers (first 3)
  - Sorted by date (newest first), limited to top 5 items
  - Each item has `historyType` indicator: `'transaction'`, `'betting'`, `'recharge'`, `'transfer'`


### App flow (end-to-end)
1) Launch → `SplashScreen`
- `app/page.tsx` starts at `currentScreen = "splash"`
- On completion (`onComplete`), proceed to auth check

2) Auth check (in `AuthProvider`)
- If tokens in `localStorage`, validate via `GET /api/auth/profile/`
- If valid: fetch account, transactions, networks, recharges → set `isAuthenticated = true`
- If invalid or absent: logout and show `LoginScreen`

3) Login
- `login(identifier, password)` → POST `/api/auth/login/`
- Store tokens, fetch profile and initial datasets
- Navigate to `DashboardScreen`

4) Dashboard
- Primary actions (buttons):
  - Deposit → `deposit-screen`
  - Withdraw → `withdraw-screen`
  - Recharge → `recharge-screen`
  - Transfer → `transfer-screen`
  - Transaction History → `transaction-history-screen`
  - Recharge History → `recharge-history-screen`
  - Betting → Platforms / Transactions / Commissions
  - Settings → `settings-screen` → Profile or Logout
  - Notifications → `notification-screen`
- Certain routes gated by `can_process_ussd_transaction`

5) Feature flows
- Deposit/Withdraw (account): use `create-transaction.ts` and `networks.ts`
- Recharge: `recharge.ts` (create with FormData) + history listing
- Transfers: `transfers.ts` (search users, send transfer, list, stats)
- Betting: `betting.ts` (platforms, details, verify user ID, create deposit/withdrawal, transactions, commissions, rates)

6) Navigation model
- `currentScreen` string union controls which screen renders
- `navigationHistory` array enables back navigation
- Hardware back: `lib/mobile-back-button.ts` captures `backbutton`/`popstate` and invokes `navigateBack()`
- If no history and not on `dashboard/login`, fallback to `dashboard`

7) Logout
- Clears tokens, timers, and context state → navigate to `login`


### What to copy to another project
- Providers and shell: wrap your root with `ThemeProvider`, `LanguageProvider`, `AuthProvider`
- Services in `lib/*.ts`: set `NEXT_PUBLIC_API_BASE_URL`
- Screens from `components/*-screen.tsx` as needed
- Mobile back logic: inline script in `app/layout.tsx` + `lib/mobile-back-button.ts`
- Styling: Tailwind setup, `app/globals.css`, Radix UI, `lucide-react`


### Environment
- Required: `NEXT_PUBLIC_API_BASE_URL=https://your-backend`


### How to add native Android back button to another project

This app implements a complete Android hardware back button handler that can be adapted to any React/Next.js project. Here's how:

#### Step 1: Create the Mobile Back Button Handler
Copy `lib/mobile-back-button.ts` to your project:

```typescript
export class MobileBackButtonHandler {
  private static instance: MobileBackButtonHandler
  private isInitialized = false
  private backButtonCallback?: () => void
  private eventListeners: Array<{ element: EventTarget; event: string; handler: EventListener }> = []

  private constructor() {}

  static getInstance(): MobileBackButtonHandler {
    if (!MobileBackButtonHandler.instance) {
      MobileBackButtonHandler.instance = new MobileBackButtonHandler()
    }
    return MobileBackButtonHandler.instance
  }

  initialize(callback: () => void) {
    if (this.isInitialized) return
    this.backButtonCallback = callback

    const handleBackButton = () => {
      if (this.backButtonCallback) {
        this.backButtonCallback()
      }
    }

    const events = [
      { element: document, event: 'backbutton', handler: (e: Event) => { e.preventDefault(); handleBackButton() } },
      { element: window, event: 'backbutton', handler: (e: Event) => { e.preventDefault(); handleBackButton() } },
      { element: window, event: 'popstate', handler: (e: Event) => { e.preventDefault(); handleBackButton() } },
      { element: window, event: 'mobileBackButton', handler: handleBackButton }
    ]

    events.forEach(({ element, event, handler }) => {
      element.addEventListener(event, handler, false)
      this.eventListeners.push({ element, event, handler })
    })

    this.isInitialized = true
  }

  setCallback(callback: () => void) {
    this.backButtonCallback = callback
  }

  cleanup() {
    if (this.isInitialized) {
      this.eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler)
      })
      this.eventListeners = []
      this.isInitialized = false
    }
  }
}

export const mobileBackButtonHandler = MobileBackButtonHandler.getInstance()
```

#### Step 2: Add the JavaScript Event Bridge Script
Add this script to your root HTML layout (Next.js `app/layout.tsx` or `_document.tsx` in Pages Router):

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        let isHandlingBackButton = false;
        
        function handleBackButton() {
          if (isHandlingBackButton) return;
          isHandlingBackButton = true;
          
          // Dispatch custom event for React to handle
          window.dispatchEvent(new CustomEvent('mobileBackButton'));
          
          setTimeout(() => {
            isHandlingBackButton = false;
          }, 300);
        }
        
        // Listen for various back button events
        document.addEventListener('backbutton', function(e) {
          e.preventDefault();
          handleBackButton();
        }, false);
        
        window.addEventListener('backbutton', function(e) {
          e.preventDefault();
          handleBackButton();
        }, false);
        
        // Listen for browser back button
        window.addEventListener('popstate', function(e) {
          e.preventDefault();
          handleBackButton();
        });
        
        // Initialize history state
        if (window.history.state === null) {
          window.history.replaceState({screen: 'app'}, '', window.location.href);
        }
      })();
    `,
  }}
/>
```

#### Step 3: Use in Your React Components
In your main navigation component (or any component that needs back button handling):

```typescript
import { useEffect } from 'react'
import { mobileBackButtonHandler } from '@/lib/mobile-back-button'

function YourComponent() {
  const [currentView, setCurrentView] = useState('home')
  const [navigationHistory, setNavigationHistory] = useState<string[]>([])

  const navigateBack = () => {
    if (navigationHistory.length > 0) {
      const previousView = navigationHistory[navigationHistory.length - 1]
      setNavigationHistory(prev => prev.slice(0, -1))
      setCurrentView(previousView)
    } else {
      // Fallback behavior (e.g., go to home, show exit dialog, etc.)
      setCurrentView('home')
    }
  }

  useEffect(() => {
    const handleBackButton = () => {
      if (navigationHistory.length > 0) {
        navigateBack()
      } else if (currentView !== 'home' && currentView !== 'login') {
        setCurrentView('home')
        setNavigationHistory(['home'])
      }
      // If on home/login with no history, do nothing (or show exit confirmation)
    }

    // Initialize mobile back button handler
    mobileBackButtonHandler.initialize(handleBackButton)

    // Cleanup on unmount
    return () => {
      mobileBackButtonHandler.cleanup()
    }
  }, [navigationHistory, currentView])

  // Your navigation logic
  const navigateToScreen = (screen: string) => {
    setNavigationHistory(prev => [...prev, currentView])
    setCurrentView(screen)
  }

  return (
    // Your component JSX
  )
}
```

#### Step 4: For Capacitor Apps (Optional but Recommended)
If using Capacitor for native Android:

1. Install Capacitor App plugin:
   ```bash
   npm install @capacitor/app
   ```

2. Configure in `capacitor.config.ts`:
   ```typescript
   import { CapacitorConfig } from '@capacitor/cli';

   const config: CapacitorConfig = {
     appId: 'com.your.app',
     appName: 'Your App',
     webDir: 'out',
     plugins: {
       App: {
         backButtonAndroidExitOnLast: false // Let your app handle back button
       }
     }
   };
   ```

3. Use Capacitor's back button listener (alternative approach):
   ```typescript
   import { App } from '@capacitor/app'

   useEffect(() => {
     const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
       if (!canGoBack) {
         // Handle back button - use your navigation logic
         handleBackButton()
       }
     })

     return () => {
       backButtonListener.remove()
     }
   }, [])
   ```

#### Key Points:
1. Event listeners: Handles multiple event types (`backbutton`, `popstate`, custom `mobileBackButton`)
2. Singleton pattern: One handler instance manages all listeners
3. Debouncing: 300ms debounce prevents double-triggers
4. Cleanup: Properly removes listeners on component unmount
5. History management: Maintains navigation stack for proper back navigation
6. Browser compatibility: Also handles browser back button via `popstate`

#### Testing:
- Test on real Android device (hardware back button)
- Test in Android emulator
- Test browser back button behavior
- Test with Capacitor if using it
- Test navigation stack edge cases (empty history, root screens)

This implementation works for:
- Pure web apps (handles browser back button)
- Capacitor/Cordova hybrid apps (handles native back button)
- React Native Web (with slight modifications)
- Any React/Next.js mobile app


### Deposit and Withdraw screens – UI and logic
- Location: `components/deposit-screen.tsx`, `components/withdraw-screen.tsx`
- Shared flow:
  - Step 1: Network selection (from `useAuth().networks`, filters `is_active`)
  - Step 2: Transaction form with recipient phone and amount
  - Pressing primary button opens a confirmation modal; confirming executes API call
  - Success modal appears; screen auto-navigates back after ~2.5s
  - Pull‑to‑refresh UI on mobile (visual only by default)
- Validation:
  - Amount must be numeric, > 0, min 100 FCFA, max 1,000,000 FCFA
  - Withdraw also validates against `accountData.balance` (must not exceed)
  - All fields required: amount, recipient phone, network
- API call (via `useAuth().createTransaction` → `lib/create-transaction.ts`):
  - Deposit payload: `{ type: "deposit", amount, recipient_phone, network }`
  - Withdraw payload: `{ type: "withdrawal", amount, recipient_phone, network }`
  - On success: refreshes transactions and account balance (handled in context)
  - Errors: parsed via `parseBackendError` + `formatErrorMessage`, shown via `ErrorAlert`
- UI details:
  - Amount entry formats thousands with spaces while typing
  - FCFA suffix, range hints, and error states
  - Selected network chip with quick “Changer” action
  - Theming (light/dark), mobile‑first layout, safe-area padding, animated feedback

#### Confirmation modal contract
- Component: `components/ui/transaction-confirmation-modal`
- Props: `isOpen`, `onClose`, `onConfirm`, `transactionData`
- `transactionData` shape used here:
  - `{ type: 'deposit' | 'withdrawal', amount: string, recipientPhone: string, selectedNetwork?: { uid, nom, code } }`


### Transaction Details Modal – bottom sheet modal
- Location: `components/transaction-details-modal.tsx`
- Layout: Bottom sheet modal covering bottom half of screen (50vh height)
- Implementation: Uses React Portal (`createPortal`) to render at `document.body` level
- Positioning: 
  - `fixed bottom-0 left-0 right-0`
  - Height: `h-[50vh]` (50% of viewport height)
  - Width: `w-full` (full width)
  - Rounded top corners: `rounded-t-2xl`
  - Shadow: `shadow-2xl`
  - Z-index: `z-50` (above backdrop at `z-40`)
- Backdrop:
  - `fixed inset-0 bg-black/50 backdrop-blur-sm z-40`
  - Clicking backdrop triggers `onClose`
- Drag handle:
  - Small gray bar at top (`w-10 h-1 rounded-full`) for visual indication of draggable bottom sheet
- Entry/Exit animation:
  - Transform: `translate-y-0` when open, `translate-y-full` when closed
  - Opacity: `opacity-100` when open, `opacity-0` when closed
  - Transition: `transition-all duration-500 ease-out`
- Scroll behavior:
  - Content area: `overflow-y-auto` with `max-h-[75vh]` for inner content
  - Fixed header, scrollable body
- Props: `isOpen`, `onClose`, `transaction`
- Auto-detects history type using `transaction.historyType`:
  - `transaction` (account): uses `type` (`deposit`|`withdrawal`), `amount`, `status` etc.
  - `betting`: uses `transaction_type` (deposit/withdrawal), adds betting fields
  - `recharge`: shows amount as positive
  - `transfer`: shows amount as negative
- Core sections shown when available:
  - Recipient: `recipient_name` or `display_recipient_name`, and `recipient_phone`
  - Amount: formatted with sign and FCFA, color-coded per type
  - Status: icon + label mapping (`success/completed/sent_to_user/pending/failed`)
  - Reference: value with copy button (uses clipboard + toast)
  - Date: `created_at` humanized; optionally `started_at`, `completed_at`, `updated_at`
  - Network: `network.nom`, `network.code`, `network.country_name`
  - Processing details: retries, max retries, can/cannot retry, error_message
  - Balance changes: `balance_before`, `balance_after` (formatted)
  - Callback: `callback_url`
  - Betting extras: `betting_user_id`, `withdrawal_code`, `external_transaction_id`, `commission_rate`, `commission_amount`, `commission_paid(_at)`, partner balances, cancellation info
- Visuals: Themed bottom sheet, draggable handle, compact typography, copy-to-clipboard feedback via `useToast`


### App flow additions (Deposit/Withdraw + details modal)
1) From `DashboardScreen` choose Deposit or Withdraw
2) Select Network → enter Recipient Phone and Amount
3) Press primary button → Confirmation Modal → Confirm
4) On confirm → `createTransaction` POSTs to `/api/payments/user/transactions/`
5) On success → Success modal, then auto‑navigate back; context refresh updates dashboard and histories
6) Anywhere transactions are listed → tap a row → `TransactionDetailsModal` opens with full detail


### Transaction Type selection – routing between Mobile Money and Betting
- Location: `components/transaction-type-selection-screen.tsx`
- Purpose: Let the user choose the mode for a Deposit/Withdraw action.
- Props:
  - `transactionType`: `'deposit' | 'withdraw'` (drives labels and descriptions)
  - `onNavigateBack`: back navigation
  - `onSelectMobileMoney`: callback to go to Mobile Money flows (Deposit/Withdraw screens)
  - `onSelectBetting`: callback to go to Betting flows (e.g., `betting-platforms-screen` then deposit/withdraw)
  - `user?`: optional `User` to evaluate permission flags
- Permission gating:
  - Mobile Money option shows only if `user.can_use_momo_pay !== false` AND `user.can_process_ussd_transaction !== false`
  - Betting option shows only if `user.can_use_mobcash_betting !== false`
  - If none available, shows an informational “Aucune option disponible” card with the reason
- Visuals: two large cards (Mobile Money, MobCash/Betting), themed, with short feature chips; includes an information card tailored to deposit vs withdraw
- Integration into app flow:
  - From dashboard, for a generic “transaction” entry point, navigate to this selection
  - On select Mobile Money → go to `deposit-screen` or `withdraw-screen`
  - On select Betting → go to `betting-platforms-screen` with the intended transaction type context


### Betting system – features, flows, and APIs
- Primary files:
  - Screens: `betting-platforms-screen.tsx`, `betting-deposit-screen.tsx`, `betting-withdraw-screen.tsx`, `betting-transactions-screen.tsx`, `betting-commissions-screen.tsx`
  - Service: `lib/betting.ts`
- Permissions and visibility:
  - Feature access generally requires `user.can_use_mobcash_betting !== false`
  - The app may gate certain betting actions (deposit/withdraw) with platform-level permissions via endpoints like `platforms_with_permissions`
- Core flows:
  1) Platforms list and details
     - List authorized betting platforms and stats
       - GET `/api/payments/betting/user/platforms/`
       - GET `/api/payments/betting/user/platforms/platforms_with_permissions/`
       - GET `/api/payments/betting/user/platforms/platforms_with_stats/`
     - Platform details for a selected platform
       - GET `/api/payments/betting/user/platforms/{platformUid}/`
  2) Verify betting user ID (pre-check)
     - POST `/api/payments/betting/user/transactions/verify_user_id/`
     - Payload: `{ platform_uid, betting_user_id }`
     - Response indicates validity (`UserId !== 0`)
  3) Create betting deposit / withdrawal
     - POST deposit: `/api/payments/betting/user/transactions/create_deposit/`
       - Payload: `{ platform_uid, betting_user_id, amount }`
     - POST withdrawal: `/api/payments/betting/user/transactions/create_withdrawal/`
       - Payload: `{ platform_uid, betting_user_id, withdrawal_code }`
     - Errors are parsed via `error-utils` for user-friendly messages
  4) Betting transactions list and filters
     - GET `/api/payments/betting/user/transactions/my_transactions/?status&transaction_type&platform&ordering&page`
     - Supports filtering by status, type (deposit/withdrawal), platform, ordering, and paging
  5) Commissions
     - Stats over a period: GET `/api/payments/betting/user/commissions/my_stats/?date_from&date_to`
     - Unpaid commissions: GET `/api/payments/betting/user/commissions/unpaid_commissions/`
     - Current rates: GET `/api/payments/betting/user/commissions/current_rates/`
     - Payment history: GET `/api/payments/betting/user/commissions/payment_history/?limit={n}`
  6) External public data (platform images and addresses)
     - GET `https://api.blaffa.net/blaffa/app_name` (no auth)
     - Returns array of `ExternalPlatformData` with fields:
       - `id`: matches internal platform's `external_id` for merging
       - `image`: URL string for platform logo/image
       - `city`: string
       - `street`: string
       - Plus other metadata (`name`, `public_name`, `deposit_tuto_content`, etc.)
     - Merging logic:
       - In `betting-platforms-screen.tsx`, `betting-deposit-screen.tsx`, `betting-withdraw-screen.tsx`:
         1. Load internal platform data from authenticated endpoints
         2. Load external data via `getExternalPlatformData()`
         3. Match by `external_id === externalData.id`
         4. Merge: `{ ...platform, city, street, external_image }`
       - External data fetch is non-blocking; app continues if it fails
     - Image resolution priority (highest to lowest):
       1. `platform.external_image` (from external API)
       2. `${NEXT_PUBLIC_API_BASE_URL}${platform.logo}` (from internal API; logo is a relative path)
       3. Fallback: themed gradient icon (`Gamepad2` icon)
     - Address display:
       - City and street shown in platform cards (when available)
       - Format: "Ville: {city}" and "Rue: {street}"
       - Displayed in both authorized and unauthorized platform lists
       - Also shown in betting deposit/withdraw screens when platform is selected
- Screen-specific behaviors:
  - `betting-platforms-screen.tsx`
    - Shows authorized vs unauthorized platforms (permissions view)
    - From this screen, user chooses a platform for the intended operation
    - Integrates with `bettingTransactionType` context from `app/page.tsx` to route to deposit or withdraw
  - `betting-deposit-screen.tsx`
    - Inputs: platform selection (from prior screen), `betting_user_id`, `amount`
    - Optional pre-check: verify user ID via `verify_user_id`
    - On confirm: calls `createDeposit`
    - Shows feedback and success state; returns to previous screen after success
  - `betting-withdraw-screen.tsx`
    - Inputs: platform selection, `betting_user_id`, `withdrawal_code`
    - On confirm: calls `createWithdrawal`
    - Shows feedback and success state; returns after success
  - `betting-transactions-screen.tsx`
    - Lists all betting transactions with filters (status/type/platform), paging, and ordering
    - Row click opens `TransactionDetailsModal` with betting-specific fields (commission, external ids, cancellation info)
  - `betting-commissions-screen.tsx`
    - Displays commission summary, unpaid commissions, and current rates
    - May link to payment history details
- Error handling and UX:
  - All API errors run through `parseBackendError` and `formatErrorMessage` for clean messages
  - Inputs are validated and confirmed via modals where applicable
  - Theming and mobile-first design throughout
- App-level routing related to betting (in `app/page.tsx`):
  - Dashboard → Betting Platforms, Betting Transactions, Betting Commissions, or direct Betting Deposit/Withdraw
  - When navigating to Platforms for a specific operation, `bettingTransactionType` is set and used to continue to deposit/withdraw for the chosen platform
