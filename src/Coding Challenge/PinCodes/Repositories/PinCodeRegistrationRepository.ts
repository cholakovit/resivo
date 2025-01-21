import { MemoryRepository } from "../../../Boilerplate/Data/MemoryRepository";
import { Injectable } from "@nestjs/common";
import { PinCodeRegistrationEntity } from "../Model/PinCodeRegistrationEntity";
import { Logger } from "@nestjs/common";
import ApiError from "src/helper/ApiError";
import { StatusCodes } from "http-status-codes";
import { retry } from "rxjs";
import { PinCodeRegistration } from "../Model/PinCodeRegistration";

/**
 * A repository that provides access to stored pin registrations
 * May contain additional data lookups, if the base methods
 * aren't sufficient.
 */

@Injectable()
export class PinCodeRegistrationRepository extends MemoryRepository<PinCodeRegistrationEntity> {
  private database: Map<string, PinCodeRegistrationEntity[]> = new Map();
  private readonly logger = new Logger(PinCodeRegistrationEntity.name);

  /**
   * Saves or updates a PIN code registration for a specific user.
   *
   * If a registration with the same PIN code already exists for the user, it updates the existing registration.
   * Otherwise, it creates a new registration.
   *
   * @param registration - The PIN code registration to save or update.
   * @returns {Promise<void>} No return value.
   * @logs Logs a message indicating whether the registration was created or updated.
   */
  async savePinCodeRegistration(
    registration: PinCodeRegistrationEntity
  ): Promise<void> {
    const { registeredBy, pinCode } = registration;

    if (!this.database.has(registeredBy)) this.database.set(registeredBy, []);
    const userRegistrations = this.database.get(registeredBy) || [];
    const existingRegistration = this.findRegistrationByPinCode(
      userRegistrations,
      pinCode
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

  /**
   * Retrieves all PIN code registrations from the database.
   *
   * Aggregates all registrations for all users into a single array.
   *
   * @returns {Promise<PinCodeRegistrationEntity[]>} An array containing all PIN code registrations.
   * @logs Logs the total number of registrations retrieved.
   */
  async findAll(): Promise<PinCodeRegistrationEntity[]> {
    const allRegistrations: PinCodeRegistrationEntity[] = [];

    this.database.forEach((reg: PinCodeRegistrationEntity[]) => {
      allRegistrations.push(...reg);
    });

    this.logger.log(
      `Returning ${allRegistrations.length} registrations from the database.`
    );

    return allRegistrations;
  }

  // Optimized but not tested!
  // async findAll(): Promise<PinCodeRegistrationEntity[]> {
  //   return Array.from(this.database.values()).flat();
  // }

  /**
   * Deletes a specific PIN code registration for a user.
   *
   * If the user has no remaining registrations after deletion, the user is removed from the database.
   *
   * @param userId - The ID of the user whose registration is being deleted.
   * @param pinCode - The PIN code to delete.
   * @returns {Promise<void>} No return value.
   * @logs Logs a message indicating the successful deletion of the registration. If the user has no remaining registrations, they are removed from the database.
   */
  async deletePinCodeRegistration(
    userId: string,
    pinCode: string
  ): Promise<void> {
    const userRegistrations = this.getUserRegistrations(userId);
    this.removePinCode(userRegistrations, userId, pinCode);

    if (userRegistrations.length === 0) this.removeUser(userId);
    else
      this.logger.log(
        `Deleted registration for PIN code: ${pinCode}, user: ${userId}`
      );
  }

  /**
   * Retrieves a specific PIN code registration for a user.
   *
   * @param userId - The ID of the user whose registration is being retrieved.
   * @param pinCode - The PIN code associated with the registration.
   * @returns {Promise<PinCodeRegistrationEntity | null>} The registration details if found, or null if not found.
   * @logs Logs a warning if no registrations are found for the user or if the specific PIN code is not found.
   */
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

    const registration = this.findRegistrationByPinCode(
      userRegistrations,
      pinCode
    );

    if (!registration) {
      this.logger.warn(
        `No registration found for pinCode: ${pinCode} for userId: ${userId}`
      );
      return null;
    }

    return registration;
  }

  /**
   * Validates whether a given PIN code is authorized to access a specific door at a specific time.
   *
   * @param pin - The PIN code to validate.
   * @param door - The door identifier to check access for.
   * @param dateTime - The date and time of the access attempt.
   * @returns {Promise<boolean>} True if the PIN code is valid for the door at the specified time, false otherwise.
   */
  async isPinValidForDoor(
    pin: string,
    door: string,
    dateTime: Date
  ): Promise<boolean> {
    return this.validateRegistration(
      () => this.findByPinCode(pin),
      door,
      new Date(dateTime)
    );
  }

  /**
   * Retrieves all PIN code registrations for a specific user.
   *
   * @param userId - The ID of the user whose registrations are being retrieved.
   * @returns {PinCodeRegistrationEntity[]} An array of PIN code registrations associated with the user.
   * @throws {ApiError} If no registrations are found for the user.
   */
  getUserRegistrations(userId: string): PinCodeRegistrationEntity[] {
    const userRegistrations = this.database.get(userId);
    if (!userRegistrations) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `No registrations found for user: ${userId}`
      );
    }
    return userRegistrations;
  }

  /**
   * Searches for a PIN code registration across all users.
   * Expensive O(n + m)
   *
   * @param pinCode - The PIN code to search for.
   * @returns {Promise<PinCodeRegistrationEntity | null>} The registration if found, or null if not found.
   */
  private async findByPinCode(
    pinCode: string
  ): Promise<PinCodeRegistrationEntity | null> {
    for (const userRegistrations of this.database.values()) {
      const registration = userRegistrations.find(
        (reg: PinCodeRegistrationEntity) => reg.pinCode === pinCode
      );
      if (registration) return registration;
    }
    return null;
  }

  /**
   * Searches for a specific PIN code registration within a user's registrations.
   *
   * @param userRegistrations - An array of the user's PIN code registrations to search in.
   * @param pinCode - The PIN code to look for.
   * @returns {PinCodeRegistrationEntity | null} The registration if found, or null if not found.
   */
  private findRegistrationByPinCode(
    userRegistrations: PinCodeRegistrationEntity[] | undefined,
    pinCode: string
  ): PinCodeRegistrationEntity | null {
    if (!userRegistrations) return null;

    return (
      userRegistrations.find(
        (reg: PinCodeRegistrationEntity) => reg.pinCode === pinCode
      ) || null
    );
  }

  /**
   * Removes a specific PIN code registration from a user's list of registrations.
   * another way with .filter, but creates a new array
   *
   * @param userRegistrations - The array of the user's PIN code registrations.
   * @param userId - The ID of the user whose PIN code is being removed.
   * @param pinCode - The PIN code to remove.
   * @throws {ApiError} If the specified PIN code is not found in the user's registrations.
   * @returns {void} No return value.
   */
  private removePinCode(
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

  /**
   * Removes all registrations for a specific user from the database.
   *
   * @param userId - The ID of the user whose registrations are being removed.
   * @returns {void} No return value.
   * @logs Logs a message indicating that all registrations for the user have been removed.
   */
  private removeUser(userId: string): void {
    this.database.delete(userId);
    this.logger.log(`Removed all registrations for user: ${userId}`);
  }

  /**
   * Validates a PIN code registration for a specific door and date.
   *
   * @param fetchRegistration - A function to asynchronously fetch the registration details.
   * @param doorId - The ID of the door to validate access for.
   * @param date - The date and time of the access attempt.
   * @returns {Promise<boolean>} True if the registration is valid for the door and date, false otherwise.
   */
  async validateRegistration(
    fetchRegistration: () => Promise<PinCodeRegistrationEntity | null>,
    doorId: string,
    date: Date
  ): Promise<boolean> {
    const registration = await fetchRegistration();
    return this.isValidRegistration(registration, doorId, date);
  }

  /**
   * Checks if a given PIN code registration is valid for a specific door and date.
   *
   * @param registration - The PIN code registration to validate. Can be null.
   * @param doorId - The ID of the door to validate access for.
   * @param date - The date and time of the access attempt.
   * @returns {boolean} True if the registration is valid for the specified door and date, false otherwise.
   */
  isValidRegistration(
    registration: PinCodeRegistrationEntity | null,
    doorId: string,
    date: Date
  ): boolean {
    if (!registration) return false;

    if (!registration.doorIds.includes(doorId)) return false;

    if (
      registration.restrictions?.length &&
      !this.isDateWithinRestrictions(registration.restrictions, date)
    )
      return false;

    return true;
  }

  /**
   * Checks if a given date falls within the specified access restrictions.
   *
   * @param restrictions - An array of restriction objects containing optional start and end dates.
   * @param date - The date to validate against the restrictions.
   * @returns {boolean} True if the date falls within at least one of the restrictions, or if no restrictions are specified. Otherwise, returns false.
   */
  isDateWithinRestrictions(
    restrictions: Array<{ validFrom?: Date; validTo?: Date }>,
    date: Date
  ): boolean {
    if (!restrictions || restrictions.length === 0) return true;

    return restrictions.some(({ validFrom, validTo }) => {
      const isWithinValidFrom = !validFrom || date >= validFrom;
      const isWithinValidTo = !validTo || date <= validTo;

      return isWithinValidFrom && isWithinValidTo;
    });
  }
}
