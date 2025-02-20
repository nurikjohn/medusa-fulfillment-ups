export interface UPSAuthToken {
  token_type: string;
  issued_at: string;
  client_id: string;
  access_token: string;
  expires_in: string;
  status: string;
}

export interface UPSRate {
  RateResponse: RateResponse;
}
interface RateResponse {
  Response: Response;
  RatedShipment: RatedShipmentItem[];
}
interface Response {
  ResponseStatus: ResponseStatus;
  Alert: AlertItem[];
  TransactionReference: string;
}
interface ResponseStatus {
  Code: string;
  Description: string;
}
interface AlertItem {
  Code: string;
  Description: string;
}
interface RatedShipmentItem {
  Service: Service;
  Zone: string;
  RatedShipmentAlert: RatedShipmentAlertItem[];
  BillingWeight: BillingWeight;
  TransportationCharges: TransportationCharges;
  BaseServiceCharge: BaseServiceCharge;
  ServiceOptionsCharges: ServiceOptionsCharges;
  TotalCharges: TotalCharges;
  RatedPackage: RatedPackageItem[];
}
interface Service {
  Code: string;
  Description: string;
}
interface RatedShipmentAlertItem {
  Code: string;
  Description: string;
}
interface BillingWeight {
  UnitOfMeasurement: UnitOfMeasurement;
  Weight: string;
}
interface UnitOfMeasurement {
  Code: string;
  Description: string;
}
interface TransportationCharges {
  CurrencyCode: string;
  MonetaryValue: string;
}
interface BaseServiceCharge {
  CurrencyCode: string;
  MonetaryValue: string;
}
interface ServiceOptionsCharges {
  CurrencyCode: string;
  MonetaryValue: string;
}
interface TotalCharges {
  CurrencyCode: string;
  MonetaryValue: string;
}
interface RatedPackageItem {
  TransportationCharges: TransportationCharges;
  BaseServiceCharge: BaseServiceCharge;
  ServiceOptionsCharges: ServiceOptionsCharges;
  ItemizedCharges: ItemizedChargesItem[];
  TotalCharges: TotalCharges;
  Weight: string;
  BillingWeight: BillingWeight;
  SimpleRate: SimpleRate;
}
interface ItemizedChargesItem {
  Code: string;
  CurrencyCode: string;
  MonetaryValue: string;
}
interface SimpleRate {
  Code: string;
}

export interface UPSGetRatePayload {
  RateRequest: RateRequest;
}
interface RateRequest {
  Request: Request;
  PickupType: PickupType;
  CustomerClassification: CustomerClassification;
  Shipment: Shipment;
}
interface Request {
  RequestOption: string;
}
interface PickupType {
  Code: string;
}
interface CustomerClassification {
  Code: string;
}
interface Shipment {
  Shipper: Shipper;
  ShipTo: ShipTo;
  PaymentDetails: PaymentDetails;
  Service: Service;
  NumOfPieces: string;
  Package: Package;
}
interface Shipper {
  Name: string;
  ShipperNumber: string;
  Address: UPSAddress;
}
export interface UPSAddress {
  AddressLine: string[];
  City?: string;
  StateProvinceCode?: string;
  CountryCode?: string;
  PostalCode?: string;
}
interface ShipTo {
  Name: string;
  Address: UPSAddress;
}
interface PaymentDetails {
  ShipmentCharge: ShipmentChargeItem[];
}
interface ShipmentChargeItem {
  Type: string;
  BillShipper: BillShipper;
}
interface BillShipper {
  AccountNumber: string;
}
interface Service {
  Code: string;
  Description: string;
}
interface Package {
  SimpleRate: SimpleRate;
  PackagingType: PackagingType;
  PackageWeight: PackageWeight;
}
interface SimpleRate {
  Description: string;
  Code: string;
}
interface PackagingType {
  Code: string;
  Description: string;
}
interface PackageWeight {
  UnitOfMeasurement: UnitOfMeasurement;
  Weight: string;
}
interface UnitOfMeasurement {
  Code: string;
  Description: string;
}
