
import React from 'react';
import { CreditCardInput } from '../CreditCardInput';

export const PaymentStep: React.FC = () => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <CreditCardInput />
    </div>
  );
};
