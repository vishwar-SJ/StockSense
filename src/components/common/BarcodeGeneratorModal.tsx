import React from 'react';
import { Product } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const BarcodeGeneratorModal: React.FC<Props> = () => {
  return null;
};
