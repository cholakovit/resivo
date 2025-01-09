import { AuthorizedPinCode } from "./AuthorizedPinCode";

/**
 * Represents a door in our system.
 */
export interface DoorEntity {

    // ///////////////////////////////////////////////////////////////////////////////////////////
    // THERE IS NOTHING TO DO IN HERE - DO NOT CHANGE THIS MODEL, EVEN IF IT FEEL CLUMSY TO YOU ;)
    // ///////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Door identifier, to be used when specifying doors
     * through the endpoints.
     */
    id: string;

    /**
     * Just a label for the door.
     */
    name: string;

    /**
     * Represents a list of registered PIN codes and their
     * access restrictions.
     */
    authorizedPinCodes: AuthorizedPinCode[];
}
