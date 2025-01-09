import { Injectable, NotFoundException } from "@nestjs/common";
import { DoorService } from '../Doors/DoorService';
import { PinCodeRegistrationDto } from './Dtos/PinCodeRegistrationDto';
import { PinCodeRegistrationRepository } from './PinCodeRegistrationRepository'

@Injectable()
export class AccessService {
    constructor(
        private readonly doorService: DoorService,
        private readonly PinCodeRegistrationRepository: PinCodeRegistrationRepository
    ) {

    }

    async validateAccess(pin: string, door: string, dateTime: Date) {
        const pinEntry = await this.PinCodeRegistrationRepository.findByPinCode(pin);
        if(!pinEntry) {
            throw new NotFoundException(`PIN code not found`)
        }

        if(!pinEntry) {
            return new NotFoundException('PIN code not found')
        }

        if(!pinEntry.doorIds.includes(door)) {
            return false;
        }

        const restrictions = pinEntry.restrictions.map(restriction => ({
            validFrom: restriction.validFrom || null,
            validTo: restriction.validTo || null
        }))

        const currentDate = new Date(dateTime)
        const isValid = restrictions.every(restriction => {
            if(restriction.validFrom && currentDate < new Date(restriction.validFrom)) {
                return false
            }
            if(restriction.validTo && currentDate > new Date(restriction.validTo)) {
                return false
            }
            return true
        })

        return isValid
    }
}