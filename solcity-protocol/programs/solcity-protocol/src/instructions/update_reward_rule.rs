use anchor_lang::prelude::*;
use crate::{LoyaltyProgram, Merchant, RewardRule, RuleType, SolcityError};

#[derive(Accounts)]
#[instruction(rule_id: u64)]
pub struct UpdateRewardRule<'info> {
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

pub fn handler(
    ctx: Context<UpdateRewardRule>,
    _rule_id: u64,
    name: Option<String>,
    rule_type: Option<RuleType>,
    multiplier: Option<u64>,
    min_purchase: Option<u64>,
    start_time: Option<i64>,
    end_time: Option<i64>,
) -> Result<()> {
    let reward_rule = &mut ctx.accounts.reward_rule;

    if let Some(new_name) = name {
        require!(!new_name.is_empty(), SolcityError::NameEmpty);
        require!(new_name.len() <= 32, SolcityError::NameTooLong);
        reward_rule.name = new_name;
    }

    if let Some(new_rule_type) = rule_type {
        reward_rule.rule_type = new_rule_type;
    }

    if let Some(new_multiplier) = multiplier {
        require!(new_multiplier >= 100, SolcityError::InvalidRewardAmount);
        reward_rule.multiplier = new_multiplier;
    }

    if let Some(new_min_purchase) = min_purchase {
        reward_rule.min_purchase = new_min_purchase;
    }

    if let Some(new_start_time) = start_time {
        reward_rule.start_time = new_start_time;
    }

    if let Some(new_end_time) = end_time {
        if new_end_time > 0 {
            require!(new_end_time > reward_rule.start_time, SolcityError::InvalidTimeRange);
        }
        reward_rule.end_time = new_end_time;
    }

    msg!("Reward rule updated: {}", reward_rule.name);

    Ok(())
}
