import { Injectable } from "@nestjs/common";
import { PinCodeRegistration } from "../Model/PinCodeRegistration";
import { DoorService } from "../../Doors/Services/DoorService";
import { LogEnabled } from "../../../Boilerplate/Logging/LogEnabled";
import { PinCodeRegistrationRepository } from "../Repositories/PinCodeRegistrationRepository";
import { CacheResult, ClearCache } from "src/helper/decorators";
import ApiError from "src/helper/ApiError";
import { StatusCodes } from "http-status-codes";
import { PinCodeRegistrationEntity } from "../Model/PinCodeRegistrationEntity";
import { validateRegistration } from "src/helper/helpers";
import { PinCodeRegistrationDto } from "../Dtos/PinCodeRegistrationDto";

@Injectable()
export class PinCodeRegistrationService extends LogEnabled {
  constructor(
    private pinCodeRegistrationRepository: PinCodeRegistrationRepository,
    private doorService: DoorService
  ) {
    super();
  }

  /**
   * Gets all current registrations with caching.
   */
  @CacheResult(120, "user-registrations")
  async getRegistrations() {
    // nothing to do here - just a little helper for you during testing
    return this.pinCodeRegistrationRepository.findAll();
  }

  /**
   * Registers a new pinCode registration and updates the whitelists
   * of the authorized devices accordingly.
   */
  async registerPinCodeAuthorizations(
    userId: string,
    registration: PinCodeRegistrationDto
  ) {
    await this.validateDoors(registration.doorIds);

    const pinRegistration: PinCodeRegistration = {
      pinCode: registration.pinCode,
      doorIds: registration.doorIds,
      restrictions: registration.restrictions || [],
    };

    await this.pinCodeRegistrationRepository.savePinCodeRegistration({
      ...pinRegistration,
      registeredBy: userId,
    } as PinCodeRegistrationEntity);

    this.logger.info(
      `PIN code ${registration.pinCode} registered successfully for user: ${userId}`
    );

    return {
      message: `PIN code ${registration.pinCode} registered successfully.`,
      pinCode: registration.pinCode,
      doorIds: registration.doorIds,
      restrictions: registration.restrictions || [],
    };
  }

  /**
   * Updates an existing pinCode registration and updates the whitelists
   * of the authorized devices accordingly.
   */
  async updatePinCodeAuthorizations(
    userId: string,
    registration: PinCodeRegistrationDto
  ) {
    const existingRegistration = await this.findRegistration(
      userId,
      registration.pinCode
    );

    await this.validateDoors(registration.doorIds);

    const updatedRegistration = {
      ...existingRegistration,
      doorIds: registration.doorIds,
      restrictions:
        registration.restrictions || existingRegistration.restrictions,
    };

    await this.pinCodeRegistrationRepository.savePinCodeRegistration(
      updatedRegistration
    );

    return {
      message: `PIN code ${registration.pinCode} updated successfully for user: ${userId}`,
      pinCode: registration.pinCode,
      doorIds: registration.doorIds,
      restrictions: registration.restrictions || [],
    };
  }

  /**
   * Revokes the user's registration for the specified pin code.
   */
  @ClearCache("user-registrations")
  async revokePinCodeAuthorizations(userId: string, pinCode: string) {
    const existingRegistration = await this.findRegistration(userId, pinCode);

    await this.deleteRegistration(userId, pinCode);

    return {
      message: `PIN code ${pinCode} revoked successfully for user: ${userId}`,
      pinCode: pinCode,
      userId: userId,
    };
  }

  /**
   * Finds a registration for a specific user and PIN code.
   *
   * @param userId - The ID of the user who owns the registration.
   * @param pinCode - The PIN code associated with the registration.
   * @returns {Promise<PinCodeRegistrationEntity>} The registration details if found.
   * @throws {ApiError} If the registration is not found.
   */
  async findRegistration(
    userId: string,
    pinCode: string
  ): Promise<PinCodeRegistrationEntity> {
    const registration =
      await this.pinCodeRegistrationRepository.getRegistration(userId, pinCode);
    if (!registration) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `PIN code ${pinCode} not found for user: ${userId}`
      );
    }

    return registration;
  }

  /**
   * Deletes a registration for a specific user and PIN code.
   *
   * @param userId - The ID of the user whose registration will be deleted.
   * @param pinCode - The PIN code associated with the registration to be deleted.
   * @returns {Promise<void>} No return value.
   * @logs Logs a message indicating the successful deletion of the registration.
   */
  private async deleteRegistration(userId: string, pinCode: string) {
    await this.pinCodeRegistrationRepository.deletePinCodeRegistration(
      userId,
      pinCode
    );
    this.logger.info(
      `PIN code ${pinCode} revoked successfully for user: ${userId}`
    );
  }

  /**
   * Validates whether a user has access to a specific door using a PIN code at a given time.
   *
   * @param userId - The ID of the user attempting to access the door.
   * @param pinCode - The PIN code provided for access.
   * @param doorId - The ID of the door the user is trying to access.
   * @param date - The date and time of the access attempt.
   * @returns {Promise<boolean>} True if the access is valid, false otherwise.
   */
  async validateAccess(
    userId: string,
    pinCode: string,
    doorId: string,
    date: Date
  ): Promise<boolean> {
    return validateRegistration(
      () => this.pinCodeRegistrationRepository.getRegistration(userId, pinCode),
      doorId,
      date
    );
  }

  /**
   * Retrieves all PIN code registrations for a specific user.
   *
   * @param userId - The ID of the user whose registrations need to be retrieved.
   * @returns {Promise<PinCodeRegistration[]>} A list of PIN code registrations associated with the user.
   */
  async getAllRegistrationsForUser(
    userId: string
  ): Promise<PinCodeRegistration[]> {
    return await this.pinCodeRegistrationRepository.getUserRegistrations(
      userId
    );
  }

  /**
   * Validates whether the provided door IDs exist in the system.
   *
   * @param doorIds - An array of door IDs to validate.
   * @throws {ApiError} If any of the provided door IDs are not available.
   * @returns {Promise<void>} No return value if validation is successful.
   */
  private async validateDoors(doorIds: string[]) {
    const availableDoors = await this.doorService.getDoors();
    const availableDoorIds = new Set(availableDoors.map((door) => door.id));

    const invalidDoors = doorIds.filter(
      (doorId) => !availableDoorIds.has(doorId)
    );

    if (invalidDoors.length > 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Doors ${invalidDoors.join(", ")} are not available`
      );
    }
  }
}