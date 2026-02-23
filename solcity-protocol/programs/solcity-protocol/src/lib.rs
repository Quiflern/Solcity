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
        avatar_url: String,
        category: String,
        description: Option<String>,
        reward_rate: u64,
    ) -> Result<()> {
        instructions::register_merchant::handler(ctx, name, avatar_url, category, description, reward_rate)
    }

    /// Register a new customer in the loyalty program
    pub fn register_customer(ctx: Context<RegisterCustomer>) -> Result<()> {
        instructions::register_customer::handler(ctx)
    }

    /// Issue reward tokens to a customer for a purchase
    pub fn issue_rewards(ctx: Context<IssueRewards>, purchase_amount: u64, rule_id: Option<u64>) -> Result<()> {
        instructions::issue_rewards::handler(ctx, purchase_amount, rule_id)
    }

    /// Redeem reward tokens for benefits
    pub fn redeem_rewards(ctx: Context<RedeemRewards>) -> Result<()> {
        instructions::redeem_rewards::handler(ctx)
    }

    /// Create a new reward rule for a merchant
    pub fn set_reward_rule(
        ctx: Context<SetRewardRule>,
        rule_id: u64,
        name: String,
        rule_type: RuleType,
        multiplier: u64,
        min_purchase: u64,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        instructions::set_reward_rule::handler(
            ctx,
            rule_id,
            name,
            rule_type,
            multiplier,
            min_purchase,
            start_time,
            end_time,
        )
    }

    /// Update an existing reward rule
    pub fn update_reward_rule(
        ctx: Context<UpdateRewardRule>,
        rule_id: u64,
        name: Option<String>,
        rule_type: Option<RuleType>,
        multiplier: Option<u64>,
        min_purchase: Option<u64>,
        start_time: Option<i64>,
        end_time: Option<i64>,
    ) -> Result<()> {
        instructions::update_reward_rule::handler(
            ctx,
            rule_id,
            name,
            rule_type,
            multiplier,
            min_purchase,
            start_time,
            end_time,
        )
    }

    /// Toggle reward rule active status (pause/unpause)
    pub fn toggle_reward_rule(
        ctx: Context<ToggleRewardRule>,
        rule_id: u64,
        is_active: bool,
    ) -> Result<()> {
        instructions::toggle_reward_rule::handler(ctx, rule_id, is_active)
    }

    /// Delete a reward rule
    pub fn delete_reward_rule(ctx: Context<DeleteRewardRule>, rule_id: u64) -> Result<()> {
        instructions::delete_reward_rule::handler(ctx, rule_id)
    }

    /// Update merchant settings
    pub fn update_merchant(
        ctx: Context<UpdateMerchant>,
        new_reward_rate: Option<u64>,
        description: Option<String>,
        avatar_url: Option<String>,
        category: Option<String>,
        is_active: Option<bool>,
    ) -> Result<()> {
        instructions::update_merchant::handler(
            ctx,
            new_reward_rate,
            description,
            avatar_url,
            category,
            is_active,
        )
    }

    /// Create a new redemption offer
    pub fn create_redemption_offer(
        ctx: Context<CreateRedemptionOffer>,
        name: String,
        description: String,
        icon: String,
        cost: u64,
        offer_type: RedemptionType,
        quantity_limit: Option<u64>,
        expiration: Option<i64>,
    ) -> Result<()> {
        instructions::create_redemption_offer::handler(
            ctx,
            name,
            description,
            icon,
            cost,
            offer_type,
            quantity_limit,
            expiration,
        )
    }

    /// Update an existing redemption offer
    pub fn update_redemption_offer(
        ctx: Context<UpdateRedemptionOffer>,
        description: Option<String>,
        icon: Option<String>,
        cost: Option<u64>,
        offer_type: Option<RedemptionType>,
        quantity_limit: Option<Option<u64>>,
        expiration: Option<Option<i64>>,
    ) -> Result<()> {
        instructions::update_redemption_offer::handler(
            ctx,
            description,
            icon,
            cost,
            offer_type,
            quantity_limit,
            expiration,
        )
    }

    /// Toggle redemption offer active status
    pub fn toggle_redemption_offer(ctx: Context<ToggleRedemptionOffer>) -> Result<()> {
        instructions::toggle_redemption_offer::handler(ctx)
    }

    /// Delete a redemption offer
    pub fn delete_redemption_offer(ctx: Context<DeleteRedemptionOffer>) -> Result<()> {
        instructions::delete_redemption_offer::handler(ctx)
    }

    /// Close merchant account and refund rent
    pub fn close_merchant(ctx: Context<CloseMerchant>) -> Result<()> {
        instructions::close_merchant::handler(ctx)
    }
}
