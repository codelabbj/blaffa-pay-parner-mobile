# Betting Feature - Quick Start Guide

## 🚀 What Was Added

A complete betting platform management system with 5 new screens accessible from the sidebar.

## 📱 Access Points

### From Dashboard Sidebar:
1. Open hamburger menu (top-left avatar button)
2. Scroll to "**PLATEFORMES DE PARIS**" section
3. Choose from:
   - **Plateformes** - Manage platforms
   - **Transactions** - View history
   - **Commissions** - Track earnings

## 🎯 Main Features

### 1. Platforms Screen (`betting-platforms-screen.tsx`)
- View authorized platforms with stats
- See transaction counts and commissions
- Quick deposit/withdrawal buttons
- Platform details modal

### 2. Deposit Screen (`betting-deposit-screen.tsx`)
- Verify betting user ID
- Enter deposit amount
- Quick amount buttons (1K, 5K, 10K, etc.)
- Real-time validation

### 3. Withdrawal Screen (`betting-withdraw-screen.tsx`)
- Enter betting user ID
- Input withdrawal code
- Instant processing

### 4. Transactions Screen (`betting-transactions-screen.tsx`)
- Full transaction history
- Filters: Type (deposit/withdrawal), Status
- Search by reference/platform/ID
- Pagination

### 5. Commissions Screen (`betting-commissions-screen.tsx`)
- Total/Paid/Unpaid commissions
- Commission rates
- Per-platform breakdown
- Payment history

## 🔧 Files Modified

1. **`lib/betting.ts`** (NEW) - All betting API calls
2. **`components/dashboard-screen.tsx`** - Added navigation props
3. **`app/page.tsx`** - Added routing logic

## 💡 Key Functions

```typescript
// From betting service
bettingService.getPlatformsWithStats(accessToken)
bettingService.createDeposit(accessToken, payload)
bettingService.createWithdrawal(accessToken, payload)
bettingService.verifyUserId(accessToken, payload)
bettingService.getTransactions(accessToken, filters...)
bettingService.getCommissionStats(accessToken)
```

## 🎨 Design Highlights

- ✅ Full dark mode support
- ✅ Mobile-first responsive design
- ✅ Smooth animations
- ✅ Loading states
- ✅ Error handling with toasts
- ✅ Platform logos display
- ✅ Color-coded status

## 📝 User Workflow Example

### Making a Deposit:
```
1. Dashboard → Sidebar → Plateformes
2. Select platform (e.g., "1xBet")
3. Click "Dépôt" button
4. Enter user ID → Click "Vérifier"
5. See user name (if valid)
6. Enter amount or use quick buttons
7. Click "Continuer"
8. Review details → Click "Confirmer"
9. Success! ✅
```

## 🔍 Testing Quick Guide

### Test Deposit:
1. Go to Betting Platforms
2. Choose any authorized platform
3. Click "Dépôt"
4. Test with valid betting user ID
5. Try amounts within limits

### Test Filters:
1. Go to Betting Transactions
2. Try filtering by "Dépôts" only
3. Try filtering by "Réussi" status
4. Try searching for a reference

### Test Commissions:
1. Go to Commissions
2. Verify stats match your data
3. Check commission rates
4. Review payment history

## ⚙️ Environment Setup

Make sure your `.env` or environment has:
```bash
NEXT_PUBLIC_API_BASE_URL=your_api_url
```

## 🐛 Troubleshooting

### Issue: Screens don't show
**Solution**: Check that all imports in `app/page.tsx` are correct

### Issue: API errors
**Solution**: 
- Verify `NEXT_PUBLIC_API_BASE_URL` is set
- Check authentication token is valid
- Ensure backend APIs are accessible

### Issue: User ID verification fails
**Solution**:
- Confirm platform_uid is correct
- Check betting user ID format
- Verify backend endpoint is working

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify network requests in DevTools
3. Check backend API responses
4. Ensure user has proper permissions

## 🎉 You're All Set!

Everything is connected and ready to use. Just navigate to the dashboard, open the sidebar, and explore the new betting features!

