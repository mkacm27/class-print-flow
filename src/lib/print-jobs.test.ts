import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateSerialNumber } from './print-jobs';
import { PrintJob } from './types';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('generateSerialNumber', () => {
  const mockDate = new Date('2024-08-15T10:00:00Z'); // A fixed date: 2024-08-15

  beforeEach(() => {
    // Set a fixed date before each test
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
    localStorage.clear();
  });

  afterEach(() => {
    // Restore real timers after each test
    vi.useRealTimers();
  });

  it('should generate the correct serial number for the first job of the day', async () => {
    // Arrange: No existing print jobs
    localStorage.setItem('printjobs', JSON.stringify([]));

    // Act
    const serialNumber = await generateSerialNumber();

    // Assert
    // Expected format: PE-YYMMDD-CCC -> PE-240815-001
    expect(serialNumber).toBe('PE-240815-001');
  });

  it('should increment the serial number for subsequent jobs on the same day', async () => {
    // Arrange: One existing job for today
    const existingJobs: PrintJob[] = [
      {
        id: '1',
        serialNumber: 'PE-240815-001',
        timestamp: new Date('2024-08-15T09:00:00Z').toISOString(),
        className: 'Class A',
        teacherName: 'Teacher A',
        documentType: 'Test',
        printType: 'Recto',
        pages: 10,
        copies: 1,
        totalPrice: 5,
        paid: false,
      },
    ];
    localStorage.setItem('printjobs', JSON.stringify(existingJobs));

    // Act
    const serialNumber = await generateSerialNumber();

    // Assert
    expect(serialNumber).toBe('PE-240815-002');
  });

  it('should reset the count for a new day', async () => {
    // Arrange: One existing job from yesterday
    const existingJobs: PrintJob[] = [
      {
        id: '1',
        serialNumber: 'PE-240814-005',
        timestamp: new Date('2024-08-14T15:00:00Z').toISOString(),
        className: 'Class B',
        teacherName: 'Teacher B',
        documentType: 'Test',
        printType: 'Recto',
        pages: 20,
        copies: 2,
        totalPrice: 20,
        paid: true,
      },
    ];
    localStorage.setItem('printjobs', JSON.stringify(existingJobs));

    // Act
    const serialNumber = await generateSerialNumber();

    // Assert
    // The count should reset to 1 because it's the first job of the 15th
    expect(serialNumber).toBe('PE-240815-001');
  });

  it('should handle an empty or non-existent printjobs item in localStorage', async () => {
    // Arrange: localStorage is empty
    localStorage.removeItem('printjobs');

    // Act
    const serialNumber = await generateSerialNumber();

    // Assert
    expect(serialNumber).toBe('PE-240815-001');
  });
});
