import { Injectable } from "@nestjs/common";
import { DoorRepository } from "../Repositories/DoorRepository";
import { LogEnabled } from "../../../Boilerplate/Logging/LogEnabled";
import { PinCodeRegistrationRepository } from "../../PinCodes/Repositories/PinCodeRegistrationRepository";
import { CacheResult } from "src/helper/decorators";

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
     * a given time, with caching logic..
     */

    @CacheResult(60, 'access-validation')
    async validateAccessRequest(doorId: string, pinCode: string, timestamp: Date): Promise<boolean> {
        return await this.pinCodeRepository.isPinValidForDoor(pinCode, doorId, timestamp);
    }
}
