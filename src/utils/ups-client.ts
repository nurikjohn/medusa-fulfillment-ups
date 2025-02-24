import axios, { Axios } from "axios";
import {
  UPSPackage,
  UPSAddress,
  UPSAuthToken,
  UPSGetRatePayload,
  UPSRate,
} from "./types";

export interface UPSClientProps {
  clientID: string;
  clientSecret: string;
  accountNumber: string;
  shipFrom: UPSAddress;
}

export class UPSClient {
  clientID: string;
  clientSecret: string;
  accountNumber: string;
  shipFrom: UPSAddress;

  client: Axios;

  token: UPSAuthToken;

  constructor({
    clientID,
    clientSecret,
    accountNumber,
    shipFrom,
  }: UPSClientProps) {
    this.clientID = clientID;
    this.clientSecret = clientSecret;
    this.accountNumber = accountNumber;
    this.shipFrom = shipFrom;

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

  async getRates(shipping_address: UPSAddress, packages: UPSPackage[]) {
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
            ShipperNumber: this.accountNumber,
            Address: this.shipFrom,
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
                  AccountNumber: this.accountNumber,
                },
              },
            ],
          },
          Service: {
            Code: "03",
            Description: "Ground",
          },
          NumOfPieces: "1",
          Package: packages,
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
