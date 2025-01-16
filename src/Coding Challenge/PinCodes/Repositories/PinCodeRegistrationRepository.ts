import { MemoryRepository } from "../../../Boilerplate/Data/MemoryRepository";
import { Injectable } from "@nestjs/common";
import { PinCodeRegistrationEntity } from "../Model/PinCodeRegistrationEntity";
import { Logger } from "@nestjs/common";
import ApiError from "src/helper/ApiError";
import { StatusCodes } from "http-status-codes";

/**
 * A repository that provides access to stored pin registrations
 * May contain additional data lookups, if the base methods
 * aren't sufficient.
 */

@Injectable()
export class PinCodeRegistrationRepository extends MemoryRepository<PinCodeRegistrationEntity> {
  private database: Map<string, PinCodeRegistrationEntity[]> = new Map();
  private readonly logger = new Logger(PinCodeRegistrationEntity.name);

  async savePinCodeRegistration(
    registration: PinCodeRegistrationEntity
  ): Promise<void> {
    const { registeredBy, pinCode } = registration;

    if (!this.database.has(registeredBy)) this.database.set(registeredBy, []);

    const userRegistrations = this.database.get(registeredBy);

    const existingRegistration = userRegistrations.find(
      (reg: PinCodeRegistrationEntity) => reg.pinCode === pinCode
    );

    if (existingRegistration) {
      Object.assign(existingRegistration, registration);
      this.logger.log(
        `Updated registration for PIN code: ${pinCode}, user: ${registeredBy}`
      );
    } else {
      userRegistrations.push(registration);
      this.logger.log(
        `Created new registration for PIN code: ${pinCode}, user: ${registeredBy}`
      );
    }
  }

  async findByPinCode(pinCode: string) {
    for (const userRegistrations of this.database.values()) {
      const registration = userRegistrations.find(
        (reg) => reg.pinCode === pinCode
      );
      if (registration) return registration;
    }
    return null;
  }

  async findAll(): Promise<PinCodeRegistrationEntity[]> {
    const allRegistrations: PinCodeRegistrationEntity[] = [];

    this.database.forEach((registrations) => {
      allRegistrations.push(...registrations);
    });

    this.logger.log(
      `Returning ${allRegistrations.length} registrations from the database.`
    );

    return allRegistrations;
  }

  async deletePinCodeRegistration(
    userId: string,
    pinCode: string
  ): Promise<void> {
    const userRegistrations = this.getUserRegistrationsOrThrow(userId);
    this.removePinCodeOrThrow(userRegistrations, userId, pinCode);
  
    if (userRegistrations.length === 0) {
      this.removeUserFromDatabase(userId);
    } else {
      this.logger.log(
        `Deleted registration for PIN code: ${pinCode}, user: ${userId}`
      );
    }
  }

  async getUserRegistrations(
    userId: string
  ): Promise<PinCodeRegistrationEntity[]> {
    return this.database.get(userId) || [];
  }

  async getRegistration(
    userId: string,
    pinCode: string
  ): Promise<PinCodeRegistrationEntity | null> {
    const userRegistrations = this.database.get(userId);

    if (!userRegistrations) {
      this.logger.warn(
        `No registrations found for userId: ${userId} when looking for pinCode: ${pinCode}`
      );
      return null; 
    }
  
    const registration = userRegistrations.find((reg) => reg.pinCode === pinCode);
    if (!registration) {
      this.logger.warn(
        `No registration found for pinCode: ${pinCode} for userId: ${userId}`
      );
      return null;
    }
  
    return registration;
  }

  async validateRegistration(registration: Registration): Promise<void> {
    const { userId, pinCode, doorsIds } = registration;

    if (
      !userId ||
      !pinCode ||
      !doorsIds ||
      !Array.isArray(doorsIds) ||
      doorsIds.length === 0 ||
      !doorsIds.every((doorId) => typeof doorId === "string" && doorId.trim() !== "")
    )
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Invalid registration data. Ensure userId, pinCode, and doorIds are provided."
      );
  }

  async isPinValidForDoor(
    pin: string,
    door: string,
    dataTime: Date
  ): Promise<boolean> {
    const pinEntry = await this.findByPinCode(pin);
    return this.isValidPinEntry(pinEntry, door, new Date(dataTime))
  }

  private isValidPinEntry(
    pinEntry: PinCodeRegistrationEntity | null,
    door: string,
    currentDate: Date
  ): boolean {
    if (!pinEntry) return false;
  
    if (!pinEntry.doorIds.includes(door)) return false;
  
    if (!this.isWithinRestrictions(pinEntry.restrictions, currentDate)) return false;
  
    return true;
  }

  private isWithinRestrictions(
    restrictions: Array<{ validFrom?: Date; validTo?: Date }>,
    currentDate: Date
  ): boolean {
    if (!restrictions || restrictions.length === 0) return true;

    for (const restriction of restrictions) {
      const validFrom = restriction.validFrom
        ? new Date(restriction.validFrom)
        : null;
      const validTo = restriction.validTo
        ? new Date(restriction.validTo)
        : null;

      if (
        (!validFrom || currentDate >= validFrom) &&
        (!validTo || currentDate <= validTo)
      )
        return true;
    }

    return false;
  }

  private getUserRegistrationsOrThrow(userId: string): PinCodeRegistrationEntity[] {
    const userRegistrations = this.database.get(userId);
    if (!userRegistrations) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `No registrations found for user: ${userId}`
      );
    }
    return userRegistrations;
  }
  
  private removePinCodeOrThrow(
    userRegistrations: PinCodeRegistrationEntity[],
    userId: string,
    pinCode: string
  ): void {
    const index = userRegistrations.findIndex((reg) => reg.pinCode === pinCode);
    if (index === -1) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Attempt to delete PIN code failed. PIN code ${pinCode} not found for user: ${userId}`
      );
    }
    userRegistrations.splice(index, 1);
  }

  private removeUserFromDatabase(userId: string): void {
    this.database.delete(userId);
    this.logger.log(`Removed all registrations for user: ${userId}`);
  }
}
