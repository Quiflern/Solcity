use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

pub use constants::*;
pub use errors::*;
#[allow(ambiguous_glob_reexports)]
pub use instructions::*;
pub use state::*;

declare_id!("67XD1wBu5Ja1H5e4Zg4vsjZDoAcB8KwTZqawodZZwqv9");

#[program]
pub mod solcity_protocol {
    use super::*;

    /// Initialize a new loyalty program with Token-2022 mint
    pub fn initialize_program(
        ctx: Context<InitializeProgram>,
        name: String,
        interest_rate: Option<i16>,
    ) -> Result<()> {
        instructions::initialize_program::handler(ctx, name, interest_rate)
    }

    /// Register a new merchant in the loyalty program
    pub fn register_merchant(
        ctx: Context<RegisterMerchant>,
        name: String,
        reward_rate: u64,
    ) -> Result<()> {
        instructions::register_merchant::handler(ctx, name, reward_rate)
    }

    /// Register a new customer in the loyalty program
    pub fn register_customer(ctx: Context<RegisterCustomer>) -> Result<()> {
        instructions::register_customer::handler(ctx)
    }

    /// Issue reward tokens to a customer for a purchase
    pub fn issue_rewards(
        ctx: Context<IssueRewards>,
        purchase_amount: u64,
    ) -> Result<()> {
        instructions::issue_rewards::handler(ctx, purchase_amount)
    }

    /// Redeem reward tokens for benefits
    pub fn redeem_rewards(
        ctx: Context<RedeemRewards>,
        amount: u64,
        redemption_type: RedemptionType,
    ) -> Result<()> {
        instructions::redeem_rewards::handler(ctx, amount, redemption_type)
    }

    /// Create a new reward rule for a merchant
    pub fn set_reward_rule(
        ctx: Context<SetRewardRule>,
        rule_id: u64,
        rule_type: RuleType,
        multiplier: u64,
        min_purchase: u64,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        instructions::set_reward_rule::handler(
            ctx,
            rule_id,
            rule_type,
            multiplier,
            min_purchase,
            start_time,
            end_time,
        )
    }

    /// Update merchant settings
    pub fn update_merchant(
        ctx: Context<UpdateMerchant>,
        new_reward_rate: Option<u64>,
        is_active: Option<bool>,
    ) -> Result<()> {
        instructions::update_merchant::handler(ctx, new_reward_rate, is_active)
    }
}
