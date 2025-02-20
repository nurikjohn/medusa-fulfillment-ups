import axios, { Axios } from "axios";
import { UPSAddress, UPSAuthToken, UPSGetRatePayload, UPSRate } from "./types";

export interface UPSClientProps {
  clientID: string;
  clientSecret: string;
}

export class UPSClient {
  clientID: string;
  clientSecret: string;

  client: Axios;

  token: UPSAuthToken;

  constructor({ clientID, clientSecret }: UPSClientProps) {
    this.clientID = clientID;
    this.clientSecret = clientSecret;

    this.client = axios.create({
      baseURL: "https://onlinetools.ups.com",
    });
  }

  async refreshToken() {
    if (this.token) {
      const now = new Date().getTime();
      if (+this.token.issued_at + +this.token.expires_in * 1000 > now) {
        return;
      }
    }

    try {
      const formData = {
        grant_type: "client_credentials",
      };

      const { data } = await this.client.post(
        "/security/v1/oauth/token",
        new URLSearchParams(formData).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
              "Basic " +
              Buffer.from(`${this.clientID}:${this.clientSecret}`).toString(
                "base64",
              ),
          },
        },
      );

      this.token = data;
    } catch (error) {
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }

  async getRates(shipping_address: UPSAddress, weight: string) {
    await this.refreshToken();

    const payload: UPSGetRatePayload = {
      RateRequest: {
        Request: {
          RequestOption: "01",
        },
        PickupType: {
          Code: "01",
        },
        CustomerClassification: {
          Code: "01",
        },
        Shipment: {
          Shipper: {
            Name: "ShipperName",
            ShipperNumber: "WK1250",
            Address: {
              AddressLine: [
                "ShipperAddressLine",
                "ShipperAddressLine",
                "ShipperAddressLine",
              ],
              City: "TIMONIUM",
              StateProvinceCode: "MD",
              CountryCode: "US",
              PostalCode: "21093",
            },
          },
          ShipTo: {
            Name: "ShipToName",
            Address: shipping_address,
          },
          PaymentDetails: {
            ShipmentCharge: [
              {
                Type: "01",
                BillShipper: {
                  AccountNumber: "WK1250",
                },
              },
            ],
          },
          Service: {
            Code: "03",
            Description: "Ground",
          },
          NumOfPieces: "1",
          Package: {
            SimpleRate: {
              Description: "SimpleRateDescription",
              Code: "XS",
            },
            PackagingType: {
              Code: "02",
              Description: "Packaging",
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: "LBS",
                Description: "Pounds",
              },
              Weight: weight,
            },
          },
        },
      },
    };

    const { data } = await axios.post<UPSRate>(
      "https://onlinetools.ups.com/api/rating/v2409/rate",
      payload,
      {
        headers: {
          Authorization: `Bearer ${this.token.access_token}`,
        },
      },
    );

    return +data.RateResponse.RatedShipment[0].TotalCharges.MonetaryValue;
  }
}
