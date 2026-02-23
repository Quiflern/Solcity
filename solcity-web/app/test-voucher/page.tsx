"use client";

export default function TestVoucherPage() {
  // Sample data
  const voucher = {
    merchantName: "Solana Coffee",
    offerName: "50% Off",
    offerSubtitle: "Any Beverage",
    offerType: "Discount",
    code: "SLCY-A7B9-2K4M",
    expiry: "Dec 31, 2026",
    cost: "250 SLCY",
  };

  return (
    <div className="min-h-screen bg-[#050505] relative flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 z-[-2]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute w-[500px] h-[700px] z-[-1] blur-[60px] animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(208, 255, 20, 0.15) 0%, rgba(208, 255, 20, 0.0) 70%)',
        }}
      />

      {/* Voucher Card */}
      <div className="relative w-[400px] h-[600px] bg-[rgba(15,15,15,0.95)] rounded-[32px] p-8 flex flex-col justify-between overflow-hidden backdrop-blur-[10px]"
        style={{
          boxShadow: `
            inset 0 1px 0 0 rgba(255, 255, 255, 0.15),
            inset 0 0 0 1px rgba(255, 255, 255, 0.05),
            0 20px 50px -10px rgba(0, 0, 0, 0.8)
          `,
        }}
      >
        {/* Border gradient */}
        <div
          className="absolute inset-[-1px] rounded-[33px] pointer-events-none opacity-50"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.1), transparent 40%, #d0ff14)',
            padding: '1px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />

        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-[#d0ff14] shadow-[0_0_10px_#d0ff14]" />
              <span className="font-bold tracking-tight text-lg">SOLCITY</span>
            </div>
            <span className="text-[#888] text-[0.7rem] uppercase tracking-[0.15em] font-semibold mt-1">
              Proof of Redemption
            </span>
          </div>

          {/* Cost badge */}
          <div
            className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl px-4 py-2 flex flex-col items-end"
            style={{
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Cost</span>
            <span className="font-bold font-mono text-[0.85rem] text-[#d0ff14]" style={{ textShadow: '0 0 10px rgba(208, 255, 20, 0.3)' }}>
              {voucher.cost}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 mt-4">
          <div>
            <span className="text-[#888] text-[0.7rem] uppercase tracking-[0.15em] font-semibold block mb-2">
              Merchant
            </span>
            <h2 className="text-2xl font-medium text-white tracking-wide">
              {voucher.merchantName}
            </h2>
          </div>

          <div className="relative">
            {/* Accent bar */}
            <div
              className="absolute -left-8 w-1 h-full bg-[#d0ff14]"
              style={{ boxShadow: '0 0 15px #d0ff14' }}
            />
            <span className="text-[#888] text-[0.7rem] uppercase tracking-[0.15em] font-semibold block mb-1">
              Offer Details
            </span>
            <h1 className="text-4xl font-bold text-white leading-tight">
              {voucher.offerName}
              <br />
              <span className="text-gray-400">{voucher.offerSubtitle}</span>
            </h1>
          </div>
        </div>

        {/* Perforation */}
        <div
          className="w-full h-[1px] my-6 opacity-50"
          style={{
            backgroundImage: 'linear-gradient(to right, #333 50%, transparent 50%)',
            backgroundSize: '12px 1px',
            backgroundRepeat: 'repeat-x',
          }}
        />

        {/* Bottom section */}
        <div className="flex flex-row items-end justify-between">
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-[#888] text-[0.7rem] uppercase tracking-[0.15em] font-semibold block mb-1">
                Redemption Code
              </span>
              <div className="font-mono text-lg text-[#d0ff14] font-bold tracking-widest">
                {voucher.code}
              </div>
            </div>

            <div>
              <span className="text-[#888] text-[0.7rem] uppercase tracking-[0.15em] font-semibold block mb-1">
                Expires
              </span>
              <span className="text-[#eee] text-sm font-medium">{voucher.expiry}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="w-[100px] h-[100px] bg-white rounded-xl p-1.5 shadow-lg flex items-center justify-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(voucher.code)}`}
              alt="QR Code"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
