use crate::{Merchant, SolcityError};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateMerchant<'info> {
    #[account(mut)]
    pub merchant_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [
            Merchant::SEED_PREFIX,
            merchant_authority.key().as_ref(),
            merchant.loyalty_program.as_ref()
        ],
        bump = merchant.bump,
    )]
    pub merchant: Account<'info, Merchant>,
}

pub fn handler(
    ctx: Context<UpdateMerchant>,
    new_reward_rate: Option<u64>,
    description: Option<String>,
    avatar_url: Option<String>,
    category: Option<String>,
    is_active: Option<bool>,
) -> Result<()> {
    let merchant = &mut ctx.accounts.merchant;

    if let Some(rate) = new_reward_rate {
        require!(rate > 0, SolcityError::InvalidRewardAmount);
        merchant.reward_rate = rate;
        msg!("Reward rate updated to: {} tokens/$", rate);
    }

    if let Some(desc) = description {
        require!(desc.len() <= 256, SolcityError::NameTooLong);
        merchant.description = desc;
        msg!("Description updated");
    }

    if let Some(url) = avatar_url {
        require!(url.len() <= 128, SolcityError::NameTooLong);
        merchant.avatar_url = url;
        msg!("Avatar URL updated");
    }

    if let Some(cat) = category {
        require!(!cat.is_empty(), SolcityError::NameEmpty);
        require!(cat.len() <= 32, SolcityError::NameTooLong);
        merchant.category = cat;
        msg!("Category updated");
    }

    if let Some(active) = is_active {
        merchant.is_active = active;
        msg!("Merchant active status: {}", active);
    }

    Ok(())
}
