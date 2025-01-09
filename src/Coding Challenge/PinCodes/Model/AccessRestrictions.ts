/**
 * Limits access to a given timespan.
 */
export interface AccessRestrictions {

    // //////////////////////////////
    // THERE IS NOTHING TO DO IN HERE
    // //////////////////////////////


    /**
     * If specified, the pinCode is valid as of this
     * timestamp. Otherwise, it's valid immediately.
     */
    validFrom?: Date;

    /**
     * If specified, the pinCode is valid until this
     * timestamp. Otherwise, access will never expire.
     */
    validTo?: Date;
}
