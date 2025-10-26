export type Solpve = {
  "version": "0.1.0",
  "name": "solpve",
  "instructions": [
    {
      "name": "initializePool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "poolId",
          "type": "u64"
        },
        {
          "name": "startTs",
          "type": "i64"
        },
        {
          "name": "lockTs",
          "type": "i64"
        },
        {
          "name": "endTs",
          "type": "i64"
        },
        {
          "name": "lineBps",
          "type": "i16"
        },
        {
          "name": "aiCommit",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "enterPool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "entry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "side",
          "type": {
            "defined": "Side"
          }
        }
      ]
    },
    {
      "name": "resolvePool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "winner",
          "type": {
            "defined": "Winner"
          }
        },
        {
          "name": "proofHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "claimWinnings",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "entry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "lockPool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "poolId",
            "type": "u64"
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "lockTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
          },
          {
            "name": "lineBps",
            "type": "i16"
          },
          {
            "name": "status",
            "type": {
              "defined": "PoolStatus"
            }
          },
          {
            "name": "totalOver",
            "type": "u64"
          },
          {
            "name": "totalUnder",
            "type": "u64"
          },
          {
            "name": "aiCommit",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "winner",
            "type": {
              "defined": "Winner"
            }
          },
          {
            "name": "proofHash",
            "type": {
              "array": [
                "u8",
                32
              ]
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
      "name": "entry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "side",
            "type": {
              "defined": "Side"
            }
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "feePaid",
            "type": "u64"
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PoolStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Open"
          },
          {
            "name": "Locked"
          },
          {
            "name": "Resolved"
          }
        ]
      }
    },
    {
      "name": "Side",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Over"
          },
          {
            "name": "Under"
          }
        ]
      }
    },
    {
      "name": "Winner",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "None"
          },
          {
            "name": "Over"
          },
          {
            "name": "Under"
          },
          {
            "name": "Void"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "EntryCreated",
      "fields": [
        {
          "name": "pool",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "side",
          "type": {
            "defined": "Side"
          },
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "fee",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "PoolResolved",
      "fields": [
        {
          "name": "pool",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "winner",
          "type": {
            "defined": "Winner"
          },
          "index": false
        },
        {
          "name": "proofHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          },
          "index": false
        }
      ]
    },
    {
      "name": "WinningsClaimed",
      "fields": [
        {
          "name": "pool",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "PoolLocked",
      "fields": [
        {
          "name": "pool",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidTimestamps",
      "msg": "Invalid timestamps: end_ts must be after lock_ts, lock_ts must be after start_ts"
    },
    {
      "code": 6001,
      "name": "InvalidLineBps",
      "msg": "Line BPS must be between -10000 and 10000"
    },
    {
      "code": 6002,
      "name": "PoolNotOpen",
      "msg": "Pool is not open for entries"
    },
    {
      "code": 6003,
      "name": "PoolLocked",
      "msg": "Pool is locked, no more entries allowed"
    },
    {
      "code": 6004,
      "name": "PoolNotEnded",
      "msg": "Pool has not ended yet"
    },
    {
      "code": 6005,
      "name": "PoolAlreadyResolved",
      "msg": "Pool has already been resolved"
    },
    {
      "code": 6006,
      "name": "PoolNotResolved",
      "msg": "Pool is not resolved yet"
    },
    {
      "code": 6007,
      "name": "AlreadyClaimed",
      "msg": "Winnings have already been claimed"
    },
    {
      "code": 6008,
      "name": "NotWinner",
      "msg": "User did not win this pool"
    },
    {
      "code": 6009,
      "name": "Unauthorized",
      "msg": "Unauthorized: only pool authority can perform this action"
    },
    {
      "code": 6010,
      "name": "PoolNotLockable",
      "msg": "Pool cannot be locked yet"
    }
  ]
};

export const IDL: Solpve = {
  "version": "0.1.0",
  "name": "solpve",
  "instructions": [
    {
      "name": "initializePool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "poolId",
          "type": "u64"
        },
        {
          "name": "startTs",
          "type": "i64"
        },
        {
          "name": "lockTs",
          "type": "i64"
        },
        {
          "name": "endTs",
          "type": "i64"
        },
        {
          "name": "lineBps",
          "type": "i16"
        },
        {
          "name": "aiCommit",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "enterPool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "entry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "side",
          "type": {
            "defined": "Side"
          }
        }
      ]
    },
    {
      "name": "resolvePool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "winner",
          "type": {
            "defined": "Winner"
          }
        },
        {
          "name": "proofHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "claimWinnings",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "entry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "lockPool",
      "accounts": [
        {
          "name": "pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "poolId",
            "type": "u64"
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "lockTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
          },
          {
            "name": "lineBps",
            "type": "i16"
          },
          {
            "name": "status",
            "type": {
              "defined": "PoolStatus"
            }
          },
          {
            "name": "totalOver",
            "type": "u64"
          },
          {
            "name": "totalUnder",
            "type": "u64"
          },
          {
            "name": "aiCommit",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "winner",
            "type": {
              "defined": "Winner"
            }
          },
          {
            "name": "proofHash",
            "type": {
              "array": [
                "u8",
                32
              ]
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
      "name": "entry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "side",
            "type": {
              "defined": "Side"
            }
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "feePaid",
            "type": "u64"
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PoolStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Open"
          },
          {
            "name": "Locked"
          },
          {
            "name": "Resolved"
          }
        ]
      }
    },
    {
      "name": "Side",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Over"
          },
          {
            "name": "Under"
          }
        ]
      }
    },
    {
      "name": "Winner",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "None"
          },
          {
            "name": "Over"
          },
          {
            "name": "Under"
          },
          {
            "name": "Void"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "EntryCreated",
      "fields": [
        {
          "name": "pool",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "side",
          "type": {
            "defined": "Side"
          },
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "fee",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "PoolResolved",
      "fields": [
        {
          "name": "pool",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "winner",
          "type": {
            "defined": "Winner"
          },
          "index": false
        },
        {
          "name": "proofHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          },
          "index": false
        }
      ]
    },
    {
      "name": "WinningsClaimed",
      "fields": [
        {
          "name": "pool",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "PoolLocked",
      "fields": [
        {
          "name": "pool",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidTimestamps",
      "msg": "Invalid timestamps: end_ts must be after lock_ts, lock_ts must be after start_ts"
    },
    {
      "code": 6001,
      "name": "InvalidLineBps",
      "msg": "Line BPS must be between -10000 and 10000"
    },
    {
      "code": 6002,
      "name": "PoolNotOpen",
      "msg": "Pool is not open for entries"
    },
    {
      "code": 6003,
      "name": "PoolLocked",
      "msg": "Pool is locked, no more entries allowed"
    },
    {
      "code": 6004,
      "name": "PoolNotEnded",
      "msg": "Pool has not ended yet"
    },
    {
      "code": 6005,
      "name": "PoolAlreadyResolved",
      "msg": "Pool has already been resolved"
    },
    {
      "code": 6006,
      "name": "PoolNotResolved",
      "msg": "Pool is not resolved yet"
    },
    {
      "code": 6007,
      "name": "AlreadyClaimed",
      "msg": "Winnings have already been claimed"
    },
    {
      "code": 6008,
      "name": "NotWinner",
      "msg": "User did not win this pool"
    },
    {
      "code": 6009,
      "name": "Unauthorized",
      "msg": "Unauthorized: only pool authority can perform this action"
    },
    {
      "code": 6010,
      "name": "PoolNotLockable",
      "msg": "Pool cannot be locked yet"
    }
  ]
};
