# Pool Status Mismatch Fix

## Problem

There was a **mismatch** between pools showing as "OPEN" in the UI with a timer, but being rejected as "locked" by the backend when trying to enter.

### Root Cause

The backend validates **TWO conditions** for pool entry:
1. **Database status** must be "OPEN"
2. **Current time** must be **before `lock_ts`** (time-based lock)

The frontend was only checking condition #1 (database status), so pools that were:
- Status = "OPEN" in database ✅
- But current_time >= lock_ts ❌

Would show as "OPEN" in the UI but reject entries with a 400 error.

## Solution

Created a new utility module `lib/pool-utils.ts` with three helper functions:

### 1. `isPoolOpenForEntry(status, lock_ts)`
Returns `true` only if BOTH conditions are met:
- Status is "OPEN" 
- Current time < lock_ts

### 2. `getEffectiveStatus(status, lock_ts, end_ts)`
Returns the **actual** status considering time:
- If status="OPEN" but time >= lock_ts → returns "LOCKED"
- Otherwise returns the database status

### 3. `getLockReason(status, lock_ts)`
Returns a user-friendly message explaining why a pool is locked:
- For LOCKED status: "This pool is locked. No new entries allowed."
- For OPEN but past lock_ts: "Entry period has ended. This pool is now locked and awaiting resolution."

## Changes Made

### 1. Pool Detail Page (`app/pool/[id]/page.tsx`)
- ✅ Uses `isPoolOpenForEntry()` to determine if entry form should show
- ✅ Uses `getEffectiveStatus()` for display logic
- ✅ Uses `getLockReason()` for user feedback
- ✅ Entry form only shows when truly open for entries
- ✅ Shows appropriate locked message when time has passed

### 2. Pool Card Component (`components/pool-card.tsx`)
- ✅ Badge shows **effective status** (not just database status)
- ✅ Badges change from green "OPEN" to yellow "LOCKED" when lock time passes
- ✅ Timer receives effective status for accurate countdown

### 3. Entry API (`app/api/tx/enter/route.ts`)
- ✅ Already had correct validation (no changes needed)
- ✅ Now frontend matches backend logic

## Example Scenarios

### Scenario 1: Pool Past Lock Time
**Before:**
- Database: status = "OPEN"
- Current time = 12:00 PM
- Lock time = 11:00 AM (1 hour ago)
- UI showed: Badge "OPEN" (green), Entry form visible
- API returned: "Pool is locked" error ❌

**After:**
- UI shows: Badge "LOCKED" (yellow), No entry form
- Shows message: "Entry period has ended. This pool is now locked."
- Matches backend behavior ✅

### Scenario 2: Pool Still Open
- Database: status = "OPEN"  
- Current time = 10:00 AM
- Lock time = 11:00 AM (1 hour from now)
- UI shows: Badge "OPEN" (green), Entry form visible ✅
- API accepts: Entry succeeds ✅

### Scenario 3: Pool Resolved
- Database: status = "RESOLVED"
- UI shows: Badge "RESOLVED" (gray), Claim panel visible ✅
- Time doesn't matter for resolved pools ✅

## Testing

### Test the Fix:
1. Visit homepage: http://localhost:3000
2. Look at pool badges - they should accurately reflect entry availability
3. Click on any pool with a "LOCKED" badge
4. Verify you see the lock message and NO entry form
5. Try pools with "OPEN" badge - entry form should work

### Specific Test Cases:
- **Pool 1 (BONK)**: OPEN, should accept entries
- **Pool 3 (POPCAT)**: LOCKED (in database), shows locked
- **Pool 4 (MEW)**: RESOLVED, shows claim panel
- **Pool 8 (POPCAT)**: OPEN, should accept entries

## Future Enhancements

1. **Auto-refresh status**: Add polling to update status when lock time is reached
2. **Countdown to lock**: Show "Locking in 5:00" in the last minutes
3. **Backend job**: Automatically update database status when lock_ts is reached
4. **Websocket updates**: Real-time status updates for all users

## Technical Notes

- Time comparisons use Unix timestamps (seconds since epoch)
- `Math.floor(Date.now() / 1000)` converts JS timestamp to Unix time
- All helper functions are pure and testable
- No breaking changes to existing API or database schema


