use crate::{LoyaltyProgram, Merchant, RewardRule, RuleType, SolcityError};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(rule_id: u64)]
pub struct SetRewardRule<'info> {
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
        init,
        payer = merchant_authority,
        space = 8 + RewardRule::INIT_SPACE,
        seeds = [
            RewardRule::SEED_PREFIX,
            merchant.key().as_ref(),
            &rule_id.to_le_bytes()
        ],
        bump
    )]
    pub reward_rule: Account<'info, RewardRule>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<SetRewardRule>,
    _rule_id: u64,
    name: String,
    rule_type: RuleType,
    multiplier: u64,
    min_purchase: u64,
    start_time: i64,
    end_time: i64,
) -> Result<()> {
    require!(!name.is_empty(), SolcityError::NameEmpty);
    require!(name.len() <= 32, SolcityError::NameTooLong);
    require!(multiplier >= 100, SolcityError::InvalidRewardAmount);

    if end_time > 0 {
        require!(end_time > start_time, SolcityError::InvalidTimeRange);
    }

    let reward_rule = &mut ctx.accounts.reward_rule;

    reward_rule.merchant = ctx.accounts.merchant.key();
    reward_rule.rule_id = _rule_id;
    reward_rule.name = name.clone();
    reward_rule.rule_type = rule_type.clone();
    reward_rule.multiplier = multiplier;
    reward_rule.min_purchase = min_purchase;
    reward_rule.is_active = true;
    reward_rule.start_time = start_time;
    reward_rule.end_time = end_time;
    reward_rule.bump = ctx.bumps.reward_rule;

    msg!(
        "Reward rule created: {}, {:?}, multiplier: {}x, min purchase: ${}",
        name,
        rule_type,
        multiplier as f64 / 100.0,
        min_purchase as f64 / 100.0
    );

    Ok(())
}
