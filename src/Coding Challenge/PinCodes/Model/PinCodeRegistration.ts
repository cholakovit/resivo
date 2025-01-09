import { AccessRestrictions } from "./AccessRestrictions";

export interface PinCodeRegistration {

    // //////////////////////////////
    // THERE IS NOTHING TO DO IN HERE
    // //////////////////////////////



    /**
     * The registered pin code that is being whitelisted in the authorized
     * devices.
     */
    pinCode: string;

    /**
     * The authorized doors that will whitelist the registered pin code.
     */
    doorIds: string[];


    /**
     * Optional restrictions: If specified, the door will only open
     * at the specified times for that key.
     */
    restrictions?: AccessRestrictions[];

}
