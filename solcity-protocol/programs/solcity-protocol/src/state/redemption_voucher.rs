use anchor_lang::prelude::*;

#[account]
pub struct RedemptionVoucher {
    pub customer: Pubkey,           // 32
    pub merchant: Pubkey,           // 32
    pub redemption_offer: Pubkey,   // 32
    pub merchant_name: String,      // 4 + 50 = 54
    pub offer_name: String,         // 4 + 100 = 104
    pub offer_description: String,  // 4 + 200 = 204
    pub cost: u64,                  // 8
    pub redemption_code: String,    // 4 + 20 = 24 (format: SLCY-XXXX-XXXX)
    pub created_at: i64,            // 8
    pub expires_at: i64,            // 8
    pub is_used: bool,              // 1
    pub used_at: Option<i64>,       // 1 + 8 = 9
    pub bump: u8,                   // 1
}

impl RedemptionVoucher {
    pub const SEED_PREFIX: &'static [u8] = b"voucher";
    
    // Space calculation:
    // 8 (discriminator) + 32 + 32 + 32 + 54 + 104 + 204 + 8 + 24 + 8 + 8 + 1 + 9 + 1 = 525
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 54 + 104 + 204 + 8 + 24 + 8 + 8 + 1 + 9 + 1;

    pub fn is_valid(&self, current_timestamp: i64) -> bool {
        !self.is_used && current_timestamp < self.expires_at
    }

    pub fn mark_as_used(&mut self, timestamp: i64) {
        self.is_used = true;
        self.used_at = Some(timestamp);
    }
}
