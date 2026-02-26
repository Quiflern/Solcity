# Solcity Web App

The frontend application for Solcity - a blockchain-powered loyalty program platform built on Solana.

## Overview

Solcity Web is a Next.js application that provides interfaces for both merchants and customers to interact with the Solcity protocol. Merchants can create and manage loyalty programs, while customers can earn and redeem tokens across participating businesses.

## Features

### For Merchants
- Register and create custom loyalty tokens
- Set reward rules and multipliers
- Create redemption offers
- View analytics and customer insights
- Manage merchant profile and settings
- Issue rewards to customers

### For Customers
- Connect wallet and register
- Browse participating merchants
- View token balances and transaction history
- Redeem rewards for exclusive offers
- Track tier progress and benefits
- Manage customer profile

### Landing Page
- Real-time blockchain activity feed
- Platform metrics and statistics
- How it works section
- Use cases for different industries
- Interactive hero with animations

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Solana Web3.js, Anchor
- **Wallet**: Solana Wallet Adapter
- **State Management**: TanStack Query (React Query)
- **Code Quality**: Biome

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Solana wallet (Phantom, Solflare, etc.)
- Access to Solana devnet (or localnet for development)

### Installation

```bash
# Install dependencies
npm install
# or
bun install
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
```

### Development

```bash
# Run the development server
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Project Structure

```
solcity-web/
├── app/                    # Next.js app router pages
│   ├── customer/          # Customer dashboard pages
│   ├── merchant/          # Merchant dashboard pages
│   ├── explore/           # Merchant discovery pages
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── landing/          # Landing page sections
│   ├── layout/           # Layout components
│   ├── auth/             # Authentication components
│   └── providers/        # Context providers
├── hooks/                # Custom React hooks
│   ├── customer/         # Customer-related hooks
│   ├── merchant/         # Merchant-related hooks
│   ├── offers/           # Offer management hooks
│   ├── program/          # Program interaction hooks
│   └── wallet/           # Wallet connection hooks
├── lib/                  # Utility libraries
│   ├── anchor/           # Anchor program setup
│   │   ├── idl/         # Program IDL
│   │   ├── types/       # TypeScript types
│   │   ├── pdas.ts      # PDA derivation functions
│   │   └── setup.ts     # Program initialization
│   ├── explorer.ts       # Solana explorer utilities
│   ├── tiers.ts          # Customer tier logic
│   └── utils.ts          # General utilities
└── public/               # Static assets
```

## Key Components

### Landing Page Sections
- **HeroBanner**: Animated hero with blockchain data streams
- **MetricsBar**: Real-time platform statistics
- **FeaturesGrid**: Core platform features
- **HowItWorks**: Three-step process explanation
- **UseCases**: Industry-specific use cases
- **StatsShowcase**: Platform reliability metrics
- **ActivitySection**: Live blockchain activity feed
- **CTASection**: Final call-to-action

### Hooks
- `useSolcityProgram`: Initialize Anchor program
- `useLoyaltyProgram`: Fetch loyalty program data
- `useRecentActivity`: Real-time blockchain activity
- `usePlatformMetrics`: Platform-wide statistics
- `useMerchant`: Merchant account management
- `useCustomer`: Customer account management

## Wallet Integration

The app uses Solana Wallet Adapter for wallet connections:

```typescript
import { useWallet } from '@solana/wallet-adapter-react';

const { publicKey, connected, signTransaction } = useWallet();
```

Supported wallets:
- Phantom
- Solflare
- Backpack
- And more via Wallet Adapter

## Blockchain Interaction

All blockchain interactions use Anchor framework:

```typescript
import { useSolcityProgram } from '@/hooks/program/useSolcityProgram';

const { program } = useSolcityProgram();
const merchantPDA = getMerchantPDA(authority, loyaltyProgram);
const merchant = await program.account.merchant.fetch(merchantPDA);
```

## Styling

The app uses a custom design system with Tailwind CSS:

- **Colors**: Dark theme with accent color (#d0ff14)
- **Typography**: System fonts with custom tracking
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design approach

## Code Quality

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run type-check
```

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Write descriptive component documentation
4. Test wallet interactions on devnet first
5. Ensure responsive design
6. Run linting before committing

## Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel deploy
```

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Self-hosted

## Environment Variables

- `NEXT_PUBLIC_RPC_ENDPOINT`: Solana RPC endpoint URL
- `NEXT_PUBLIC_SOLANA_CLUSTER`: Cluster name (devnet/mainnet-beta)

## Troubleshooting

### Wallet Connection Issues
- Ensure wallet extension is installed
- Check network matches (devnet/mainnet)
- Clear browser cache and reconnect

### Transaction Failures
- Verify sufficient SOL for transaction fees
- Check program is deployed on correct network
- Ensure PDAs are derived correctly

### Build Errors
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

## Resources

- [Solcity Protocol Documentation](../solcity-protocol/README.md)
- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

## License

See [LICENSE](../LICENSE) file in the root directory.
