/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solcity_protocol.json`.
 */
export type SolcityProtocol = {
  "address": "67XD1wBu5Ja1H5e4Zg4vsjZDoAcB8KwTZqawodZZwqv9",
  "metadata": {
    "name": "solcityProtocol",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "closeMerchant",
      "docs": [
        "Close merchant account and refund rent"
      ],
      "discriminator": [
        138,
        96,
        102,
        11,
        220,
        136,
        154,
        11
      ],
      "accounts": [
        {
          "name": "merchantAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "merchant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  114,
                  99,
                  104,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "merchantAuthority"
              },
              {
                "kind": "account",
                "path": "merchant.loyalty_program",
                "account": "merchant"
              }
            ]
          }
        },
        {
          "name": "loyaltyProgram",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  121,
                  97,
                  108,
                  116,
                  121,
                  95,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "loyalty_program.authority",
                "account": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createRedemptionOffer",
      "docs": [
        "Create a new redemption offer"
      ],
      "discriminator": [
        223,
        213,
        30,
        63,
        33,
        2,
        55,
        110
      ],
      "accounts": [
        {
          "name": "merchantAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "merchant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  114,
                  99,
                  104,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "merchantAuthority"
              },
              {
                "kind": "account",
                "path": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "loyaltyProgram",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  121,
                  97,
                  108,
                  116,
                  121,
                  95,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "loyalty_program.authority",
                "account": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "redemptionOffer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  100,
                  101,
                  109,
                  112,
                  116,
                  105,
                  111,
                  110,
                  95,
                  111,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "merchant"
              },
              {
                "kind": "arg",
                "path": "name"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "icon",
          "type": "string"
        },
        {
          "name": "cost",
          "type": "u64"
        },
        {
          "name": "offerType",
          "type": {
            "defined": {
              "name": "redemptionType"
            }
          }
        },
        {
          "name": "quantityLimit",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "expiration",
          "type": {
            "option": "i64"
          }
        }
      ]
    },
    {
      "name": "deleteRedemptionOffer",
      "docs": [
        "Delete a redemption offer"
      ],
      "discriminator": [
        167,
        67,
        62,
        130,
        161,
        93,
        6,
        209
      ],
      "accounts": [
        {
          "name": "merchantAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "merchant",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  114,
                  99,
                  104,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "merchantAuthority"
              },
              {
                "kind": "account",
                "path": "merchant.loyalty_program",
                "account": "merchant"
              }
            ]
          }
        },
        {
          "name": "redemptionOffer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  100,
                  101,
                  109,
                  112,
                  116,
                  105,
                  111,
                  110,
                  95,
                  111,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "merchant"
              },
              {
                "kind": "account",
                "path": "redemption_offer.name",
                "account": "redemptionOffer"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "deleteRewardRule",
      "docs": [
        "Delete a reward rule"
      ],
      "discriminator": [
        192,
        103,
        154,
        158,
        160,
        197,
        26,
        93
      ],
      "accounts": [
        {
          "name": "merchantAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "loyaltyProgram",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  121,
                  97,
                  108,
                  116,
                  121,
                  95,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "merchantAuthority"
              }
            ]
          }
        },
        {
          "name": "merchant",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  114,
                  99,
                  104,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "merchantAuthority"
              },
              {
                "kind": "account",
                "path": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "rewardRule",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  95,
                  114,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "merchant"
              },
              {
                "kind": "arg",
                "path": "ruleId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "ruleId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeProgram",
      "docs": [
        "Initialize a new loyalty program with Token-2022 mint"
      ],
      "discriminator": [
        176,
        107,
        205,
        168,
        24,
        157,
        175,
        103
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "loyaltyProgram",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  121,
                  97,
                  108,
                  116,
                  121,
                  95,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "mint",
          "docs": [
            "Token-2022 mint (will be initialized with extensions)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "interestRate",
          "type": {
            "option": "i16"
          }
        }
      ]
    },
    {
      "name": "issueRewards",
      "docs": [
        "Issue reward tokens to a customer for a purchase"
      ],
      "discriminator": [
        24,
        142,
        183,
        139,
        237,
        43,
        240,
        229
      ],
      "accounts": [
        {
          "name": "merchantAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "merchant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  114,
                  99,
                  104,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "merchantAuthority"
              },
              {
                "kind": "account",
                "path": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "customer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  115,
                  116,
                  111,
                  109,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "customer.wallet",
                "account": "customer"
              },
              {
                "kind": "account",
                "path": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "loyaltyProgram",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  121,
                  97,
                  108,
                  116,
                  121,
                  95,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "loyalty_program.authority",
                "account": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "customerTokenAccount",
          "writable": true
        },
        {
          "name": "transactionRecord",
          "docs": [
            "Transaction record to store this transaction"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  110,
                  115,
                  97,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "customer.wallet",
                "account": "customer"
              },
              {
                "kind": "account",
                "path": "customer.transaction_count",
                "account": "customer"
              }
            ]
          }
        },
        {
          "name": "merchantCustomerRecord",
          "docs": [
            "Merchant-Customer relationship record"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  114,
                  99,
                  104,
                  97,
                  110,
                  116,
                  95,
                  99,
                  117,
                  115,
                  116,
                  111,
                  109,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "merchant"
              },
              {
                "kind": "account",
                "path": "customer.wallet",
                "account": "customer"
              }
            ]
          }
        },
        {
          "name": "rewardRule",
          "docs": [
            "Optional reward rule to apply"
          ]
        },
        {
          "name": "platformTreasury",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "purchaseAmount",
          "type": "u64"
        },
        {
          "name": "ruleId",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "redeemRewards",
      "docs": [
        "Redeem reward tokens for benefits"
      ],
      "discriminator": [
        78,
        170,
        139,
        171,
        145,
        182,
        60,
        55
      ],
      "accounts": [
        {
          "name": "customerAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "customer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  115,
                  116,
                  111,
                  109,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "customerAuthority"
              },
              {
                "kind": "account",
                "path": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "merchant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  114,
                  99,
                  104,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "merchant.authority",
                "account": "merchant"
              },
              {
                "kind": "account",
                "path": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "loyaltyProgram",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  121,
                  97,
                  108,
                  116,
                  121,
                  95,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "loyalty_program.authority",
                "account": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "customerTokenAccount",
          "writable": true
        },
        {
          "name": "redemptionOffer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  100,
                  101,
                  109,
                  112,
                  116,
                  105,
                  111,
                  110,
                  95,
                  111,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "merchant"
              },
              {
                "kind": "account",
                "path": "redemption_offer.name",
                "account": "redemptionOffer"
              }
            ]
          }
        },
        {
          "name": "voucher",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  117,
                  99,
                  104,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "customerAuthority"
              },
              {
                "kind": "account",
                "path": "merchant"
              },
              {
                "kind": "account",
                "path": "redemptionOffer"
              },
              {
                "kind": "arg",
                "path": "voucherSeed"
              }
            ]
          }
        },
        {
          "name": "transactionRecord",
          "docs": [
            "Transaction record to store this redemption"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  110,
                  115,
                  97,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "customerAuthority"
              },
              {
                "kind": "account",
                "path": "customer.transaction_count",
                "account": "customer"
              }
            ]
          }
        },
        {
          "name": "merchantCustomerRecord",
          "docs": [
            "Merchant-Customer relationship record"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  114,
                  99,
                  104,
                  97,
                  110,
                  116,
                  95,
                  99,
                  117,
                  115,
                  116,
                  111,
                  109,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "merchant"
              },
              {
                "kind": "account",
                "path": "customerAuthority"
              }
            ]
          }
        },
        {
          "name": "offerRedemptionRecord",
          "docs": [
            "Offer redemption record for analytics"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  102,
                  102,
                  101,
                  114,
                  95,
                  114,
                  101,
                  100,
                  101,
                  109,
                  112,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "redemptionOffer"
              },
              {
                "kind": "account",
                "path": "customerAuthority"
              },
              {
                "kind": "arg",
                "path": "voucherSeed"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "voucherSeed",
          "type": "u64"
        }
      ]
    },
    {
      "name": "registerCustomer",
      "docs": [
        "Register a new customer in the loyalty program"
      ],
      "discriminator": [
        211,
        203,
        193,
        164,
        198,
        246,
        27,
        223
      ],
      "accounts": [
        {
          "name": "customerAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "customer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  115,
                  116,
                  111,
                  109,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "customerAuthority"
              },
              {
                "kind": "account",
                "path": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "loyaltyProgram",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  121,
                  97,
                  108,
                  116,
                  121,
                  95,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "loyalty_program.authority",
                "account": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "mint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "customerTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "customerAuthority"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "registerMerchant",
      "docs": [
        "Register a new merchant in the loyalty program"
      ],
      "discriminator": [
        238,
        245,
        77,
        132,
        161,
        88,
        216,
        248
      ],
      "accounts": [
        {
          "name": "merchantAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "merchant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  114,
                  99,
                  104,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "merchantAuthority"
              },
              {
                "kind": "account",
                "path": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "loyaltyProgram",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  121,
                  97,
                  108,
                  116,
                  121,
                  95,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "loyalty_program.authority",
                "account": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "platformTreasury",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "avatarUrl",
          "type": "string"
        },
        {
          "name": "category",
          "type": "string"
        },
        {
          "name": "description",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "rewardRate",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setRewardRule",
      "docs": [
        "Create a new reward rule for a merchant"
      ],
      "discriminator": [
        0,
        90,
        48,
        132,
        97,
        193,
        233,
        162
      ],
      "accounts": [
        {
          "name": "merchantAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "loyaltyProgram",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  121,
                  97,
                  108,
                  116,
                  121,
                  95,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "merchantAuthority"
              }
            ]
          }
        },
        {
          "name": "merchant",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  114,
                  99,
                  104,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "merchantAuthority"
              },
              {
                "kind": "account",
                "path": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "rewardRule",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  95,
                  114,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "merchant"
              },
              {
                "kind": "arg",
                "path": "ruleId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "ruleId",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "ruleType",
          "type": {
            "defined": {
              "name": "ruleType"
            }
          }
        },
        {
          "name": "multiplier",
          "type": "u64"
        },
        {
          "name": "minPurchase",
          "type": "u64"
        },
        {
          "name": "startTime",
          "type": "i64"
        },
        {
          "name": "endTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "toggleRedemptionOffer",
      "docs": [
        "Toggle redemption offer active status"
      ],
      "discriminator": [
        9,
        77,
        124,
        55,
        128,
        82,
        112,
        39
      ],
      "accounts": [
        {
          "name": "merchantAuthority",
          "signer": true
        },
        {
          "name": "merchant",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  114,
                  99,
                  104,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "merchantAuthority"
              },
              {
                "kind": "account",
                "path": "merchant.loyalty_program",
                "account": "merchant"
              }
            ]
          }
        },
        {
          "name": "redemptionOffer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  100,
                  101,
                  109,
                  112,
                  116,
                  105,
                  111,
                  110,
                  95,
                  111,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "merchant"
              },
              {
                "kind": "account",
                "path": "redemption_offer.name",
                "account": "redemptionOffer"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "toggleRewardRule",
      "docs": [
        "Toggle reward rule active status (pause/unpause)"
      ],
      "discriminator": [
        58,
        154,
        233,
        17,
        232,
        236,
        177,
        117
      ],
      "accounts": [
        {
          "name": "merchantAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "loyaltyProgram",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  121,
                  97,
                  108,
                  116,
                  121,
                  95,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "merchantAuthority"
              }
            ]
          }
        },
        {
          "name": "merchant",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  114,
                  99,
                  104,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "merchantAuthority"
              },
              {
                "kind": "account",
                "path": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "rewardRule",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  95,
                  114,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "merchant"
              },
              {
                "kind": "arg",
                "path": "ruleId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "ruleId",
          "type": "u64"
        },
        {
          "name": "isActive",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateMerchant",
      "docs": [
        "Update merchant settings"
      ],
      "discriminator": [
        192,
        114,
        143,
        220,
        199,
        50,
        234,
        165
      ],
      "accounts": [
        {
          "name": "merchantAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "merchant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  114,
                  99,
                  104,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "merchantAuthority"
              },
              {
                "kind": "account",
                "path": "merchant.loyalty_program",
                "account": "merchant"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newRewardRate",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "description",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "avatarUrl",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "category",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "isActive",
          "type": {
            "option": "bool"
          }
        }
      ]
    },
    {
      "name": "updateRedemptionOffer",
      "docs": [
        "Update an existing redemption offer"
      ],
      "discriminator": [
        196,
        111,
        172,
        50,
        66,
        99,
        84,
        230
      ],
      "accounts": [
        {
          "name": "merchantAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "merchant",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  114,
                  99,
                  104,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "merchantAuthority"
              },
              {
                "kind": "account",
                "path": "merchant.loyalty_program",
                "account": "merchant"
              }
            ]
          }
        },
        {
          "name": "redemptionOffer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  100,
                  101,
                  109,
                  112,
                  116,
                  105,
                  111,
                  110,
                  95,
                  111,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "merchant"
              },
              {
                "kind": "account",
                "path": "redemption_offer.name",
                "account": "redemptionOffer"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "description",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "icon",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "cost",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "offerType",
          "type": {
            "option": {
              "defined": {
                "name": "redemptionType"
              }
            }
          }
        },
        {
          "name": "quantityLimit",
          "type": {
            "option": {
              "option": "u64"
            }
          }
        },
        {
          "name": "expiration",
          "type": {
            "option": {
              "option": "i64"
            }
          }
        }
      ]
    },
    {
      "name": "updateRewardRule",
      "docs": [
        "Update an existing reward rule"
      ],
      "discriminator": [
        233,
        106,
        76,
        105,
        171,
        218,
        108,
        82
      ],
      "accounts": [
        {
          "name": "merchantAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "loyaltyProgram",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  121,
                  97,
                  108,
                  116,
                  121,
                  95,
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "merchantAuthority"
              }
            ]
          }
        },
        {
          "name": "merchant",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  114,
                  99,
                  104,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "merchantAuthority"
              },
              {
                "kind": "account",
                "path": "loyaltyProgram"
              }
            ]
          }
        },
        {
          "name": "rewardRule",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  95,
                  114,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "merchant"
              },
              {
                "kind": "arg",
                "path": "ruleId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "ruleId",
          "type": "u64"
        },
        {
          "name": "name",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "ruleType",
          "type": {
            "option": {
              "defined": {
                "name": "ruleType"
              }
            }
          }
        },
        {
          "name": "multiplier",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "minPurchase",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "startTime",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "endTime",
          "type": {
            "option": "i64"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "customer",
      "discriminator": [
        112,
        147,
        140,
        31,
        93,
        186,
        103,
        18
      ]
    },
    {
      "name": "loyaltyProgram",
      "discriminator": [
        170,
        241,
        228,
        176,
        113,
        205,
        130,
        222
      ]
    },
    {
      "name": "merchant",
      "discriminator": [
        71,
        235,
        30,
        40,
        231,
        21,
        32,
        64
      ]
    },
    {
      "name": "merchantCustomerRecord",
      "discriminator": [
        88,
        10,
        55,
        158,
        244,
        235,
        195,
        95
      ]
    },
    {
      "name": "offerRedemptionRecord",
      "discriminator": [
        208,
        32,
        155,
        183,
        75,
        239,
        84,
        206
      ]
    },
    {
      "name": "redemptionOffer",
      "discriminator": [
        170,
        229,
        178,
        15,
        184,
        107,
        140,
        41
      ]
    },
    {
      "name": "redemptionVoucher",
      "discriminator": [
        176,
        213,
        178,
        105,
        46,
        53,
        242,
        23
      ]
    },
    {
      "name": "rewardRule",
      "discriminator": [
        22,
        164,
        39,
        113,
        89,
        95,
        251,
        83
      ]
    },
    {
      "name": "transactionRecord",
      "discriminator": [
        206,
        23,
        5,
        97,
        161,
        157,
        25,
        107
      ]
    }
  ],
  "events": [
    {
      "name": "customerRegisteredEvent",
      "discriminator": [
        179,
        112,
        191,
        211,
        102,
        24,
        216,
        135
      ]
    },
    {
      "name": "merchantRegisteredEvent",
      "discriminator": [
        82,
        74,
        214,
        141,
        55,
        182,
        57,
        95
      ]
    },
    {
      "name": "merchantUpdatedEvent",
      "discriminator": [
        223,
        197,
        196,
        11,
        71,
        228,
        75,
        71
      ]
    },
    {
      "name": "redemptionOfferEvent",
      "discriminator": [
        65,
        63,
        245,
        109,
        105,
        188,
        126,
        177
      ]
    },
    {
      "name": "rewardRuleEvent",
      "discriminator": [
        104,
        22,
        243,
        254,
        78,
        82,
        127,
        121
      ]
    },
    {
      "name": "rewardsIssuedEvent",
      "discriminator": [
        241,
        65,
        191,
        37,
        211,
        229,
        243,
        114
      ]
    },
    {
      "name": "rewardsRedeemedEvent",
      "discriminator": [
        49,
        161,
        159,
        143,
        15,
        91,
        224,
        105
      ]
    },
    {
      "name": "tierUpgradeEvent",
      "discriminator": [
        25,
        131,
        86,
        164,
        15,
        77,
        84,
        202
      ]
    },
    {
      "name": "voucherUsedEvent",
      "discriminator": [
        97,
        138,
        157,
        61,
        6,
        211,
        111,
        236
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientBalance",
      "msg": "Insufficient token balance for redemption"
    },
    {
      "code": 6001,
      "name": "merchantNotActive",
      "msg": "Merchant account is not active"
    },
    {
      "code": 6002,
      "name": "invalidRewardAmount",
      "msg": "Invalid reward amount"
    },
    {
      "code": 6003,
      "name": "overflow",
      "msg": "Arithmetic overflow in calculation"
    },
    {
      "code": 6004,
      "name": "invalidTier",
      "msg": "Invalid customer tier"
    },
    {
      "code": 6005,
      "name": "ruleNotActive",
      "msg": "Reward rule is not active"
    },
    {
      "code": 6006,
      "name": "invalidTimeRange",
      "msg": "Invalid time range for reward rule"
    },
    {
      "code": 6007,
      "name": "nameTooLong",
      "msg": "Name exceeds maximum length"
    },
    {
      "code": 6008,
      "name": "nameEmpty",
      "msg": "Name cannot be empty"
    },
    {
      "code": 6009,
      "name": "invalidInterestRate",
      "msg": "Invalid interest rate"
    },
    {
      "code": 6010,
      "name": "unauthorizedAccess",
      "msg": "Unauthorized access to account"
    },
    {
      "code": 6011,
      "name": "invalidMint",
      "msg": "Invalid mint for token account"
    },
    {
      "code": 6012,
      "name": "invalidTreasury",
      "msg": "Invalid platform treasury account"
    },
    {
      "code": 6013,
      "name": "offerNotAvailable",
      "msg": "Redemption offer is not available (expired, sold out, or inactive)"
    },
    {
      "code": 6014,
      "name": "merchantHasActiveRules",
      "msg": "Merchant has active reward rules. Delete all rules before closing account."
    }
  ],
  "types": [
    {
      "name": "customer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "docs": [
              "Customer wallet address"
            ],
            "type": "pubkey"
          },
          {
            "name": "loyaltyProgram",
            "docs": [
              "Associated loyalty program"
            ],
            "type": "pubkey"
          },
          {
            "name": "totalEarned",
            "docs": [
              "Lifetime tokens earned"
            ],
            "type": "u64"
          },
          {
            "name": "totalRedeemed",
            "docs": [
              "Lifetime tokens redeemed"
            ],
            "type": "u64"
          },
          {
            "name": "tier",
            "docs": [
              "Current tier"
            ],
            "type": {
              "defined": {
                "name": "customerTier"
              }
            }
          },
          {
            "name": "transactionCount",
            "docs": [
              "Number of transactions"
            ],
            "type": "u64"
          },
          {
            "name": "streakDays",
            "docs": [
              "Consecutive days active"
            ],
            "type": "u16"
          },
          {
            "name": "lastActivity",
            "docs": [
              "Last activity timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "joinedAt",
            "docs": [
              "Registration timestamp"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "customerRegisteredEvent",
      "docs": [
        "Event emitted when a customer registers"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "customer",
            "type": "pubkey"
          },
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "merchant",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "customerTier",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "bronze"
          },
          {
            "name": "silver"
          },
          {
            "name": "gold"
          },
          {
            "name": "platinum"
          }
        ]
      }
    },
    {
      "name": "loyaltyProgram",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Program authority (admin)"
            ],
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "docs": [
              "Platform treasury for collecting fees"
            ],
            "type": "pubkey"
          },
          {
            "name": "mint",
            "docs": [
              "SPL Token-2022 mint address"
            ],
            "type": "pubkey"
          },
          {
            "name": "name",
            "docs": [
              "Program name (32 bytes)"
            ],
            "type": "string"
          },
          {
            "name": "totalMerchants",
            "docs": [
              "Total registered merchants"
            ],
            "type": "u64"
          },
          {
            "name": "totalCustomers",
            "docs": [
              "Total registered customers"
            ],
            "type": "u64"
          },
          {
            "name": "totalTokensIssued",
            "docs": [
              "Total tokens ever minted"
            ],
            "type": "u64"
          },
          {
            "name": "totalTokensRedeemed",
            "docs": [
              "Total tokens ever burned"
            ],
            "type": "u64"
          },
          {
            "name": "totalFeesCollected",
            "docs": [
              "Total fees collected (in lamports)"
            ],
            "type": "u64"
          },
          {
            "name": "interestRate",
            "docs": [
              "Interest rate in basis points (500 = 5%)"
            ],
            "type": "i16"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation timestamp"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "merchant",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Merchant wallet address"
            ],
            "type": "pubkey"
          },
          {
            "name": "loyaltyProgram",
            "docs": [
              "Associated loyalty program"
            ],
            "type": "pubkey"
          },
          {
            "name": "name",
            "docs": [
              "Business name (32 bytes)"
            ],
            "type": "string"
          },
          {
            "name": "description",
            "docs": [
              "Business description (256 bytes)"
            ],
            "type": "string"
          },
          {
            "name": "avatarUrl",
            "docs": [
              "Avatar URL (256 bytes)"
            ],
            "type": "string"
          },
          {
            "name": "category",
            "docs": [
              "Business category (32 bytes)"
            ],
            "type": "string"
          },
          {
            "name": "rewardRate",
            "docs": [
              "Tokens per dollar spent (e.g., 10 = 10 tokens per $1)"
            ],
            "type": "u64"
          },
          {
            "name": "totalIssued",
            "docs": [
              "Total tokens issued by this merchant"
            ],
            "type": "u64"
          },
          {
            "name": "totalRedeemed",
            "docs": [
              "Total tokens redeemed at this merchant"
            ],
            "type": "u64"
          },
          {
            "name": "isActive",
            "docs": [
              "Active status"
            ],
            "type": "bool"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          },
          {
            "name": "createdAt",
            "docs": [
              "Registration timestamp"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "merchantCustomerRecord",
      "docs": [
        "Tracks relationship between merchant and customer",
        "One record per merchant-customer pair"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "merchant",
            "docs": [
              "Merchant pubkey"
            ],
            "type": "pubkey"
          },
          {
            "name": "customer",
            "docs": [
              "Customer wallet"
            ],
            "type": "pubkey"
          },
          {
            "name": "totalIssued",
            "docs": [
              "Total tokens issued to this customer by this merchant"
            ],
            "type": "u64"
          },
          {
            "name": "totalRedeemed",
            "docs": [
              "Total tokens redeemed by this customer at this merchant"
            ],
            "type": "u64"
          },
          {
            "name": "transactionCount",
            "docs": [
              "Number of transactions (earn + redeem)"
            ],
            "type": "u64"
          },
          {
            "name": "firstTransaction",
            "docs": [
              "First transaction timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "lastTransaction",
            "docs": [
              "Last transaction timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "merchantRegisteredEvent",
      "docs": [
        "Event emitted when a merchant registers"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "merchant",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "rewardRate",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "merchantUpdatedEvent",
      "docs": [
        "Event emitted when a merchant profile is updated"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "merchant",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "rewardRate",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "offerRedemptionRecord",
      "docs": [
        "Tracks individual redemptions of offers",
        "Allows merchants to see who redeemed what and when"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "offer",
            "docs": [
              "Redemption offer that was redeemed"
            ],
            "type": "pubkey"
          },
          {
            "name": "merchant",
            "docs": [
              "Merchant who owns the offer"
            ],
            "type": "pubkey"
          },
          {
            "name": "customer",
            "docs": [
              "Customer who redeemed"
            ],
            "type": "pubkey"
          },
          {
            "name": "voucher",
            "docs": [
              "Voucher created"
            ],
            "type": "pubkey"
          },
          {
            "name": "amount",
            "docs": [
              "Amount of tokens spent"
            ],
            "type": "u64"
          },
          {
            "name": "timestamp",
            "docs": [
              "Timestamp of redemption"
            ],
            "type": "i64"
          },
          {
            "name": "isUsed",
            "docs": [
              "Whether voucher has been used"
            ],
            "type": "bool"
          },
          {
            "name": "usedAt",
            "docs": [
              "When voucher was used (if applicable)"
            ],
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "redemptionOffer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "merchant",
            "type": "pubkey"
          },
          {
            "name": "loyaltyProgram",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "icon",
            "type": "string"
          },
          {
            "name": "cost",
            "type": "u64"
          },
          {
            "name": "offerType",
            "type": {
              "defined": {
                "name": "redemptionType"
              }
            }
          },
          {
            "name": "quantityLimit",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "quantityClaimed",
            "type": "u64"
          },
          {
            "name": "expiration",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "redemptionOfferEvent",
      "docs": [
        "Event emitted when a redemption offer is created or updated"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "merchant",
            "type": "pubkey"
          },
          {
            "name": "offer",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "cost",
            "type": "u64"
          },
          {
            "name": "offerType",
            "type": {
              "defined": {
                "name": "redemptionType"
              }
            }
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "quantityAvailable",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "quantityClaimed",
            "type": "u64"
          },
          {
            "name": "action",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "redemptionType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "discount",
            "fields": [
              {
                "name": "percentage",
                "type": "u8"
              }
            ]
          },
          {
            "name": "freeProduct",
            "fields": [
              {
                "name": "productId",
                "type": "string"
              }
            ]
          },
          {
            "name": "cashback",
            "fields": [
              {
                "name": "amountLamports",
                "type": "u64"
              }
            ]
          },
          {
            "name": "exclusiveAccess",
            "fields": [
              {
                "name": "accessType",
                "type": "string"
              }
            ]
          },
          {
            "name": "custom",
            "fields": [
              {
                "name": "typeName",
                "type": "string"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "redemptionVoucher",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "customer",
            "type": "pubkey"
          },
          {
            "name": "merchant",
            "type": "pubkey"
          },
          {
            "name": "redemptionOffer",
            "type": "pubkey"
          },
          {
            "name": "merchantName",
            "type": "string"
          },
          {
            "name": "offerName",
            "type": "string"
          },
          {
            "name": "offerDescription",
            "type": "string"
          },
          {
            "name": "cost",
            "type": "u64"
          },
          {
            "name": "redemptionCode",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          },
          {
            "name": "isUsed",
            "type": "bool"
          },
          {
            "name": "usedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "rewardRule",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "merchant",
            "docs": [
              "Associated merchant"
            ],
            "type": "pubkey"
          },
          {
            "name": "ruleId",
            "docs": [
              "Rule ID (used in PDA derivation)"
            ],
            "type": "u64"
          },
          {
            "name": "name",
            "docs": [
              "Rule name (32 bytes)"
            ],
            "type": "string"
          },
          {
            "name": "ruleType",
            "docs": [
              "Rule type"
            ],
            "type": {
              "defined": {
                "name": "ruleType"
              }
            }
          },
          {
            "name": "multiplier",
            "docs": [
              "Bonus multiplier (100 = 1x, 200 = 2x)"
            ],
            "type": "u64"
          },
          {
            "name": "minPurchase",
            "docs": [
              "Minimum purchase to trigger (in cents)"
            ],
            "type": "u64"
          },
          {
            "name": "isActive",
            "docs": [
              "Active status"
            ],
            "type": "bool"
          },
          {
            "name": "startTime",
            "docs": [
              "Start time (0 = immediate)"
            ],
            "type": "i64"
          },
          {
            "name": "endTime",
            "docs": [
              "End time (0 = no expiry)"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "rewardRuleEvent",
      "docs": [
        "Event emitted when a reward rule is created or updated"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "merchant",
            "type": "pubkey"
          },
          {
            "name": "ruleId",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "multiplier",
            "type": "u64"
          },
          {
            "name": "minPurchase",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "action",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "rewardsIssuedEvent",
      "docs": [
        "Event emitted when rewards are issued"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "merchant",
            "type": "pubkey"
          },
          {
            "name": "merchantAuthority",
            "type": "pubkey"
          },
          {
            "name": "customer",
            "type": "pubkey"
          },
          {
            "name": "customerWallet",
            "type": "pubkey"
          },
          {
            "name": "purchaseAmount",
            "type": "u64"
          },
          {
            "name": "baseReward",
            "type": "u64"
          },
          {
            "name": "tierMultiplier",
            "type": "u64"
          },
          {
            "name": "ruleMultiplier",
            "type": "u64"
          },
          {
            "name": "ruleApplied",
            "type": "bool"
          },
          {
            "name": "ruleName",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "finalReward",
            "type": "u64"
          },
          {
            "name": "customerTier",
            "type": {
              "defined": {
                "name": "customerTier"
              }
            }
          },
          {
            "name": "platformFee",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "rewardsRedeemedEvent",
      "docs": [
        "Event emitted when rewards are redeemed"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "customer",
            "type": "pubkey"
          },
          {
            "name": "customerWallet",
            "type": "pubkey"
          },
          {
            "name": "merchant",
            "type": "pubkey"
          },
          {
            "name": "offerName",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "redemptionType",
            "type": {
              "defined": {
                "name": "redemptionType"
              }
            }
          },
          {
            "name": "redemptionCode",
            "type": "string"
          },
          {
            "name": "voucher",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ruleType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "baseReward"
          },
          {
            "name": "bonusMultiplier"
          },
          {
            "name": "firstPurchaseBonus"
          },
          {
            "name": "referralBonus"
          },
          {
            "name": "tierBonus"
          },
          {
            "name": "streakBonus"
          }
        ]
      }
    },
    {
      "name": "tierUpgradeEvent",
      "docs": [
        "Event emitted when a customer tier is upgraded"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "customer",
            "type": "pubkey"
          },
          {
            "name": "customerWallet",
            "type": "pubkey"
          },
          {
            "name": "oldTier",
            "type": {
              "defined": {
                "name": "customerTier"
              }
            }
          },
          {
            "name": "newTier",
            "type": {
              "defined": {
                "name": "customerTier"
              }
            }
          },
          {
            "name": "totalEarned",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "transactionRecord",
      "docs": [
        "Stores individual transaction records for customers",
        "Each transaction (earn or redeem) creates a new record"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "customer",
            "docs": [
              "Customer wallet"
            ],
            "type": "pubkey"
          },
          {
            "name": "merchant",
            "docs": [
              "Merchant involved"
            ],
            "type": "pubkey"
          },
          {
            "name": "transactionType",
            "docs": [
              "Transaction type: 0 = Earned, 1 = Redeemed"
            ],
            "type": "u8"
          },
          {
            "name": "amount",
            "docs": [
              "Amount of tokens"
            ],
            "type": "u64"
          },
          {
            "name": "tier",
            "docs": [
              "Customer tier at time of transaction"
            ],
            "type": "u8"
          },
          {
            "name": "timestamp",
            "docs": [
              "Timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "index",
            "docs": [
              "Transaction index for this customer (for ordering)"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "voucherUsedEvent",
      "docs": [
        "Event emitted when a voucher is used"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voucher",
            "type": "pubkey"
          },
          {
            "name": "customer",
            "type": "pubkey"
          },
          {
            "name": "merchant",
            "type": "pubkey"
          },
          {
            "name": "offerName",
            "type": "string"
          },
          {
            "name": "redemptionCode",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
