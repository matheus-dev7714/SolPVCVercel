use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("11111111111111111111111111111111"); // Replace with actual program ID after deployment

#[program]
pub mod solpve {
    use super::*;

    /// Initialize a new prediction pool
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        pool_id: u64,
        start_ts: i64,
        lock_ts: i64,
        end_ts: i64,
        line_bps: i16,
        ai_commit: [u8; 32],
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        require!(lock_ts > start_ts, ErrorCode::InvalidTimestamps);
        require!(end_ts > lock_ts, ErrorCode::InvalidTimestamps);
        require!(line_bps >= -10000 && line_bps <= 10000, ErrorCode::InvalidLineBps);

        pool.authority = ctx.accounts.authority.key();
        pool.pool_id = pool_id;
        pool.start_ts = start_ts;
        pool.lock_ts = lock_ts;
        pool.end_ts = end_ts;
        pool.line_bps = line_bps;
        pool.status = PoolStatus::Open;
        pool.total_over = 0;
        pool.total_under = 0;
        pool.ai_commit = ai_commit;
        pool.winner = Winner::None;
        pool.bump = ctx.bumps.pool;

        Ok(())
    }

    /// Enter a pool by betting on Over or Under
    pub fn enter_pool(
        ctx: Context<EnterPool>,
        amount: u64,
        side: Side,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let clock = Clock::get()?;

        // Validate pool is open and before lock time
        require!(pool.status == PoolStatus::Open, ErrorCode::PoolNotOpen);
        require!(clock.unix_timestamp < pool.lock_ts, ErrorCode::PoolLocked);

        // Calculate fee (0.75% = 75 basis points)
        let fee = amount.checked_mul(75).unwrap().checked_div(10000).unwrap();
        let net_amount = amount.checked_sub(fee).unwrap();

        // Transfer SOL from user to pool vault
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.pool_vault.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;

        // Update pool totals
        match side {
            Side::Over => {
                pool.total_over = pool.total_over.checked_add(net_amount).unwrap();
            }
            Side::Under => {
                pool.total_under = pool.total_under.checked_add(net_amount).unwrap();
            }
        }

        // Initialize or update user entry
        let entry = &mut ctx.accounts.entry;
        entry.pool = pool.key();
        entry.user = ctx.accounts.user.key();
        entry.side = side;
        entry.amount = entry.amount.checked_add(net_amount).unwrap();
        entry.fee_paid = entry.fee_paid.checked_add(fee).unwrap();
        entry.claimed = false;
        entry.bump = ctx.bumps.entry;

        emit!(EntryCreated {
            pool: pool.key(),
            user: ctx.accounts.user.key(),
            side,
            amount: net_amount,
            fee: fee,
        });

        Ok(())
    }

    /// Resolve a pool after end_ts with oracle data
    pub fn resolve_pool(
        ctx: Context<ResolvePool>,
        winner: Winner,
        proof_hash: [u8; 32],
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let clock = Clock::get()?;

        // Validate pool can be resolved
        require!(pool.status == PoolStatus::Open || pool.status == PoolStatus::Locked, ErrorCode::PoolAlreadyResolved);
        require!(clock.unix_timestamp >= pool.end_ts, ErrorCode::PoolNotEnded);
        require!(ctx.accounts.authority.key() == pool.authority, ErrorCode::Unauthorized);

        pool.status = PoolStatus::Resolved;
        pool.winner = winner;
        pool.proof_hash = proof_hash;

        emit!(PoolResolved {
            pool: pool.key(),
            winner,
            proof_hash,
        });

        Ok(())
    }

    /// Claim winnings from a resolved pool
    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let pool = &ctx.accounts.pool;
        let entry = &mut ctx.accounts.entry;

        // Validate pool is resolved and entry hasn't been claimed
        require!(pool.status == PoolStatus::Resolved, ErrorCode::PoolNotResolved);
        require!(!entry.claimed, ErrorCode::AlreadyClaimed);
        require!(entry.user == ctx.accounts.user.key(), ErrorCode::Unauthorized);

        // Check if user won
        let user_won = match (entry.side, pool.winner) {
            (Side::Over, Winner::Over) => true,
            (Side::Under, Winner::Under) => true,
            (_, Winner::Void) => true, // Void = everyone gets refunded
            _ => false,
        };

        require!(user_won, ErrorCode::NotWinner);

        // Calculate payout
        let payout = if pool.winner == Winner::Void {
            // Void: return original amount
            entry.amount
        } else {
            // Winner: proportional share of total pool
            let winning_side_total = match pool.winner {
                Winner::Over => pool.total_over,
                Winner::Under => pool.total_under,
                _ => unreachable!(),
            };
            let total_pool = pool.total_over.checked_add(pool.total_under).unwrap();

            // payout = (user_amount / winning_side_total) * total_pool
            entry.amount
                .checked_mul(total_pool).unwrap()
                .checked_div(winning_side_total).unwrap()
        };

        // Transfer SOL from pool vault to user
        let pool_key = pool.key();
        let seeds = &[
            b"pool_vault",
            pool_key.as_ref(),
            &[pool.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.pool_vault.to_account_info(),
                to: ctx.accounts.user.to_account_info(),
            },
            signer,
        );
        anchor_lang::system_program::transfer(cpi_context, payout)?;

        entry.claimed = true;

        emit!(WinningsClaimed {
            pool: pool.key(),
            user: ctx.accounts.user.key(),
            amount: payout,
        });

        Ok(())
    }

    /// Lock a pool (prevent new entries)
    pub fn lock_pool(ctx: Context<LockPool>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let clock = Clock::get()?;

        require!(pool.status == PoolStatus::Open, ErrorCode::PoolNotOpen);
        require!(clock.unix_timestamp >= pool.lock_ts, ErrorCode::PoolNotLockable);
        require!(ctx.accounts.authority.key() == pool.authority, ErrorCode::Unauthorized);

        pool.status = PoolStatus::Locked;

        emit!(PoolLocked {
            pool: pool.key(),
        });

        Ok(())
    }
}

