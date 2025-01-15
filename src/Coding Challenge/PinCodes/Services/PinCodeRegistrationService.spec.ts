import { PinCodeRegistrationService } from './PinCodeRegistrationService';
import { PinCodeRegistrationRepository } from '../Repositories/PinCodeRegistrationRepository';
import { DoorService } from '../../Doors/Services/DoorService';
import { DoorRepository } from '../../Doors/Repositories/DoorRepository';

import 'reflect-metadata';

jest.mock('src/helper/decorators', () => ({
  CacheResult: () => (
    _: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      return originalMethod?.apply(this, args);
    };
    return descriptor;
  },
  ClearCache: () => (
    _: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      return originalMethod?.apply(this, args); 
    };
    return descriptor;
  },
}));

describe('PinCodeRegistrationService - Overlapping Timeframes', () => {
  let service: PinCodeRegistrationService;
  let repo: PinCodeRegistrationRepository;
  let doorService: DoorService;
  let doorRepository: DoorRepository;

  beforeEach(() => {
    repo = new PinCodeRegistrationRepository();
    doorRepository = new DoorRepository();
    doorService = new DoorService(doorRepository, repo);
    service = new PinCodeRegistrationService(repo, doorService);
  });

  it('should allow overlapping PIN codes for the same door', async () => {
    const startDate1 = new Date('2024-01-01T00:00:00Z');
    const endDate1 = new Date('2024-01-10T23:59:59Z');
    const startDate2 = new Date('2024-01-05T00:00:00Z');
    const endDate2 = new Date('2024-01-15T23:59:59Z');

    await service.registerPinCodeAuthorizations('user1', {
      pinCode: '1234',
      doorIds: ['main'],
      restrictions: [{ validFrom: startDate1, validTo: endDate1 }],
    });

    await service.registerPinCodeAuthorizations('user1', {
      pinCode: '5678',
      doorIds: ['main'],
      restrictions: [{ validFrom: startDate2, validTo: endDate2 }],
    });

    const allRegistrations = await service.getAllRegistrationsForUser('user1');
    expect(allRegistrations).toHaveLength(2);
  });

  it('should validate access for overlapping PIN codes', async () => {
    const startDate1 = new Date('2024-01-01T00:00:00Z');
    const endDate1 = new Date('2024-01-10T23:59:59Z');
    const startDate2 = new Date('2024-01-05T00:00:00Z');
    const endDate2 = new Date('2024-01-15T23:59:59Z');

    await service.registerPinCodeAuthorizations('user1', {
      pinCode: '1234',
      doorIds: ['main'],
      restrictions: [{ validFrom: startDate1, validTo: endDate1 }],
    });

    await service.registerPinCodeAuthorizations('user1', {
      pinCode: '5678',
      doorIds: ['main'],
      restrictions: [{ validFrom: startDate2, validTo: endDate2 }],
    });

    const dateWithinOverlap = new Date('2024-01-07T12:00:00Z');

    const canAccessPin1 = await service.validateAccess(
      'user1',
      '1234',
      'main',
      dateWithinOverlap
    );
    const canAccessPin2 = await service.validateAccess(
      'user1',
      '5678',
      'main',
      dateWithinOverlap
    );

    expect(canAccessPin1).toBe(true);
    expect(canAccessPin2).toBe(true);
  });
});
