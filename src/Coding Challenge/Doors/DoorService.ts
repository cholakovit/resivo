import { Injectable, NotFoundException } from "@nestjs/common";
import { DoorRepository } from "./DoorRepository";
import { LogEnabled } from "../../Boilerplate/Logging/LogEnabled";
import { PinCodeRegistrationRepository } from "../PinCodes/PinCodeRegistrationRepository";


/**
 * Implements business logic to interact with doors and
 * manage their lists of authorized PIN codes.
 */
@Injectable()
export class DoorService extends LogEnabled {


    constructor(private doorRepository: DoorRepository, private pinCodeRepository: PinCodeRegistrationRepository) {
        super();
    }

    /**
     * Resolves all doors and their current PIN authorizations.
     */
    async getDoors() {
        // nothing to do here - just a little helper for you during testing
        return await this.doorRepository.findAll();
    }


    /**
     * Resolves whether a given key is authorized to open the specified door at
     * a given time.
     */

    async validateAccessRequest(doorId: string, pinCode: string, timestamp: Date) {
        // const door = await this.doorRepository.findById(doorId);
        // if(!door) {
        //     throw new NotFoundException(`Door with ID "${doorId}" not found.`)
        // }

        console.log('validateAccessRequest: ', doorId)

        const pinEntries = await this.pinCodeRepository.findAll()
        const pinEntry = pinEntries.find(entry => entry.pinCode === pinCode)

        if(!pinEntry) return false

        if(!pinEntry.doorIds.includes(doorId)) return false
        
        const isValid = pinEntry.restrictions.every(restruction => {
            const validForm = restruction.validFrom ? new Date(restruction.validFrom) : null;
            const validTo = restruction.validTo ? new Date(restruction.validTo): null;

            if(validForm && timestamp < validForm) return false
            if(validTo && timestamp > validTo) return false

            return true
        })

        return isValid

    }
}
