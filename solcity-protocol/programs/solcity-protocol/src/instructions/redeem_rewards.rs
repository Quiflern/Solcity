use crate::{Customer, LoyaltyProgram, Merchant, RedemptionOffer, RedemptionType, RedemptionVoucher, SolcityError};
use anchor_lang::prelude::*;
use anchor_spl::token_2022::{self, Token2022};
use anchor_spl::token_interface::{Mint, TokenAccount};

#[derive(Accounts)]
#[instruction(voucher_seed: u64)]
pub struct RedeemRewards<'info> {
    #[account(mut)]
    pub customer_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [
            Customer::SEED_PREFIX,
            customer_authority.key().as_ref(),
            loyalty_program.key().as_ref()
        ],
        bump = customer.bump,
    )]
    pub customer: Account<'info, Customer>,

    #[account(
        mut,
        seeds = [
            Merchant::SEED_PREFIX,
            merchant.authority.as_ref(),
            loyalty_program.key().as_ref()
        ],
        bump = merchant.bump,
    )]
    pub merchant: Account<'info, Merchant>,

    #[account(
        mut,
        seeds = [LoyaltyProgram::SEED_PREFIX, loyalty_program.authority.as_ref()],
        bump = loyalty_program.bump,
    )]
    pub loyalty_program: Account<'info, LoyaltyProgram>,

    #[account(
        mut,
        seeds = [b"mint", loyalty_program.key().as_ref()],
        bump,
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        constraint = customer_token_account.owner == customer_authority.key() @ SolcityError::UnauthorizedAccess,
        constraint = customer_token_account.mint == mint.key() @ SolcityError::InvalidMint,
    )]
    pub customer_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            RedemptionOffer::SEED_PREFIX,
            merchant.key().as_ref(),
            redemption_offer.name.as_bytes()
        ],
        bump = redemption_offer.bump,
        constraint = redemption_offer.merchant == merchant.key() @ SolcityError::UnauthorizedAccess,
    )]
    pub redemption_offer: Account<'info, RedemptionOffer>,

    #[account(
        init,
        payer = customer_authority,
        space = RedemptionVoucher::SPACE,
        seeds = [
            RedemptionVoucher::SEED_PREFIX,
            customer_authority.key().as_ref(),
            merchant.key().as_ref(),
            redemption_offer.key().as_ref(),
            voucher_seed.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub voucher: Account<'info, RedemptionVoucher>,

    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RedeemRewards>, voucher_seed: u64) -> Result<()> {
    let clock = Clock::get()?;
    
    // Check if offer is available (borrow immutably first)
    let offer_cost = ctx.accounts.redemption_offer.cost;
    let offer_name = ctx.accounts.redemption_offer.name.clone();
    let offer_description = ctx.accounts.redemption_offer.description.clone();
    let offer_type = ctx.accounts.redemption_offer.offer_type.clone();
    let merchant_name = ctx.accounts.merchant.name.clone();
    
    require!(
        ctx.accounts.redemption_offer.is_available(clock.unix_timestamp),
        SolcityError::OfferNotAvailable
    );

    require!(
        ctx.accounts.customer_token_account.amount >= offer_cost,
        SolcityError::InsufficientBalance
    );

    // Burn tokens from customer account
    token_2022::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token_2022::Burn {
                mint: ctx.accounts.mint.to_account_info(),
                from: ctx.accounts.customer_token_account.to_account_info(),
                authority: ctx.accounts.customer_authority.to_account_info(),
            },
        ),
        offer_cost,
    )?;

    // Generate redemption code (SLCY-XXXX-XXXX format)
    let code_part1 = (voucher_seed % 10000) as u16;
    let code_part2 = ((voucher_seed / 10000) % 10000) as u16;
    let redemption_code = format!("SLCY-{:04X}-{:04X}", code_part1, code_part2);

    // Initialize voucher
    let voucher = &mut ctx.accounts.voucher;
    voucher.customer = ctx.accounts.customer_authority.key();
    voucher.merchant = ctx.accounts.merchant.key();
    voucher.redemption_offer = ctx.accounts.redemption_offer.key();
    voucher.merchant_name = merchant_name;
    voucher.offer_name = offer_name.clone();
    voucher.offer_description = offer_description;
    voucher.cost = offer_cost;
    voucher.redemption_code = redemption_code.clone();
    voucher.created_at = clock.unix_timestamp;
    voucher.expires_at = clock.unix_timestamp + (30 * 24 * 60 * 60); // 30 days
    voucher.is_used = false;
    voucher.used_at = None;
    voucher.bump = ctx.bumps.voucher;

    // Update state
    let customer = &mut ctx.accounts.customer;
    let merchant = &mut ctx.accounts.merchant;
    let loyalty_program = &mut ctx.accounts.loyalty_program;
    let redemption_offer = &mut ctx.accounts.redemption_offer;

    customer.total_redeemed = customer
        .total_redeemed
        .checked_add(offer_cost)
        .ok_or(SolcityError::Overflow)?;

    merchant.total_redeemed = merchant
        .total_redeemed
        .checked_add(offer_cost)
        .ok_or(SolcityError::Overflow)?;

    loyalty_program.total_tokens_redeemed = loyalty_program
        .total_tokens_redeemed
        .checked_add(offer_cost)
        .ok_or(SolcityError::Overflow)?;

    redemption_offer.quantity_claimed = redemption_offer
        .quantity_claimed
        .checked_add(1)
        .ok_or(SolcityError::Overflow)?;

    customer.last_activity = clock.unix_timestamp;

    // Emit event for off-chain processing
    emit!(RedemptionEvent {
        customer: customer.wallet,
        merchant: merchant.authority,
        offer_name,
        amount: offer_cost,
        redemption_type: offer_type,
        redemption_code,
        voucher: voucher.key(),
        timestamp: clock.unix_timestamp,
    });

    msg!("Redeemed {} tokens for offer, voucher created", offer_cost);

    Ok(())
}

#[event]
pub struct RedemptionEvent {
    pub customer: Pubkey,
    pub merchant: Pubkey,
    pub offer_name: String,
    pub amount: u64,
    pub redemption_type: RedemptionType,
    pub redemption_code: String,
    pub voucher: Pubkey,
    pub timestamp: i64,
}
