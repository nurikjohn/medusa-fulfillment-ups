import { ClaimService, OrderService } from "@medusajs/medusa";
import { UPSAddress } from "../utils/types";
import { AbstractFulfillmentService, Address, Cart } from "@medusajs/medusa";
import { UPSClient } from "../utils/ups-client";

export interface UPSFulfillmentPluginOptions {
  client_id: string;
  client_secret: string;
}

interface UPSFulfillmentData {
  id: string;
  name: string;
}

export default class UPSFulfillmentService extends AbstractFulfillmentService {
  static identifier = "ups";

  orderService: OrderService;
  claimService: ClaimService;
  client: UPSClient;

  constructor(
    { claimService, orderService },
    { client_id, client_secret }: UPSFulfillmentPluginOptions,
  ) {
    // @ts-ignore
    super(...arguments);
    this.orderService = orderService;
    this.claimService = claimService;

    this.client = new UPSClient({
      clientID: client_id,
      clientSecret: client_secret,
    });
  }

  getIdentifier() {
    return "ups";
  }

  async getFulfillmentOptions(): Promise<UPSFulfillmentData[]> {
    return [
      {
        id: "ups-fulfillment",
        name: "UPS shipment",
      },
    ];
  }

  validateFulfillmentData(optionData: any, data: any) {
    return {
      ...optionData,
      ...data,
    };
  }

  async validateOption(data: any): Promise<boolean> {
    const options = await this.getFulfillmentOptions();
    return options.some((option) => option.id === data.id);
  }

  /**
   * @param data
   * @returns
   */
  async canCalculate() {
    return true;
  }

  /**
   * Used to calculate a price for a given shipping option.
   */
  async calculatePrice(optionData: any, data: any, cart: Cart) {
    try {
      const weight = this.calculatePackageWeight(cart);

      const address = this.buildUPSAddress(cart.shipping_address);

      const shipment_price = await this.client.getRates(address, weight);

      return +shipment_price * 100;
    } catch (error) {
      console.log("UPS ERROR:", JSON.stringify(error?.response?.data ?? error));
    }
  }

  async createFulfillment() {
    return null;
  }

  async getFulfillmentDocuments() {
    return [];
  }

  async createReturn() {
    return {};
  }

  async getReturnDocuments() {
    return {};
  }

  async getShipmentDocuments() {
    return {};
  }

  private buildUPSAddress(address: Address): UPSAddress | null {
    return {
      AddressLine: [address.address_1, address.address_2],
      City: address.city,
      PostalCode: address.postal_code.toString(),
      CountryCode: address.country_code,
    };
  }

  private calculatePackageWeight(cart: Cart): string {
    const weight = cart.items.reduce((a, b) => {
      return a + b.variant.weight;
    }, 0);

    const converted_weight = (weight * 2.2).toFixed(2); // convert weight to lbs
    if (!weight) return undefined;

    return converted_weight;
  }

  async cancelFulfillment() {}
  async retrieveDocuments() {}
}
