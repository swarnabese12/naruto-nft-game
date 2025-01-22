use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("BKbfHsoF2n4iWJHbsMkdkgqBjUFYsvupAGB5goRiMhcg");

#[program]
pub mod nft_transfer {
    use super::*;

    pub fn transfer_specific_nft(ctx: Context<TransferSpecificNft>, amount: u64) -> Result<()> {
        require!(amount == 1, CustomError::InvalidTransferAmount);

        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.sender_nft_account.to_account_info(),
                to: ctx.accounts.receiver_nft_account.to_account_info(),
                authority: ctx.accounts.sender.to_account_info(),
            },
        );

        token::transfer(transfer_ctx, amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferSpecificNft<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(
        mut,
        constraint = sender_nft_account.owner == sender.key(),
        constraint = sender_nft_account.amount == 1,
        constraint = sender_nft_account.mint == nft_mint.key(),
    )]
    pub sender_nft_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub receiver_nft_account: Account<'info, TokenAccount>,

    pub nft_mint: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum CustomError {
    #[msg("The transfer amount must be exactly 1.")]
    InvalidTransferAmount,
}
