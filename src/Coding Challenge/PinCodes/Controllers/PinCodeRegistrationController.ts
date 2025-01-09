import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Scope } from "@nestjs/common";
import { PinCodeRegistrationService } from "../PinCodeRegistrationService";
import { PinCodeRegistrationDto } from "../Dtos/PinCodeRegistrationDto";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { ControllerBase } from "../../../Boilerplate/Controllers/ControllerBase";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";


@Controller({
    scope: Scope.REQUEST
})
@ApiTags("PIN Registration")
@ApiHeader({
    name: "x-user-id",
    description: "Submit one of the supported user IDs (e.g. 'peter' or 'wanda') in order to simulate a user.",
})
export class PinCodeRegistrationController extends ControllerBase {
    constructor(@Inject(REQUEST) request: Request,
                private pinCodeRegistrationService: PinCodeRegistrationService) {
        super(request);
    }

    // ///////////////////////////////////////
    // THERE IS PROBABLY NOTHING TO DO IN HERE
    // ///////////////////////////////////////


    @Get("pin-codes")
    @ApiOperation({
        summary: "Get all registrations (for any user)"
    })
    async getPinCodeRegistration() {
        return await this.pinCodeRegistrationService.getRegistrations();
    }

    @Post("pin-codes")
    @ApiOperation({
        summary: "Create new registration for the current user.",
    })
    async registerPinCodeRegistration(@Body() pinCodeRegistration: PinCodeRegistrationDto) {
        const userId = this.getUserId();
        return await this.pinCodeRegistrationService.registerPinCodeAuthorizations(userId, pinCodeRegistration);
    }

    @Put("pin-codes/:pinCode")
    @ApiOperation({
        summary: "Update an existing registration (identified through the PIN) for the current user.",
    })
    async updatePinCodeRegistration(@Param("pinCode") pinCode: string, @Body() pinCodeRegistration: PinCodeRegistrationDto) {
        const userId = this.getUserId();
        pinCodeRegistration.pinCode = pinCode;
        return await this.pinCodeRegistrationService.updatePinCodeAuthorizations(userId, pinCodeRegistration);
    }

    @Delete("pin-codes/:pinCode")
    @ApiOperation({
        summary: "Revoke the user's registration for a given PIN.",
    })
    async revokePinCodeRegistration(@Param("pinCode") pinCode: string) {
        const userId = this.getUserId();
        return await this.pinCodeRegistrationService.revokePinCodeAuthorizations(userId, pinCode);
    }

}
