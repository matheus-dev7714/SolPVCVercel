/**
 * Prisma Seed Script
 * Populates database with test/demo data
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.resolution.deleteMany()
  await prisma.priceHistory.deleteMany()
  await prisma.entry.deleteMany()
  await prisma.pool.deleteMany()

  console.log('✅ Cleared existing data')

  // Get current timestamp
  const now = Math.floor(Date.now() / 1000)
  const oneHour = 3600
  const oneDay = 86400

  // Create test pools
  const pools = await Promise.all([
    // Pool 1: BONK - OPEN
    prisma.pool.create({
      data: {
        token: 'BONK',
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        logoUrl: null,
        poolType: 'PvMarket',
        startTs: BigInt(now - oneDay),
        lockTs: BigInt(now + oneHour * 2),
        endTs: BigInt(now + oneHour * 3),
        lineBps: 300, // +3.00%
        status: 'OPEN',
        totalOverLamports: BigInt(34000000000), // 34 SOL
        totalUnderLamports: BigInt(29000000000), // 29 SOL
        aiConfidence: 0.61,
        aiModel: 'pve-v0.3.0',
        aiCommit:
          '0xA1B2C3D4E5F6789012345678901234567890ABCDEF1234567890ABCDEFABCD',
        aiPayloadUrl: null,
        contractUrl: 'https://solscan.io/tx/PLACEHOLDER?cluster=devnet',
        priceHistory: {
          create: [
            {
              timestamp: BigInt(now - oneDay),
              price: 0.000021,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now - oneHour * 18),
              price: 0.0000213,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now - oneHour * 12),
              price: 0.0000209,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now - oneHour * 6),
              price: 0.0000216,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now),
              price: 0.0000214,
              source: 'jupiter',
            },
          ],
        },
      },
    }),

    // Pool 2: WIF - OPEN
    prisma.pool.create({
      data: {
        token: 'WIF',
        mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        logoUrl: null,
        poolType: 'PvMarket',
        startTs: BigInt(now - oneDay),
        lockTs: BigInt(now + oneHour * 2),
        endTs: BigInt(now + oneHour * 3),
        lineBps: 220, // +2.20%
        status: 'OPEN',
        totalOverLamports: BigInt(18000000000),
        totalUnderLamports: BigInt(24000000000),
        aiConfidence: 0.55,
        aiModel: 'pve-v0.3.0',
        aiCommit:
          '0x1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890AB',
        aiPayloadUrl: null,
        contractUrl: 'https://solscan.io/tx/PLACEHOLDER?cluster=devnet',
        priceHistory: {
          create: [
            {
              timestamp: BigInt(now - oneDay),
              price: 2.45,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now - oneHour * 18),
              price: 2.48,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now - oneHour * 12),
              price: 2.42,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now - oneHour * 6),
              price: 2.51,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now),
              price: 2.47,
              source: 'jupiter',
            },
          ],
        },
      },
    }),

    // Pool 3: POPCAT - LOCKED
    prisma.pool.create({
      data: {
        token: 'POPCAT',
        mint: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
        logoUrl: null,
        poolType: 'PvMarket',
        startTs: BigInt(now - oneDay * 2),
        lockTs: BigInt(now - oneHour),
        endTs: BigInt(now + oneHour),
        lineBps: 450, // +4.50%
        status: 'LOCKED',
        totalOverLamports: BigInt(52000000000),
        totalUnderLamports: BigInt(48000000000),
        aiConfidence: 0.58,
        aiModel: 'pve-v0.3.0',
        aiCommit:
          '0xFEDCBA0987654321FEDCBA0987654321FEDCBA0987654321FEDCBA098765',
        aiPayloadUrl: null,
        contractUrl: 'https://solscan.io/tx/PLACEHOLDER?cluster=devnet',
        priceHistory: {
          create: [
            {
              timestamp: BigInt(now - oneDay * 2),
              price: 0.85,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now - oneDay),
              price: 0.88,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now - oneHour * 12),
              price: 0.87,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now - oneHour * 6),
              price: 0.91,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now),
              price: 0.89,
              source: 'jupiter',
            },
          ],
        },
      },
    }),

    // Pool 4: MEW - RESOLVED
    prisma.pool.create({
      data: {
        token: 'MEW',
        mint: 'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5',
        logoUrl: null,
        poolType: 'PvMarket',
        startTs: BigInt(now - oneDay * 3),
        lockTs: BigInt(now - oneDay * 2),
        endTs: BigInt(now - oneDay),
        lineBps: 175, // +1.75%
        status: 'RESOLVED',
        winner: 'Over',
        totalOverLamports: BigInt(24000000000),
        totalUnderLamports: BigInt(26000000000),
        aiConfidence: 0.52,
        aiModel: 'pve-v0.3.0',
        aiCommit:
          '0x9876543210FEDCBA9876543210FEDCBA9876543210FEDCBA9876543210FE',
        aiPayloadUrl: null,
        proofHash: '0x' + 'a'.repeat(64),
        proofUrl: 'https://shdw-drive.genesysgo.net/example-proof.json',
        contractUrl: 'https://solscan.io/tx/PLACEHOLDER?cluster=devnet',
        priceHistory: {
          create: [
            {
              timestamp: BigInt(now - oneDay * 3),
              price: 0.0042,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now - oneDay * 2),
              price: 0.0043,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now - oneDay),
              price: 0.0044,
              source: 'jupiter',
            },
          ],
        },
      },
    }),

    // Pool 5: BODEN - OPEN
    prisma.pool.create({
      data: {
        token: 'BODEN',
        mint: '3psH1Mj1f7yUfaD5gh6Zj7epE8hhrMkMETgv5TshQA4o',
        logoUrl: null,
        poolType: 'PvAI',
        startTs: BigInt(now - oneDay),
        lockTs: BigInt(now + oneHour * 3),
        endTs: BigInt(now + oneHour * 4),
        lineBps: 380, // +3.80%
        status: 'OPEN',
        totalOverLamports: BigInt(12000000000),
        totalUnderLamports: BigInt(9000000000),
        aiConfidence: 0.59,
        aiModel: 'pve-v0.3.0',
        aiCommit:
          '0xABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF123456',
        aiPayloadUrl: null,
        contractUrl: 'https://solscan.io/tx/PLACEHOLDER?cluster=devnet',
        priceHistory: {
          create: [
            {
              timestamp: BigInt(now - oneDay),
              price: 0.18,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now - oneHour * 18),
              price: 0.185,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now - oneHour * 12),
              price: 0.182,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now - oneHour * 6),
              price: 0.188,
              source: 'jupiter',
            },
            {
              timestamp: BigInt(now),
              price: 0.184,
              source: 'jupiter',
            },
          ],
        },
      },
    }),

    // Pool 6: POPCAT - OPEN (Extreme Over)
    prisma.pool.create({
      data: {
        token: 'POPCAT',
        mint: 'POPCAT_DEV_EXTREME_MINT_000000000000000001',
        logoUrl: null,
        poolType: 'PvAI',
        startTs: BigInt(now - oneDay),
        lockTs: BigInt(now + oneHour * 1),
        endTs: BigInt(now + oneHour * 6),
        lineBps: 250,
        status: 'OPEN',
        totalOverLamports: BigInt(990_000_000_000),
        totalUnderLamports: BigInt(10_000_000_000),
        aiConfidence: 0.91,
        aiModel: 'pve-v0.3.0',
        aiCommit: '0xPOPCATDEADBEEF1234',
        aiPayloadUrl: null,
        contractUrl: 'https://solscan.io/tx/PLACEHOLDER?cluster=devnet',
        priceHistory: {
          create: [
            { timestamp: BigInt(now - oneHour * 6), price: 1.0, source: 'jupiter' },
            { timestamp: BigInt(now - oneHour * 3), price: 1.02, source: 'jupiter' },
            { timestamp: BigInt(now), price: 1.01, source: 'jupiter' },
          ],
        },
      },
    }),

    // Pool 7: WIF - OPEN (Extreme Under)
    prisma.pool.create({
      data: {
        token: 'WIF',
        mint: 'WIF_DEV_EXTREME_MINT_000000000000000000002',
        logoUrl: null,
        poolType: 'PvMarket',
        startTs: BigInt(now - oneDay),
        lockTs: BigInt(now + oneHour * 2),
        endTs: BigInt(now + oneHour * 8),
        lineBps: 50,
        status: 'OPEN',
        totalOverLamports: BigInt(50_000_000_000),
        totalUnderLamports: BigInt(950_000_000_000),
        aiConfidence: 0.23,
        aiModel: 'pve-v0.3.0',
        aiCommit: '0xWIFDEADBEEF5678',
        aiPayloadUrl: null,
        contractUrl: 'https://solscan.io/tx/PLACEHOLDER?cluster=devnet',
        priceHistory: {
          create: [
            { timestamp: BigInt(now - oneHour * 6), price: 3.0, source: 'jupiter' },
            { timestamp: BigInt(now - oneHour * 3), price: 3.2, source: 'jupiter' },
            { timestamp: BigInt(now), price: 3.1, source: 'jupiter' },
          ],
        },
      },
    }),
  ])

  console.log(`✅ Created ${pools.length} pools`)

  // Seed AI line history for PvAI pools so dynamic charts work on home
  try {
    await prisma.aiLineHistory.createMany({
      data: [
        // BONK (pools[0]) – PvAI
        { poolId: pools[0].id, timestamp: BigInt(now - oneDay), lineBps: 280, source: 'model' },
        { poolId: pools[0].id, timestamp: BigInt(now - oneHour * 18), lineBps: 290, source: 'model' },
        { poolId: pools[0].id, timestamp: BigInt(now - oneHour * 12), lineBps: 310, source: 'model' },
        { poolId: pools[0].id, timestamp: BigInt(now - oneHour * 6), lineBps: 300, source: 'model' },
        { poolId: pools[0].id, timestamp: BigInt(now - oneHour * 2), lineBps: 305, source: 'model' },

        // BODEN (pools[4]) – PvAI
        { poolId: pools[4].id, timestamp: BigInt(now - oneDay), lineBps: 360, source: 'model' },
        { poolId: pools[4].id, timestamp: BigInt(now - oneHour * 16), lineBps: 370, source: 'model' },
        { poolId: pools[4].id, timestamp: BigInt(now - oneHour * 8), lineBps: 380, source: 'model' },
        { poolId: pools[4].id, timestamp: BigInt(now - oneHour * 4), lineBps: 375, source: 'model' },

        // WIF Extreme (pools[6]) – PvAI
        { poolId: pools[6].id, timestamp: BigInt(now - oneDay), lineBps: 40, source: 'model' },
        { poolId: pools[6].id, timestamp: BigInt(now - oneHour * 18), lineBps: 45, source: 'model' },
        { poolId: pools[6].id, timestamp: BigInt(now - oneHour * 12), lineBps: 50, source: 'model' },
        { poolId: pools[6].id, timestamp: BigInt(now - oneHour * 6), lineBps: 55, source: 'model' },
        { poolId: pools[6].id, timestamp: BigInt(now - oneHour * 2), lineBps: 50, source: 'model' },
      ],
      skipDuplicates: true,
    })
    console.log('�o. Seeded AI line history for PvAI pools (BONK, BODEN, WIF Extreme)')
  } catch (e) {
    console.warn('AI line history seeding skipped or failed:', e)
  }

  // Create some test entries
  const entries = await Promise.all([
    prisma.entry.create({
      data: {
        poolId: pools[0].id,
        userPubkey: 'GjWUT4kHKfZBZZh9rn9LXSW5UXr7XsLqMqvbCNKPX2wm',
        side: 'Over',
        amountLamports: BigInt(5000000000), // 5 SOL
        feeLamports: BigInt(3750000), // 0.75%
        claimed: false,
      },
    }),
    prisma.entry.create({
      data: {
        poolId: pools[0].id,
        userPubkey: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        side: 'Under',
        amountLamports: BigInt(3000000000),
        feeLamports: BigInt(2250000),
        claimed: false,
      },
    }),
  ])

  console.log(`✅ Created ${entries.length} test entries`)

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

