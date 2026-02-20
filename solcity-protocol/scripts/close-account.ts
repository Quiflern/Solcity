import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolcityProtocol } from "../target/types/solcity_protocol";
import { PublicKey, SystemProgram } from "@solana/web3.js";

async function main() {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolcityProtocol as Program<SolcityProtocol>;

  // The corrupted merchant account
  const merchantAccount = new PublicKey("FjVbBW18u29HQ9RkXtsLibre2cdguMW43jH64BWua2S8");

  console.log("Closing account:", merchantAccount.toString());
  console.log("Rent will be returned to:", provider.wallet.publicKey.toString());

  try {
    // Get account info to see how much rent we'll recover
    const accountInfo = await provider.connection.getAccountInfo(merchantAccount);
    if (accountInfo) {
      console.log("Account balance:", accountInfo.lamports / 1e9, "SOL");
    }

    // Close the account by transferring all lamports to the wallet
    const tx = await provider.connection.sendTransaction(
      new anchor.web3.Transaction().add(
        SystemProgram.transfer({
          fromPubkey: merchantAccount,
          toPubkey: provider.wallet.publicKey,
          lamports: accountInfo!.lamports,
        })
      ),
      [provider.wallet.payer]
    );

    console.log("Transaction signature:", tx);
    console.log("Account closed successfully!");
  } catch (error: any) {
    console.error("Error:", error.message);
    console.log("\nNote: You cannot close this account with a simple transfer.");
    console.log("The account is owned by the program, so we need to use a program instruction.");
    console.log("\nLet's try a different approach - we'll just leave it and register a new one.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
