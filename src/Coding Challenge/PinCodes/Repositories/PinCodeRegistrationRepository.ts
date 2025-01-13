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

  async savePinCodeRegistration(registration: any): Promise<void> {
    const { userId, pinCode } = registration;

    if (!this.database.has(userId)) {
      this.database.set(userId, []);
    }

    const userRegistrations = this.database.get(userId);

    const existingRegistration = userRegistrations.find(
      (reg: PinCodeRegistrationEntity) => reg.pinCode === pinCode
    );

    if (existingRegistration) {
      Object.assign(existingRegistration, registration);
      this.logger.log(
        `Updated registration for PIN code: ${pinCode}, user: ${userId}`
      );
    } else {
      userRegistrations.push(registration);
      this.logger.log(
        `Created new registration for PIN code: ${pinCode}, user: ${userId}`
      );
    }
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

  async deletePicCodeRegistration(
    userId: string,
    pinCode: string
  ): Promise<void> {
    const userRegistrations = this.database.get(userId);

    if (!userRegistrations)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `No registrations found for user: ${userId}`
      );

    const index = userRegistrations.findIndex((reg) => reg.pinCode === pinCode);
    if (index === -1)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `PIN code ${pinCode} not found for user: ${userId}`
      );

    userRegistrations.splice(index, 1);
    this.logger.log(
      `Deleted registration for PIN code: ${pinCode}, user: ${userId}`
    );
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
    const userRegistrations = this.database.get(userId) || [];
    return userRegistrations.find((reg) => reg.pinCode === pinCode) || null;
  }

  async validateRegistration(registration: any): Promise<void> {
    const { userId, pinCode, doorsIds } = registration;

    if (
      !userId ||
      !pinCode ||
      !doorsIds ||
      !Array.isArray(doorsIds) ||
      doorsIds.length === 0
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Invalid registration data. Ensure userId, pinCode, and doorIds are provided."
      );
    }
  }

  async findByPinCode(pinCode: string) {
    for (const userRegistrations of this.database.values()) {
      const registration = userRegistrations.find(
        (reg) => reg.pinCode === pinCode
      );
      if (registration) {
        return registration;
      }
    }
    return null;
  }

  async isPinValidForDoor(
    pin: string,
    door: string,
    dataTime: Date
  ): Promise<boolean> {
    const pinEntry = await this.findByPinCode(pin);
    if (!pinEntry) {
      return false;
    }

    if (!pinEntry.doorIds.includes(door)) {
      return false;
    }

    const currentDate = new Date(dataTime);
    const restrictions = pinEntry.restrictions || [];

    if (restrictions.length === 0) {
      return true;
    }

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
      ) {
        return true;
      }
    }

    return false;
  }
}
