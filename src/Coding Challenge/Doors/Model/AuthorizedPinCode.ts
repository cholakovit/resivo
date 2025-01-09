import { AccessRestrictions } from "../../PinCodes/Model/AccessRestrictions";

/**
 * Represents a single entry in a door's whitelist, along with potential
 * restrictions that indicate at what times the door can be opened.
 */
export interface AuthorizedPinCode {

    // ///////////////////////////////////////////////////////////////////////////////////////////
    // THERE IS NOTHING TO DO IN HERE - DO NOT CHANGE THIS MODEL, EVEN IF IT FEEL CLUMSY TO YOU ;)
    // ///////////////////////////////////////////////////////////////////////////////////////////

    /**
     * The PIN code that is being stored in the door.
     */
    pinCode: string;

    /**
     * Optional restrictions to be applied when evaluating an access request.
     */
    restrictions?: AccessRestrictions[];
}
