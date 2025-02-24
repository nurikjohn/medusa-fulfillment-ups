import { ClaimService, LineItem, OrderService } from "@medusajs/medusa";
import { AbstractFulfillmentService, Address, Cart } from "@medusajs/medusa";
import { log } from "utils/helpers";
import { UPSPackage, UPSAddress } from "utils/types";
import { UPSClient } from "../utils/ups-client";

export interface UPSFulfillmentPluginOptions {
  client_id: string;
  client_secret: string;
  account_number: string;
  ship_from: Address;
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
    {
      client_id,
      client_secret,
      ship_from,
      account_number,
    }: UPSFulfillmentPluginOptions,
  ) {
    // @ts-ignore
    super(...arguments);
    this.orderService = orderService;
    this.claimService = claimService;

    this.client = new UPSClient({
      clientID: client_id,
      clientSecret: client_secret,
      accountNumber: account_number,
      shipFrom: this.buildUPSAddress(ship_from),
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
    const address = this.buildUPSAddress(cart.shipping_address);
    const packages = cart.items.map((item) => this.buildUPSPackage(item));

    try {
      const shipment_price = await this.client.getRates(address, packages);

      return +shipment_price * 100;
    } catch (error) {
      console.log("UPS ERROR:", log(error?.response?.data ?? error));
      console.log("UPS ADDRESS:", log(address));
      console.log("UPS PACKAGES:", log(packages));
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

  async cancelFulfillment() {}
  async retrieveDocuments() {}

  private buildUPSAddress(address: Address): UPSAddress | null {
    return {
      AddressLine: [address.address_1, address.address_2],
      City: address.city,
      PostalCode: address.postal_code.toString(),
      CountryCode: address.country_code,
    };
  }

  private mmToInch(value: number) {
    return value * 0.0393701;
  }

  private gToLbs(value: number) {
    const weight_kgs = value / 1000;
    const weight_lbs = (weight_kgs * 2.2).toFixed(2); // convert weight to lbs

    return weight_lbs;
  }

  private buildUPSPackage(item: LineItem): UPSPackage | null {
    return {
      SimpleRate: {
        Description: "SimpleRateDescription",
        Code: "XS",
      },
      PackagingType: {
        Code: "02",
        Description: "Packaging",
      },
      Dimensions: {
        UnitOfMeasurement: {
          Code: "IN",
          Description: "Inches",
        },
        Length: this.mmToInch(item.variant.length).toFixed(2),
        Width: this.mmToInch(item.variant.width).toFixed(2),
        Height: this.mmToInch(item.variant.height).toFixed(2),
      },
      PackageWeight: {
        UnitOfMeasurement: {
          Code: "LBS",
          Description: "Pounds",
        },
        Weight: this.gToLbs(item.variant.weight),
      },
    };
  }
}
