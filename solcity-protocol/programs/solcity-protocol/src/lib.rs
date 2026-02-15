use anchor_lang::prelude::*;

declare_id!("2ueqgF694QjSbA9HS7BpqX982JzAoQT8norEg32ofxW5");

#[program]
pub mod solcity_protocol {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
