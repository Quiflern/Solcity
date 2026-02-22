use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum RedemptionType {
    Discount { percentage: u8 },
    FreeProduct { product_id: String },
    Cashback { amount_lamports: u64 },
    ExclusiveAccess { access_type: String },
    Custom { type_name: String },
}

impl anchor_lang::Space for RedemptionType {
    const INIT_SPACE: usize = 1 + 256; // 1 byte for enum discriminator + max space for variants
}

#[account]
#[derive(InitSpace)]
pub struct RedemptionOffer {
    pub merchant: Pubkey,
    pub loyalty_program: Pubkey,
    #[max_len(64)]
    pub name: String,
    #[max_len(256)]
    pub description: String,
    #[max_len(32)]
    pub icon: String,
    pub cost: u64,
    pub offer_type: RedemptionType,
    pub quantity_limit: Option<u64>,
    pub quantity_claimed: u64,
    pub expiration: Option<i64>,
    pub is_active: bool,
    pub created_at: i64,
    pub bump: u8,
}

impl RedemptionOffer {
    pub const SEED_PREFIX: &'static [u8] = b"redemption_offer";

    pub fn is_available(&self, current_time: i64) -> bool {
        if !self.is_active {
            return false;
        }

        // Check expiration
        if let Some(expiration) = self.expiration {
            if current_time > expiration {
                return false;
            }
        }

        // Check quantity limit
        if let Some(limit) = self.quantity_limit {
            if self.quantity_claimed >= limit {
                return false;
            }
        }

        true
    }
}
