import { Injectable } from "@nestjs/common";
import { PinCodeRegistration } from "../Model/PinCodeRegistration";
import { DoorService } from "../../Doors/Services/DoorService";
import { LogEnabled } from "../../../Boilerplate/Logging/LogEnabled";
import { PinCodeRegistrationRepository } from "../Repositories/PinCodeRegistrationRepository";
import { CacheResult, ClearCache } from "src/helper/decorators";
import ApiError from "src/helper/ApiError";
import { StatusCodes } from "http-status-codes";
import { PinCodeRegistrationEntity } from "../Model/PinCodeRegistrationEntity";

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
  async registerPinCodeAuthorizations(userId: string, registration: PinCodeRegistration) {
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
    registration: PinCodeRegistration
  ) {
    const existingRegistration = await this.findRegistrationOrThrow(
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
    const existingRegistration = await this.findRegistrationOrThrow(
      userId,
      pinCode
    );

    await this.deleteRegistration(userId, pinCode);

    return {
      message: `PIN code ${pinCode} revoked successfully for user: ${userId}`,
      pinCode: pinCode,
      userId: userId,
    };
  }

  async findRegistrationOrThrow(
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

  private async deleteRegistration(userId: string, pinCode: string) {
    await this.pinCodeRegistrationRepository.deletePinCodeRegistration(
      userId,
      pinCode
    );
    this.logger.info(
      `PIN code ${pinCode} revoked successfully for user: ${userId}`
    );
  }

  async validateAccess(
    userId: string,
    pinCode: string,
    doorId: string,
    date: Date
  ): Promise<boolean> {
    const registration =
      await this.pinCodeRegistrationRepository.getRegistration(userId, pinCode);
    if (!registration) return false;

    if (!registration.doorIds.includes(doorId)) return false;

    if (registration.restrictions?.length) 
      if (this.isAccessRestricted(registration.restrictions, date)) return false;

    return true;
  }

  async getAllRegistrationsForUser(
    userId: string
  ): Promise<PinCodeRegistration[]> {
    return await this.pinCodeRegistrationRepository.getUserRegistrations(
      userId
    );
  }

  private async validateDoors(doorIds: string[]) {
    const availableDoors = await this.doorService.getDoors();
    const invalidDoors = doorIds.filter(
      (doorIds) => !availableDoors.some((door) => door.id === doorIds)
    );
    if (invalidDoors.length > 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Doors ${invalidDoors.join(", ")} are not available`
      );
    }
  }

  private isAccessRestricted(
    restrictions: AccessRestrictions[],
    date: Date
  ): boolean {
    return restrictions.some(({ validFrom, validTo }) => {
      const isBeforeValidFrom = validFrom ? date < validFrom : false;
      const isAfterValidTo = validTo ? date > validTo : false;
  
      return isBeforeValidFrom || isAfterValidTo;
    });
  }
}