// ============================================================================
// Account Structures
// ============================================================================

#[derive(Accounts)]
#[instruction(pool_id: u64)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Pool::LEN,
        seeds = [b"pool", pool_id.to_le_bytes().as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,

    /// CHECK: PDA for pool vault
    #[account(
        seeds = [b"pool_vault", pool.key().as_ref()],
        bump
    )]
    pub pool_vault: SystemAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EnterPool<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,

    /// CHECK: PDA for pool vault
    #[account(
        mut,
        seeds = [b"pool_vault", pool.key().as_ref()],
        bump = pool.bump
    )]
    pub pool_vault: SystemAccount<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + Entry::LEN,
        seeds = [b"entry", pool.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub entry: Account<'info, Entry>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolvePool<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,

    /// CHECK: PDA for pool vault
    #[account(
        mut,
        seeds = [b"pool_vault", pool.key().as_ref()],
        bump = pool.bump
    )]
    pub pool_vault: SystemAccount<'info>,

    #[account(mut)]
    pub entry: Account<'info, Entry>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LockPool<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,

    pub authority: Signer<'info>,
}

// ============================================================================
// Account Data Structures
// ============================================================================

#[account]
pub struct Pool {
    pub authority: Pubkey,        // 32
    pub pool_id: u64,              // 8
    pub start_ts: i64,             // 8
    pub lock_ts: i64,              // 8
    pub end_ts: i64,               // 8
    pub line_bps: i16,             // 2
    pub status: PoolStatus,        // 1
    pub total_over: u64,           // 8
    pub total_under: u64,          // 8
    pub ai_commit: [u8; 32],       // 32
    pub winner: Winner,            // 1
    pub proof_hash: [u8; 32],      // 32
    pub bump: u8,                  // 1
}

impl Pool {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 8 + 2 + 1 + 8 + 8 + 32 + 1 + 32 + 1;
}

#[account]
pub struct Entry {
    pub pool: Pubkey,              // 32
    pub user: Pubkey,              // 32
    pub side: Side,                // 1
    pub amount: u64,               // 8
    pub fee_paid: u64,             // 8
    pub claimed: bool,             // 1
    pub bump: u8,                  // 1
}

impl Entry {
    pub const LEN: usize = 32 + 32 + 1 + 8 + 8 + 1 + 1;
}

// ============================================================================
// Enums
// ============================================================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum PoolStatus {
    Open,
    Locked,
    Resolved,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum Side {
    Over,
    Under,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum Winner {
    None,
    Over,
    Under,
    Void,
}

// ============================================================================
// Events
// ============================================================================

#[event]
pub struct EntryCreated {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub side: Side,
    pub amount: u64,
    pub fee: u64,
}

#[event]
pub struct PoolResolved {
    pub pool: Pubkey,
    pub winner: Winner,
    pub proof_hash: [u8; 32],
}

#[event]
pub struct WinningsClaimed {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
}

#[event]
pub struct PoolLocked {
    pub pool: Pubkey,
}

// ============================================================================
// Errors
// ============================================================================

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid timestamps: end_ts must be after lock_ts, lock_ts must be after start_ts")]
    InvalidTimestamps,

    #[msg("Line BPS must be between -10000 and 10000")]
    InvalidLineBps,

    #[msg("Pool is not open for entries")]
    PoolNotOpen,

    #[msg("Pool is locked, no more entries allowed")]
    PoolLocked,

    #[msg("Pool has not ended yet")]
    PoolNotEnded,

    #[msg("Pool has already been resolved")]
    PoolAlreadyResolved,

    #[msg("Pool is not resolved yet")]
    PoolNotResolved,

    #[msg("Winnings have already been claimed")]
    AlreadyClaimed,

    #[msg("User did not win this pool")]
    NotWinner,

    #[msg("Unauthorized: only pool authority can perform this action")]
    Unauthorized,

    #[msg("Pool cannot be locked yet")]
    PoolNotLockable,
}
