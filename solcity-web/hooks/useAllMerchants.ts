"use client";

import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { SolcityProtocol } from "@/lib/anchor/idl/solcity_protocol";
import IDL_JSON from "@/lib/anchor/idl/solcity_protocol.json";

export interface MerchantData {
  publicKey: PublicKey;
  authority: PublicKey;
  loyaltyProgram: PublicKey;
  name: string;
  avatarUrl: string;
  rewardRate: number;
  totalIssued: number;
  totalRedeemed: number;
  isActive: boolean;
  createdAt: number;
}

export function useAllMerchants() {
  const { connection } = useConnection();
  const [merchants, setMerchants] = useState<MerchantData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setIsLoading(true);

        // Create a read-only provider (no wallet needed)
        const provider = new AnchorProvider(
          connection,
          {} as any, // No wallet needed for reading
          { commitment: "confirmed" }
        );

        const program = new Program<SolcityProtocol>(
          IDL_JSON as SolcityProtocol,
          provider
        );

        // Fetch all merchant accounts
        const merchantAccounts = await program.account.merchant.all();

        console.log("Fetched merchants:", merchantAccounts.length);

        const merchantsData: MerchantData[] = merchantAccounts.map((account) => ({
          publicKey: account.publicKey,
          authority: account.account.authority,
          loyaltyProgram: account.account.loyaltyProgram,
          name: account.account.name,
          avatarUrl: account.account.avatarUrl || "",
          rewardRate: account.account.rewardRate,
          totalIssued: account.account.totalIssued,
          totalRedeemed: account.account.totalRedeemed,
          isActive: account.account.isActive,
          createdAt: account.account.createdAt,
        }));

        // Sort by creation date (newest first)
        merchantsData.sort((a, b) => b.createdAt - a.createdAt);

        setMerchants(merchantsData);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching merchants:", err);
        setError(err.message || "Failed to fetch merchants");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerchants();
  }, [connection]);

  return {
    merchants,
    isLoading,
    error,
  };
}
