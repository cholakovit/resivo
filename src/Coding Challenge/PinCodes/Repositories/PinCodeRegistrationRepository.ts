import { Injectable } from "@nestjs/common";
import { MemoryRepository } from "../../../Boilerplate/Data/MemoryRepository";
import { PinCodeRegistrationEntity } from "../Model/PinCodeRegistrationEntity";
import { Logger } from "@nestjs/common";
import ApiError from "src/helper/ApiError";
import { StatusCodes } from "http-status-codes";
import { validateRegistration } from "src/helper/helpers";

@Injectable()
export class PinCodeRegistrationRepository extends MemoryRepository<PinCodeRegistrationEntity> {
  private readonly logger = new Logger(PinCodeRegistrationEntity.name);

  /**
   * Saves or updates a PIN code registration for a specific user.
   * If a registration with the same PIN code already exists for the user, it updates the existing one.
   * Otherwise, it creates a new registration.
   */
  async savePinCodeRegistration(registration: PinCodeRegistrationEntity): Promise<void> {
    const id = `${registration.registeredBy}:${registration.pinCode}`; // Unique key: userId:pinCode
    registration.id = id;

    if (await this.findById(id)) {
      await this.update(registration);
      this.logger.log(`Updated registration for PIN code: ${registration.pinCode}, user: ${registration.registeredBy}`);
    } else {
      await this.create(registration);
      this.logger.log(`Created new registration for PIN code: ${registration.pinCode}, user: ${registration.registeredBy}`);
    }
  }

  /**
   * Retrieves all PIN code registrations for a specific user.
   */
  async getUserRegistrations(userId: string): Promise<PinCodeRegistrationEntity[]> {
    const allRegistrations = await this.findAll();
    const userRegistrations = allRegistrations.filter((reg) => reg.registeredBy === userId);

    if (userRegistrations.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `No registrations found for user: ${userId}`);
    }

    return userRegistrations;
  }

  /**
   * Retrieves a specific PIN code registration for a user.
   */
  async getRegistration(userId: string, pinCode: string): Promise<PinCodeRegistrationEntity | null> {
    const id = `${userId}:${pinCode}`;
    const registration = await this.findById(id);

    if (!registration) {
      this.logger.warn(`No registration found for PIN code: ${pinCode}, user: ${userId}`);
      return null;
    }

    return registration;
  }

  /**
   * Deletes a specific PIN code registration for a user.
   */
  async deletePinCodeRegistration(userId: string, pinCode: string): Promise<void> {
    const id = `${userId}:${pinCode}`;
    const registration = await this.findById(id);

    if (!registration) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `PIN code ${pinCode} not found for user: ${userId}`);
    }

    await this.delete(id);
    this.logger.log(`Deleted registration for PIN code: ${pinCode}, user: ${userId}`);
  }

  /**
   * Validates whether a given PIN code is authorized to access a specific door at a specific time.
   */
  async isPinValidForDoor(pin: string, door: string, dateTime: Date): Promise<boolean> {
    return validateRegistration(() => this.findByPinCode(pin), door, new Date(dateTime));
  }

  /**
   * Searches for a PIN code registration across all users.
   */
  private async findByPinCode(pinCode: string): Promise<PinCodeRegistrationEntity | null> {
    const allRegistrations = await this.findAll();
    return allRegistrations.find((reg) => reg.pinCode === pinCode) || null;
  }
}
