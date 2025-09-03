import { describe, it, expect } from 'vitest';
import { calculatePrice } from './pricing';

const settings = {
  priceRecto: 0.5,
  priceRectoVerso: 0.8,
};

describe('calculatePrice', () => {
  it('should calculate the price for a "Recto" print job', () => {
    const price = calculatePrice({
      printType: 'Recto',
      pages: 10,
      copies: 1,
      settings,
    });
    expect(price).toBe(5);
  });

  it('should calculate the price for a "Recto-verso" print job', () => {
    const price = calculatePrice({
      printType: 'Recto-verso',
      pages: 10,
      copies: 1,
      settings,
    });
    expect(price).toBe(8);
  });

  it('should calculate the price for a "Recto" print job with multiple copies', () => {
    const price = calculatePrice({
      printType: 'Recto',
      pages: 10,
      copies: 3,
      settings,
    });
    expect(price).toBe(15);
  });

  it('should calculate the price for a "Recto-verso" print job with multiple copies', () => {
    const price = calculatePrice({
      printType: 'Recto-verso',
      pages: 10,
      copies: 2,
      settings,
    });
    expect(price).toBe(16);
  });

  it('should calculate the price for a "Both" print job', () => {
    const price = calculatePrice({
      printType: 'Both',
      pages: 10, // This should be ignored in "Both" mode
      rectoPages: 5,
      rectoVersoPages: 5,
      copies: 1,
      settings,
    });
    expect(price).toBe(5 * 0.5 + 5 * 0.8); // 2.5 + 4.0 = 6.5
  });

  it('should calculate the price for a "Both" print job with multiple copies', () => {
    const price = calculatePrice({
      printType: 'Both',
      pages: 10,
      rectoPages: 5,
      rectoVersoPages: 5,
      copies: 2,
      settings,
    });
    expect(price).toBe((5 * 0.5 + 5 * 0.8) * 2); // 6.5 * 2 = 13
  });

  it('should return 0 if pages are zero', () => {
    const price = calculatePrice({
      printType: 'Recto',
      pages: 0,
      copies: 1,
      settings,
    });
    expect(price).toBe(0);
  });

  it('should return 0 if copies are zero', () => {
    const price = calculatePrice({
      printType: 'Recto',
      pages: 10,
      copies: 0,
      settings,
    });
    expect(price).toBe(0);
  });

  it('should return 0 for "Both" mode if recto and recto-verso pages are zero', () => {
    const price = calculatePrice({
      printType: 'Both',
      pages: 10,
      rectoPages: 0,
      rectoVersoPages: 0,
      copies: 5,
      settings,
    });
    expect(price).toBe(0);
  });

  it('should handle floating point numbers correctly', () => {
    const customSettings = { priceRecto: 0.1, priceRectoVerso: 0.15 };
    const price = calculatePrice({
      printType: 'Both',
      pages: 0,
      rectoPages: 3,
      rectoVersoPages: 2,
      copies: 1,
      settings: customSettings,
    });
    expect(price).toBeCloseTo(0.3 + 0.3); // 3 * 0.1 + 2 * 0.15 = 0.3 + 0.3 = 0.6
  });
});
