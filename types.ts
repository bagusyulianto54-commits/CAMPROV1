
export enum UnitStatus {
  AVAILABLE = 'Tersedia',
  OCCUPIED = 'Sedang Disewa',
  MAINTENANCE = 'Maintenance',
  DELIVERY = 'Sedang Diantar',
  PICKUP = 'Menunggu Penjemputan'
}

export enum UnitType {
  CAMERA = 'Kamera',
  IPHONE = 'iPhone',
  LENS = 'Lensa',
  ACCESSORY = 'Aksesoris'
}

export const COURIER_OPTIONS = [
  'Kurir Pribadi / Toko',
  'Gojek Same Day',
];

export interface DeliveryDetails {
  courierName: string;
  destinationAddress: string;
  scheduledTime: string; // HH:mm format or Date string
  fee: number;
  type: 'Antar' | 'Jemput';
}

export interface UnitSpecs {
  color?: string;           // Warna (e.g., Natural Titanium, Black)
  storage?: string;         // Internal (e.g., 256GB, 512GB)
  warranty?: string;        // Garansi (e.g., iBox Active, Ex-Inter, Expired)
  serialNumber?: string;    // SN for tracking
  batteryHealth?: number;   // BH % for iPhones
  shutterCount?: number;    // SC for Cameras
  sensorType?: string;      // APS-C / Full Frame
}

export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  price: number; // Daily/Weekly rental price in IDR
  promoPrice?: number; // Discounted price
  status: UnitStatus;
  address: string; // Storage location or Branch
  features: string[]; // Included items (Charger, Cable, etc)
  description: string;
  specs?: UnitSpecs; // New detailed specifications
  tenantId?: string; // Link to a tenant if rented
  deliveryDetails?: DeliveryDetails; // Optional delivery info
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string; // New address field
  joinDate: string;
  status: 'Active' | 'Past' | 'Blacklist'; // Updated status
  unitId?: string;
}

export type GuaranteeType = 'KTP' | 'SIM' | 'STNK' | 'Ijasah' | 'BPKB' | 'Kartu Pelajar' | 'Deposit Uang';
export type PaymentMethod = 'Transfer' | 'Cash' | 'QRIS' | 'Debit' | 'COD';

export interface Booking {
  id: string;
  tenantId: string;
  unitIds: string[]; // Can rent multiple units
  startDate: string;
  endDate: string;
  totalPrice: number;
  customFee?: number; // Added custom fee field
  discount?: number; // Manual discount
  
  // Payment Details
  downPayment: number;
  remainingBalance: number;
  paymentMethod: PaymentMethod;
  
  // Security
  guarantees: GuaranteeType[];
  
  // Logistics
  isDelivery: boolean;
  deliveryDetails?: DeliveryDetails;

  status: 'Active' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface DashboardStats {
  totalUnits: number;
  occupiedUnits: number;
  availableUnits: number;
  totalRevenue: number;
  occupancyRate: number;
}