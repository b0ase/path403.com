import { HandCashConnect } from '@handcash/handcash-connect';

// Demo mode detection
const isDemoMode = !process.env.HANDCASH_APP_ID || !process.env.HANDCASH_APP_SECRET;

export class HandCashService {
  private appId: string | undefined;
  private appSecret: string | undefined;
  private handCashConnect: HandCashConnect | null;
  public isDemoMode: boolean;

  constructor() {
    this.appId = process.env.HANDCASH_APP_ID;
    this.appSecret = process.env.HANDCASH_APP_SECRET;
    this.isDemoMode = isDemoMode;

    if (this.isDemoMode) {
      console.log('🔧 HandCashService: Running in DEMO MODE');
      this.handCashConnect = null;
    } else {
      this.handCashConnect = new HandCashConnect({
        appId: this.appId!,
        appSecret: this.appSecret!,
      });
    }
  }

  private checkDemoMode() {
    if (this.isDemoMode || !this.handCashConnect) {
      throw new Error('HandCash is in DEMO MODE - real operations unavailable');
    }
  }

  /**
   * Get an authorized account instance from an identifying token.
   * Note: In typical HandCash Connect (Server-Side) flow, this is the 'authToken'.
   */
  private getAccount(authToken: string) {
    this.checkDemoMode();
    return this.handCashConnect!.getAccountFromAuthToken(authToken);
  }

  /**
   * Get User Profile
   */
  async getUserProfile(authToken: string) {
    try {
      const account = this.getAccount(authToken);
      const { publicProfile } = await account.profile.getCurrentProfile();
      return publicProfile;
    } catch (error: any) {
      throw new Error(error.message || "Failed to get user profile");
    }
  }

  /**
   * Get Friends
   */
  async getFriends(authToken: string) {
    try {
      const account = this.getAccount(authToken);
      const friends = await account.profile.getFriends();
      return friends;
    } catch (error: any) {
      throw new Error(error.message || "Failed to get friends");
    }
  }

  /**
   * Send Payment
   */
  async sendPayment(
    authToken: string,
    params: {
      destination: string;
      amount: number;
      currency?: string;
      description?: string;
    }
  ) {
    try {
      const account = this.getAccount(authToken);
      const paymentParameters = {
        description: params.description,
        appAction: 'PAYMENT',
        payments: [
          {
            destination: params.destination,
            currencyCode: (params.currency || 'USD') as any,
            sendAmount: params.amount,
          },
        ],
      };

      const result = await account.wallet.pay(paymentParameters);
      return result;
    } catch (error: any) {
      throw new Error(error.message || "Payment failed");
    }
  }

  /**
   * Send Payment with Multiple Outputs (Validation/Distribution)
   */
  async sendMultiPayment(
    authToken: string,
    params: {
      payments: Array<{
        destination: string;
        amount: number;
        currencyCode?: string;
      }>;
      description?: string;
      appAction?: string; // e.g. 'PAY' | 'TIPPING'
    }
  ) {
    try {
      const account = this.getAccount(authToken);
      const paymentParameters = {
        description: params.description || 'Payment Distribution',
        appAction: params.appAction || 'PAYMENT',
        payments: params.payments.map(p => ({
          destination: p.destination,
          currencyCode: (p.currencyCode || 'USD') as any,
          sendAmount: p.amount
        }))
      };

      const result = await account.wallet.pay(paymentParameters);
      return result;
    } catch (error: any) {
      throw new Error(error.message || "Multi-payment failed");
    }
  }

  /**
   * Get Spendable Balance (Wallet)
   */
  async getSpendableBalance(authToken: string, currencyCode = 'USD') {
    try {
      const account = this.getAccount(authToken);
      const balance = await account.wallet.getSpendableBalance(currencyCode as any);
      return balance;
    } catch (error: any) {
      throw new Error(error.message || "Failed to get balance");
    }
  }

  /**
   * Get Inventory (Items/Ordinals)
   */
  async getInventory(authToken: string) {
    try {
      const account = this.getAccount(authToken);
      const inventory = await (account.items as any).getInventory();
      return inventory;
    } catch (error: any) {
      throw new Error(error.message || "Failed to get inventory");
    }
  }

  /**
   * Get the "House" account instance (Global/Admin Wallet)
   */
  getHouseAccount() {
    const houseAuthToken = process.env.HOUSE_AUTH_TOKEN;
    if (!houseAuthToken) {
      throw new Error('HOUSE_AUTH_TOKEN not configured');
    }
    return this.getAccount(houseAuthToken);
  }

  /**
   * Transfer Items (Ordinals)
   */
  async transferItems(
    authToken: string,
    params: {
      origins: string[];
      destination: string;
    }
  ) {
    try {
      const account = this.getAccount(authToken);
      const result = await account.items.transfer({
        destinationsWithOrigins: [
          {
            origins: params.origins,
            destination: params.destination
          }
        ]
      });
      return result;
    } catch (error: any) {
      // Improve error message if possible
      throw new Error(error.message || "Failed to transfer items");
    }
  }

  /**
   * Get Payment (for Verification)
   */
  async getPayment(authToken: string, transactionId: string) {
    try {
      const account = this.getAccount(authToken);
      const payment = await account.wallet.getPayment(transactionId);
      return payment;
    } catch (error: any) {
      throw new Error(`Failed to verify payment: ${error.message}`);
    }
  }
}

export const handcashService = new HandCashService();
