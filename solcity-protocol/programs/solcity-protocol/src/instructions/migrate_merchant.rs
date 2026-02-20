use anchor_lang::prelude::*;
use crate::SolcityError;

#[derive(Accounts)]
pub struct MigrateMerchant<'info> {
    #[account(mut)]
    pub merchant_authority: Signer<'info>,

    /// CHECK: We manually validate this account since it has old structure
    #[account(
        mut,
        seeds = [
            b"merchant",
            merchant_authority.key().as_ref(),
            &merchant.data.borrow()[40..72] // loyalty_program is at offset 40
        ],
        bump,
    )]
    pub merchant: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<MigrateMerchant>,
    avatar_url: String,
) -> Result<()> {
    require!(avatar_url.len() <= 128, SolcityError::NameTooLong);

    let merchant_account = &ctx.accounts.merchant;
    
    // Calculate new size: 8 (discriminator) + all fields including avatar_url
    // Old size: 8 + 32 + 32 + 32 + 8 + 8 + 8 + 1 + 1 + 8 = 138 bytes (without avatar_url)
    // New size: 138 + 4 + 128 = 270 bytes (with avatar_url String)
    let new_size = 8 + 32 + 32 + 4 + 32 + 4 + 128 + 8 + 8 + 8 + 1 + 1 + 8;

    // Realloc the account
    merchant_account.realloc(new_size, false)?;

    // Transfer lamports for rent
    let rent = Rent::get()?;
    let new_minimum_balance = rent.minimum_balance(new_size);
    let current_balance = merchant_account.lamports();
    
    if new_minimum_balance > current_balance {
        let lamports_diff = new_minimum_balance - current_balance;
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.merchant_authority.to_account_info(),
                    to: merchant_account.to_account_info(),
                },
            ),
            lamports_diff,
        )?;
    }

    // Write the avatar_url at the correct offset
    // The avatar_url field comes after: discriminator(8) + authority(32) + loyalty_program(32) + name(4+32)
    let avatar_offset = 8 + 32 + 32 + 4 + 32;
    let mut data = merchant_account.try_borrow_mut_data()?;
    
    // Write avatar_url length (4 bytes)
    data[avatar_offset..avatar_offset + 4].copy_from_slice(&(avatar_url.len() as u32).to_le_bytes());
    
    // Write avatar_url string (up to 128 bytes)
    let avatar_bytes = avatar_url.as_bytes();
    data[avatar_offset + 4..avatar_offset + 4 + avatar_bytes.len()].copy_from_slice(avatar_bytes);

    msg!("Merchant account migrated with avatar URL");

    Ok(())
}
