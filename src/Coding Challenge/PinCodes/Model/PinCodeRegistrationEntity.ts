import { PinCodeRegistration } from "./PinCodeRegistration";
import { AccessRestrictions } from "./AccessRestrictions";

export class PinCodeRegistrationEntity implements PinCodeRegistration {

    // //////////////////////////////
    // THERE IS NOTHING TO DO IN HERE
    // //////////////////////////////

    /**
     * Internal ID, set by the repository on creation.
     */
    id?: string;

    /**
     * Who created that registration (user ID).
     */
    registeredBy: string;

    /**
     * The registered PIN code.
     */
    pinCode: string;

    /**
     * The authorized doors.
     */
    doorIds: string[];

    /**
     * Optional restrictions.
     */
    restrictions?: AccessRestrictions[];
}
