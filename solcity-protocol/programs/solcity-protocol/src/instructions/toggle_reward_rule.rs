use anchor_lang::prelude::*;
use crate::{LoyaltyProgram, Merchant, RewardRule, SolcityError};

#[derive(Accounts)]
#[instruction(rule_id: u64)]
pub struct ToggleRewardRule<'info> {
    #[account(mut)]
    pub merchant_authority: Signer<'info>,

    #[account(
        seeds = [
            LoyaltyProgram::SEED_PREFIX,
            merchant_authority.key().as_ref()
        ],
        bump = loyalty_program.bump,
    )]
    pub loyalty_program: Account<'info, LoyaltyProgram>,

    #[account(
        seeds = [
            Merchant::SEED_PREFIX,
            merchant_authority.key().as_ref(),
            loyalty_program.key().as_ref()
        ],
        bump = merchant.bump,
    )]
    pub merchant: Account<'info, Merchant>,

    #[account(
        mut,
        seeds = [
            RewardRule::SEED_PREFIX,
            merchant.key().as_ref(),
            &rule_id.to_le_bytes()
        ],
        bump = reward_rule.bump,
        constraint = reward_rule.merchant == merchant.key() @ SolcityError::UnauthorizedAccess
    )]
    pub reward_rule: Account<'info, RewardRule>,
}

pub fn handler(ctx: Context<ToggleRewardRule>, _rule_id: u64, is_active: bool) -> Result<()> {
    let reward_rule = &mut ctx.accounts.reward_rule;
    reward_rule.is_active = is_active;

    msg!(
        "Reward rule '{}' is now {}",
        reward_rule.name,
        if is_active { "active" } else { "paused" }
    );

    Ok(())
}
