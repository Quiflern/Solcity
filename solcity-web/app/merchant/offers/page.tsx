"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRedemptionOffers, type RedemptionType } from "@/hooks/offers/useRedemptionOffers";
import { useMerchantRedemptionOffers } from "@/hooks/merchant/useMerchantRedemptionOffers";
import { useMerchantAccount } from "@/hooks/merchant/useMerchantAccount";
import { getLoyaltyProgramPDA, getMerchantPDA } from "@/lib/anchor/pdas";
import { toast } from "sonner";
import { BN } from "@coral-xyz/anchor";
import { Gift, Percent, Package, Coins, Ticket } from "lucide-react";
import { IconPicker } from "@/components/ui/IconPicker";
import { IconRenderer } from "@/contexts/IconPickerContext";
import Dropdown from "@/components/ui/Dropdown";
import Toggle from "@/components/ui/Toggle";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

type OfferType = "discount" | "product" | "cashback" | "exclusive" | "custom";

export default function MerchantOffersPage() {
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();
  const {
    createRedemptionOffer,
    updateRedemptionOffer,
    toggleRedemptionOffer,
    deleteRedemptionOffer,
    isLoading: mutationLoading
  } = useRedemptionOffers();
  const { merchantAccount, isLoading: merchantLoading, isRegistered } = useMerchantAccount();

  // Get merchant PDA to fetch offers
  const merchantPubkey = publicKey ? getMerchantPDA(publicKey, getLoyaltyProgramPDA(publicKey)[0])[0] : null;

  // Fetch offers from blockchain
  const { data: fetchedOffers = [], isLoading: offersLoading } = useMerchantRedemptionOffers(merchantPubkey);

  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);
  const [deletingOfferName, setDeletingOfferName] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    cost: "",
    offerType: "discount" as OfferType,
    customTypeName: "",
    discountPercentage: "",
    productId: "",
    cashbackAmount: "",
    accessType: "",
    quantityLimit: "",
    hasQuantityLimit: false,
    expiration: "",
    hasExpiration: false,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const offerType = buildOfferType();
      const cost = parseInt(formData.cost);
      const quantityLimit = formData.hasQuantityLimit ? parseInt(formData.quantityLimit) : undefined;
      const expiration = formData.hasExpiration
        ? Math.floor(new Date(formData.expiration).getTime() / 1000)
        : undefined;

      return await createRedemptionOffer({
        name: formData.name,
        description: formData.description,
        icon: formData.icon || "Gift",
        cost,
        offerType,
        quantityLimit,
        expiration,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchantRedemptionOffers"] });
      toast.success("Offer created successfully!");
      setShowModal(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create offer");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      // Only build offer type if the type-specific fields are filled
      let offerType: RedemptionType | undefined = undefined;

      if (formData.offerType === "discount" && formData.discountPercentage) {
        offerType = { discount: { percentage: parseInt(formData.discountPercentage) } };
      } else if (formData.offerType === "product" && formData.productId) {
        offerType = { freeProduct: { productId: formData.productId } };
      } else if (formData.offerType === "cashback" && formData.cashbackAmount) {
        offerType = { cashback: { amountLamports: new BN(formData.cashbackAmount) } };
      } else if (formData.offerType === "exclusive" && formData.accessType) {
        offerType = { exclusiveAccess: { accessType: formData.accessType } };
      } else if (formData.offerType === "custom" && formData.customTypeName) {
        offerType = { custom: { typeName: formData.customTypeName } };
      }

      const cost = formData.cost ? parseInt(formData.cost) : undefined;
      const quantityLimit = formData.hasQuantityLimit
        ? (formData.quantityLimit ? parseInt(formData.quantityLimit) : null)
        : undefined;
      const expiration = formData.hasExpiration
        ? (formData.expiration ? Math.floor(new Date(formData.expiration).getTime() / 1000) : null)
        : undefined;

      return await updateRedemptionOffer({
        name: editingOffer.name,
        description: formData.description || undefined,
        icon: formData.icon || undefined,
        cost,
        offerType,
        quantityLimit,
        expiration,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchantRedemptionOffers"] });
      toast.success("Offer updated successfully!");
      setShowModal(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update offer");
    },
  });

  // Toggle mutation
  const toggleMutation = useMutation({
    mutationFn: async (name: string) => {
      return await toggleRedemptionOffer(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchantRedemptionOffers"] });
      toast.success("Offer status updated!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to toggle offer");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (name: string) => {
      return await deleteRedemptionOffer(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchantRedemptionOffers"] });
      toast.success("Offer deleted successfully!");
      setShowDeleteModal(false);
      setDeletingOfferName(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete offer");
    },
  });

  const buildOfferType = (): RedemptionType => {
    switch (formData.offerType) {
      case "discount":
        return { discount: { percentage: parseInt(formData.discountPercentage) } };
      case "product":
        return { freeProduct: { productId: formData.productId } };
      case "cashback":
        return { cashback: { amountLamports: new BN(formData.cashbackAmount) } };
      case "exclusive":
        return { exclusiveAccess: { accessType: formData.accessType } };
      case "custom":
        return { custom: { typeName: formData.customTypeName } };
      default:
        return { discount: { percentage: 0 } };
    }
  };

  const openCreateModal = () => {
    setEditingOffer(null);
    setFormData({
      name: "",
      description: "",
      icon: "",
      cost: "",
      offerType: "discount",
      customTypeName: "",
      discountPercentage: "",
      productId: "",
      cashbackAmount: "",
      accessType: "",
      quantityLimit: "",
      hasQuantityLimit: false,
      expiration: "",
      hasExpiration: false,
    });
    setShowModal(true);
  };

  const openEditModal = (offer: any) => {
    setEditingOffer(offer);

    // Parse offer type
    let offerType: OfferType = "discount";
    let typeSpecificData: any = {};

    if ("discount" in offer.offerType) {
      offerType = "discount";
      typeSpecificData.discountPercentage = offer.offerType.discount.percentage.toString();
    } else if ("freeProduct" in offer.offerType) {
      offerType = "product";
      typeSpecificData.productId = offer.offerType.freeProduct.productId;
    } else if ("cashback" in offer.offerType) {
      offerType = "cashback";
      typeSpecificData.cashbackAmount = offer.offerType.cashback.amountLamports.toString();
    } else if ("exclusiveAccess" in offer.offerType) {
      offerType = "exclusive";
      typeSpecificData.accessType = offer.offerType.exclusiveAccess.accessType;
    } else if ("custom" in offer.offerType) {
      offerType = "custom";
      typeSpecificData.customTypeName = offer.offerType.custom.typeName;
    }

    setFormData({
      name: offer.name,
      description: offer.description,
      icon: offer.icon || "",
      cost: offer.cost.toString(),
      offerType,
      ...typeSpecificData,
      customTypeName: typeSpecificData.customTypeName || "",
      discountPercentage: typeSpecificData.discountPercentage || "",
      productId: typeSpecificData.productId || "",
      cashbackAmount: typeSpecificData.cashbackAmount || "",
      accessType: typeSpecificData.accessType || "",
      quantityLimit: offer.quantityLimit?.toString() || "",
      hasQuantityLimit: !!offer.quantityLimit,
      expiration: offer.expiration ? new Date(offer.expiration.toNumber() * 1000).toISOString().split("T")[0] : "",
      hasExpiration: !!offer.expiration,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingOffer) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleToggle = (name: string) => {
    toggleMutation.mutate(name);
  };

  const handleDelete = (name: string) => {
    setDeletingOfferName(name);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingOfferName) return;
    deleteMutation.mutate(deletingOfferName);
  };

  const getOfferTypeLabel = (offerType: any) => {
    if ("discount" in offerType) return "Discount %";
    if ("freeProduct" in offerType) return "Free Product";
    if ("cashback" in offerType) return "SOL Cashback";
    if ("exclusiveAccess" in offerType) return "Exclusive Access";
    if ("custom" in offerType) return offerType.custom.typeName;
    return "Unknown";
  };

  const getOfferTypeColor = (offerType: any) => {
    if ("discount" in offerType) return "bg-accent/10 text-accent border-accent/20";
    if ("freeProduct" in offerType) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if ("cashback" in offerType) return "bg-green-500/10 text-green-400 border-green-500/20";
    if ("exclusiveAccess" in offerType) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    if ("custom" in offerType) return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  const getStatusBadge = (offer: any) => {
    if (!offer.isActive) {
      return <span className="px-2 py-1 rounded text-xs bg-gray-500/10 text-gray-400 border border-gray-500/20">Inactive</span>;
    }

    if (offer.expiration && offer.expiration.toNumber() < Date.now() / 1000) {
      return <span className="px-2 py-1 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/20">Expired</span>;
    }

    if (offer.quantityLimit && offer.quantityClaimed >= offer.quantityLimit) {
      return <span className="px-2 py-1 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/20">Sold Out</span>;
    }

    return <span className="px-2 py-1 rounded text-xs bg-accent/10 text-accent border border-accent/20">Active</span>;
  };

  const isLoading = offersLoading || mutationLoading;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg-primary">
        <div className="max-w-[1400px] mx-auto px-8 py-12">
          {/* Show merchant not found message */}
          {!merchantLoading && !isRegistered && publicKey && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-panel border border-border rounded-xl p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-3">No Merchant Account Found</h2>
                <p className="text-text-secondary mb-8 max-w-md mx-auto">
                  You need to register as a merchant before you can create redemption offers. Register your business to get started with your loyalty program.
                </p>
                <a
                  href="/merchant/register"
                  className="inline-block bg-accent text-black px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
                >
                  Register as Merchant
                </a>
              </div>
            </div>
          )}

          {/* Show content only if merchant is registered */}
          {(merchantLoading || isRegistered) && (
            <>
              {/* Header */}
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h1 className="text-[2rem] font-bold mb-2">Redemption Offers</h1>
                  <p className="text-text-secondary">
                    Create and manage rewards that customers can redeem with their tokens
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreateModal}
                  disabled={isLoading}
                  className="bg-accent text-black px-6 py-3 rounded font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  + Create Offer
                </button>
              </div>

              {/* Loading State */}
              {offersLoading && (
                <div className="text-center py-16">
                  <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-text-secondary">Loading offers...</p>
                </div>
              )}

              {/* Offers Grid */}
              {!offersLoading && fetchedOffers.length === 0 ? (
                <div className="bg-panel border border-border rounded-xl p-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                    <Gift className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">No Offers Yet</h3>
                  <p className="text-text-secondary mb-8">
                    Create your first redemption offer to let customers redeem their tokens
                  </p>
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="bg-accent text-black px-8 py-3 rounded font-semibold hover:bg-accent/90 transition-colors"
                  >
                    Create First Offer
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {fetchedOffers.map((offer) => (
                    <div
                      key={offer.publicKey.toString()}
                      className="bg-panel border border-border rounded-xl p-6 hover:border-border-hover transition-colors"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded text-xs font-semibold border ${getOfferTypeColor(offer.offerType)}`}>
                          {getOfferTypeLabel(offer.offerType)}
                        </span>
                        {getStatusBadge(offer)}
                      </div>

                      {/* Icon */}
                      <div className="mb-4">
                        {offer.icon ? (
                          <IconRenderer icon={offer.icon} className="w-12 h-12 text-accent" />
                        ) : (
                          <Gift className="w-12 h-12 text-accent" />
                        )}
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-semibold mb-2">{offer.name}</h3>
                      <p className="text-sm text-text-secondary mb-6 line-clamp-2">
                        {offer.description}
                      </p>

                      {/* Cost */}
                      <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-border">
                        <span className="text-2xl font-bold text-accent">{offer.cost.toString()}</span>
                        <span className="text-sm text-text-secondary">SLCY</span>
                      </div>

                      {/* Stats */}
                      <div className="space-y-3 mb-6">
                        {offer.quantityLimit && (
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Claimed</span>
                            <span className="font-medium">
                              {offer.quantityClaimed.toString()} / {offer.quantityLimit.toString()}
                            </span>
                          </div>
                        )}
                        {offer.expiration && (
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Expires</span>
                            <span className="font-medium">
                              {new Date(offer.expiration.toNumber() * 1000).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(offer)}
                          disabled={isLoading}
                          className="flex-1 px-4 py-2 rounded border border-border hover:border-accent hover:bg-accent/5 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(offer.name)}
                          disabled={isLoading}
                          className={`flex-1 px-4 py-2 rounded border text-sm font-medium transition-colors disabled:opacity-50 ${offer.isActive
                            ? "border-orange-500/20 text-orange-400 hover:bg-orange-500/10"
                            : "border-accent/20 text-accent hover:bg-accent/10"
                            }`}
                        >
                          {offer.isActive ? "Pause" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(offer.name)}
                          disabled={isLoading}
                          className="px-4 py-2 rounded border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create/Edit Modal */}
              {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-8">
                  <div className="bg-panel border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-8">
                      <h2 className="text-2xl font-bold mb-6">
                        {editingOffer ? "Edit Offer" : "Create New Offer"}
                      </h2>

                      <div className="space-y-6">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Offer Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., 50% Off Any Beverage"
                            disabled={!!editingOffer}
                            className="w-full bg-bg-primary border border-border rounded px-4 py-3 focus:outline-none focus:border-accent disabled:opacity-50"
                          />
                          {editingOffer && (
                            <p className="text-xs text-text-secondary mt-1">Name cannot be changed after creation</p>
                          )}
                        </div>

                        {/* Icon and Cost - Side by Side */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <IconPicker
                              label="Offer Icon"
                              value={formData.icon}
                              onChange={(iconName) => setFormData({ ...formData, icon: iconName })}
                              placeholder="Select an icon"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Cost (SLCY Tokens)</label>
                            <input
                              type="number"
                              value={formData.cost}
                              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                              placeholder="250"
                              className="w-full bg-bg-primary border border-border rounded px-4 py-3 focus:outline-none focus:border-accent"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe what customers get with this offer"
                            rows={3}
                            className="w-full bg-bg-primary border border-border rounded px-4 py-3 focus:outline-none focus:border-accent resize-none"
                          />
                        </div>

                        {/* Offer Type */}
                        <Dropdown
                          label="Offer Type"
                          value={formData.offerType}
                          onChange={(value) => setFormData({ ...formData, offerType: value as OfferType })}
                          options={[
                            {
                              value: "discount",
                              label: "Discount %",
                              icon: <Percent className="w-4 h-4" />
                            },
                            {
                              value: "product",
                              label: "Free Product",
                              icon: <Package className="w-4 h-4" />
                            },
                            {
                              value: "cashback",
                              label: "SOL Cashback",
                              icon: <Coins className="w-4 h-4" />
                            },
                            {
                              value: "exclusive",
                              label: "Exclusive Access",
                              icon: <Ticket className="w-4 h-4" />
                            },
                            {
                              value: "custom",
                              label: "Custom",
                              icon: <Gift className="w-4 h-4" />
                            },
                          ]}
                        />

                        {/* Type-specific fields */}
                        {formData.offerType === "discount" && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Discount Percentage</label>
                            <input
                              type="number"
                              value={formData.discountPercentage}
                              onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                              placeholder="50"
                              className="w-full bg-bg-primary border border-border rounded px-4 py-3 focus:outline-none focus:border-accent"
                            />
                          </div>
                        )}

                        {formData.offerType === "product" && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Product ID</label>
                            <input
                              type="text"
                              value={formData.productId}
                              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                              placeholder="PROD-001"
                              className="w-full bg-bg-primary border border-border rounded px-4 py-3 focus:outline-none focus:border-accent"
                            />
                          </div>
                        )}

                        {formData.offerType === "cashback" && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Cashback Amount (Lamports)</label>
                            <input
                              type="number"
                              value={formData.cashbackAmount}
                              onChange={(e) => setFormData({ ...formData, cashbackAmount: e.target.value })}
                              placeholder="1000000"
                              className="w-full bg-bg-primary border border-border rounded px-4 py-3 focus:outline-none focus:border-accent"
                            />
                            <p className="text-xs text-text-secondary mt-1">1 SOL = 1,000,000,000 lamports</p>
                          </div>
                        )}

                        {formData.offerType === "exclusive" && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Access Type</label>
                            <input
                              type="text"
                              value={formData.accessType}
                              onChange={(e) => setFormData({ ...formData, accessType: e.target.value })}
                              placeholder="VIP Lounge Access"
                              className="w-full bg-bg-primary border border-border rounded px-4 py-3 focus:outline-none focus:border-accent"
                            />
                          </div>
                        )}

                        {formData.offerType === "custom" && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Custom Type Name</label>
                            <input
                              type="text"
                              value={formData.customTypeName}
                              onChange={(e) => setFormData({ ...formData, customTypeName: e.target.value })}
                              placeholder="e.g., VIP Access, Gift Card"
                              className="w-full bg-bg-primary border border-border rounded px-4 py-3 focus:outline-none focus:border-accent"
                            />
                          </div>
                        )}

                        {/* Quantity Limit */}
                        <div>
                          <Toggle
                            label="Set Quantity Limit"
                            checked={formData.hasQuantityLimit}
                            onChange={(e) => setFormData({ ...formData, hasQuantityLimit: e.target.checked })}
                            className="mb-3"
                          />
                          {formData.hasQuantityLimit && (
                            <input
                              type="number"
                              value={formData.quantityLimit}
                              onChange={(e) => setFormData({ ...formData, quantityLimit: e.target.value })}
                              placeholder="100"
                              className="w-full bg-bg-primary border border-border rounded px-4 py-3 focus:outline-none focus:border-accent"
                            />
                          )}
                        </div>

                        {/* Expiration */}
                        <div>
                          <Toggle
                            label="Set Expiration Date"
                            checked={formData.hasExpiration}
                            onChange={(e) => setFormData({ ...formData, hasExpiration: e.target.checked })}
                            className="mb-3"
                          />
                          {formData.hasExpiration && (
                            <input
                              type="date"
                              value={formData.expiration}
                              onChange={(e) => setFormData({ ...formData, expiration: e.target.value })}
                              className="w-full bg-bg-primary border border-border rounded px-4 py-3 focus:outline-none focus:border-accent"
                            />
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-4 mt-8">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          disabled={isLoading}
                          className="flex-1 px-6 py-3 rounded border border-border hover:bg-white/5 font-medium transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={isLoading}
                          className="flex-1 px-6 py-3 rounded bg-accent text-black font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? "Processing..." : editingOffer ? "Update Offer" : "Create Offer"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Confirmation Modal */}
              <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                  setShowDeleteModal(false);
                  setDeletingOfferName(null);
                }}
                title="Delete Redemption Offer"
              >
                <div className="space-y-4">
                  <p className="text-text-secondary">
                    Are you sure you want to delete this offer? This action cannot be undone and will permanently remove the offer from the blockchain.
                  </p>
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="primary"
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      onClick={confirmDelete}
                      isLoading={isLoading}
                    >
                      Delete Offer
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeletingOfferName(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Modal>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
