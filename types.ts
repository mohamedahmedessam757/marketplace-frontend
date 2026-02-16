
import React from 'react';

// UI Types
export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface StatItem {
  id: number;
  label: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: React.ElementType;
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  delay: number;
}

// Database Types (matching SUPABASE_SCHEMA.sql)

export type OrderStatus =
  | 'AWAITING_OFFERS'
  | 'AWAITING_PAYMENT'
  | 'PREPARATION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'DISPUTED'
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'REFUNDED'
  | 'RESOLVED';

export interface Order {
  id: string; // UUID
  order_number: string;
  customer_id: string; // UUID
  store_id?: string; // UUID
  status: OrderStatus;

  // Vehicle
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vin?: string;

  // Part
  part_name: string;
  part_description?: string;
  part_images?: string[]; // JSONB

  // Preferences
  condition_pref?: string;
  warranty_preferred?: boolean;

  // Financial
  total_amount?: number;
  offer_id?: string; // Accepted Offer UUID

  // Timestamps
  offers_deadline_at?: string;
  payment_deadline_at?: string;
  created_at: string;
  updated_at: string;

  // Joined fields (optional)
  offers?: Offer[];
  store?: Store;
}

export interface Offer {
  id: string; // UUID
  order_id: string;
  store_id: string;
  unit_price: number;
  weight_kg: number;
  shipping_cost: number;
  has_warranty: boolean;
  delivery_days?: string;
  condition?: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;

  // Computed/Joined
  final_price?: number; // unit_price + shipping_cost
  dealer_name?: string; // from joined store
  dealer_number?: string; // from joined store metadata if exists
}

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug?: string;
  description?: string;
  currrent_rating?: number;
}