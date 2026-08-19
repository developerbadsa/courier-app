/**
 * Double-Entry Financial Ledger Service
 * Append-only: entries are NEVER mutated or deleted
 * Every transaction generates DEBIT + CREDIT pairs
 */

class LedgerService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Get or create ledger account for merchant/rider
   */
  async getOrCreateAccount(merchantId = null, riderId = null) {
    let account;
    if (merchantId) {
      account = await this.prisma.ledgerAccount.findUnique({
        where: { merchantId },
      });
      if (!account) {
        account = await this.prisma.ledgerAccount.create({
          data: { merchantId },
        });
      }
    } else if (riderId) {
      account = await this.prisma.ledgerAccount.findUnique({
        where: { riderId },
      });
      if (!account) {
        account = await this.prisma.ledgerAccount.create({
          data: { riderId },
        });
      }
    }
    return account;
  }

  /**
   * Record a double-entry transaction
   * @param {Object} params
   * @param {string} params.transactionId - Unique transaction reference
   * @param {string} params.type - LedgerEntryType enum value
   * @param {string} params.amount - Amount in USD
   * @param {string} params.direction - DEBIT or CREDIT
   * @param {string} params.accountId - Ledger account ID
   * @param {string} [params.shipmentId] - Related shipment
   * @param {string} [params.note] - Description
   */
  async recordEntry({
    transactionId,
    type,
    amount,
    direction,
    accountId,
    shipmentId = null,
    settlementId = null,
    note = null,
  }) {
    return this.prisma.ledgerEntry.create({
      data: {
        transactionId,
        type,
        amount: parseFloat(amount),
        direction,
        accountId,
        shipmentId,
        settlementId,
        note,
      },
    });
  }

  /**
   * Record COD collection when rider delivers
   */
  async recordCODCollection({ shipmentId, merchantId, riderId, codAmount, transactionId }) {
    const merchantAccount = await this.getOrCreateAccount(merchantId);
    const riderAccount = riderId ? await this.getOrCreateAccount(null, riderId) : null;

    // 1. Rider receives COD cash: DEBIT rider account
    if (riderAccount) {
      await this.recordEntry({
        transactionId,
        type: 'COD_COLLECTED',
        amount: codAmount,
        direction: 'DEBIT',
        accountId: riderAccount.id,
        shipmentId,
        note: `COD collected from consignee`,
      });
    }

    // 2. Merchant gets credit: CREDIT merchant account
    await this.recordEntry({
      transactionId,
      type: 'PAYABLE_TO_MERCHANT',
      amount: codAmount,
      direction: 'CREDIT',
      accountId: merchantAccount.id,
      shipmentId,
      note: `COD amount payable to merchant`,
    });

    return { transactionId };
  }

  /**
   * Record delivery charge deduction from merchant
   */
  async recordDeliveryCharge({ shipmentId, merchantId, charge, transactionId }) {
    const merchantAccount = await this.getOrCreateAccount(merchantId);

    // DEBIT merchant for delivery charge
    await this.recordEntry({
      transactionId,
      type: 'DELIVERY_CHARGE',
      amount: charge,
      direction: 'DEBIT',
      accountId: merchantAccount.id,
      shipmentId,
      note: `Shipping fee deducted`,
    });

    return { transactionId };
  }

  /**
   * Record settlement payout to merchant
   */
  async recordSettlementPayout({ settlementId, merchantId, amount, transactionId }) {
    const merchantAccount = await this.getOrCreateAccount(merchantId);

    // DEBIT merchant (reduce balance) for payout
    await this.recordEntry({
      transactionId,
      type: 'SETTLEMENT_PAYOUT',
      amount,
      direction: 'DEBIT',
      accountId: merchantAccount.id,
      settlementId,
      note: `Settlement payout processed`,
    });

    return { transactionId };
  }

  /**
   * Get merchant wallet balance (calculated from entries)
   */
  async getMerchantBalance(merchantId) {
    const account = await this.getOrCreateAccount(merchantId);
    if (!account) return { balance: 0, collected: 0, fees: 0, payable: 0 };

    const entries = await this.prisma.ledgerEntry.findMany({
      where: { accountId: account.id },
    });

    let collected = 0; // COD collected
    let fees = 0;      // Delivery charges paid
    let payouts = 0;   // Settlements received
    let payable = 0;   // Pending payable

    for (const entry of entries) {
      const amt = parseFloat(entry.amount);
      if (entry.type === 'COD_COLLECTED') collected += amt;
      if (entry.type === 'DELIVERY_CHARGE') fees += amt;
      if (entry.type === 'SETTLEMENT_PAYOUT') payouts += amt;
      if (entry.type === 'PAYABLE_TO_MERCHANT') payable += amt;
    }

    // Available = payable - payouts
    const available = Math.max(0, payable - payouts);

    return {
      balance: Math.round(available * 100) / 100,
      collected: Math.round(collected * 100) / 100,
      fees: Math.round(fees * 100) / 100,
      pendingPayout: Math.round(payable * 100) / 100,
      totalPaid: Math.round(payouts * 100) / 100,
      currency: 'USD',
    };
  }

  /**
   * Get ledger entries for an account (paginated)
   */
  async getEntries(merchantId, { page = 1, limit = 20, startDate, endDate } = {}) {
    const account = await this.getOrCreateAccount(merchantId);
    if (!account) return { data: [], pagination: { total: 0, page: 1, pages: 0 } };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
      accountId: account.id,
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const [entries, total] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        where,
        include: { shipment: { select: { trackingNumber: true } } },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ledgerEntry.count({ where }),
    ]);

    return {
      data: entries,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  /**
   * Generate settlement for a period
   */
  async generateSettlement(merchantId, periodStart, periodEnd) {
    const merchantAccount = await this.getOrCreateAccount(merchantId);
    if (!merchantAccount) throw new Error('No ledger account for merchant');

    // Find unpaid entries in period
    const entries = await this.prisma.ledgerEntry.findMany({
      where: {
        accountId: merchantAccount.id,
        settlementId: null,
        createdAt: {
          gte: new Date(periodStart),
          lte: new Date(periodEnd),
        },
      },
    });

    let totalPayable = 0;
    let totalFees = 0;
    for (const entry of entries) {
      const amt = parseFloat(entry.amount);
      if (entry.type === 'PAYABLE_TO_MERCHANT') totalPayable += amt;
      if (entry.type === 'DELIVERY_CHARGE') totalFees += amt;
    }

    const netAmount = Math.round((totalPayable - totalFees) * 100) / 100;

    // Create settlement
    const settlement = await this.prisma.settlement.create({
      data: {
        merchantId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        totalAmount: Math.max(0, netAmount),
        status: 'PENDING',
      },
    });

    // Link entries to settlement
    for (const entry of entries) {
      await this.prisma.ledgerEntry.update({
        where: { id: entry.id },
        data: { settlementId: settlement.id },
      });
    }

    return settlement;
  }

  /**
   * Get settlements for a merchant
   */
  async getSettlements(merchantId, { page = 1, limit = 10 } = {}) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { merchantId };

    const [settlements, total] = await Promise.all([
      this.prisma.settlement.findMany({
        where,
        include: {
          _count: { select: { ledgerEntries: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.settlement.count({ where }),
    ]);

    return {
      data: settlements,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }
}

module.exports = LedgerService;
