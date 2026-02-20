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
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        }
      ],
      "args": [
        {
          "name": "purchaseAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "migrateMerchant",
      "docs": [
        "Migrate existing merchant account to add avatar_url field"
      ],
      "discriminator": [
        74,
        230,
        161,
        163,
        14,
        34,
        101,
        166
      ],
      "accounts": [
        {
          "name": "merchantAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "merchant",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "avatarUrl",
          "type": "string"
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
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        }
      ],
      "args": [
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
          "name": "avatarUrl",
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
    }
  ],
  "events": [
    {
      "name": "redemptionEvent",
      "discriminator": [
        72,
        165,
        70,
        6,
        179,
        67,
        82,
        183
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
            "name": "avatarUrl",
            "docs": [
              "Avatar URL (128 bytes)"
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
      "name": "redemptionEvent",
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
    }
  ]
};
