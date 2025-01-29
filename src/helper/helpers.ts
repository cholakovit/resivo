import { PinCodeRegistrationEntity } from "src/Coding Challenge/PinCodes/Model/PinCodeRegistrationEntity";


/**
 * Validates a PIN code registration for a specific door and date.
 *
 * @param fetchRegistration - A function to asynchronously fetch the registration details.
 * @param doorId - The ID of the door to validate access for.
 * @param date - The date and time of the access attempt.
 * @returns {Promise<boolean>} True if the PIN code is valid for the door at the specified time, false otherwise.
 */
export async function validateRegistration(
    fetchRegistration: () => Promise<PinCodeRegistrationEntity | null>,
    doorId: string,
    date: Date
  ): Promise<boolean> {
    const registration = await fetchRegistration();
    return isValidRegistration(registration, doorId, date);
  }

/**
 * Checks if a given PIN code registration is valid for a specific door and date.
 *
 * @param registration - The PIN code registration to validate. Can be null.
 * @param doorId - The ID of the door to validate access for.
 * @param date - The date and time of the access attempt.
 * @returns {boolean} True if the registration is valid for the specified door and date, false otherwise.
 */
export function isValidRegistration(
  registration: PinCodeRegistrationEntity | null,
  doorId: string,
  date: Date
): boolean {
  if (!registration) return false;

  if (!registration.doorIds.includes(doorId)) return false;

  if (
    registration.restrictions?.length &&
    !isDateWithinRestrictions(registration.restrictions, date)
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
export function isDateWithinRestrictions(
  restrictions: AccessRestrictions[],
  date: Date
): boolean {
  if (!restrictions || restrictions.length === 0) return true;

  return restrictions.some(({ validFrom, validTo }) => {
    const isWithinValidFrom = !validFrom || date >= validFrom;
    const isWithinValidTo = !validTo || date <= validTo;

    return isWithinValidFrom && isWithinValidTo;
  });
}
