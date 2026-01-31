import React from 'react';

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