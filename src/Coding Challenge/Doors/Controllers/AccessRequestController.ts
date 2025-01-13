import { Body, Controller, ForbiddenException, Get, HttpCode, Inject, Param, Post, Scope } from "@nestjs/common";
import { AccessRequestDto } from "../Dtos/AccessRequestDto";
import { DoorService } from "../Services/DoorService";
import { REQUEST } from "@nestjs/core";
import { ControllerBase } from "../../../Boilerplate/Controllers/ControllerBase";
import { Request } from "express";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller({
    scope: Scope.REQUEST
})
@ApiTags("IoT Simulation")
export class AccessRequestController extends ControllerBase {
    constructor(@Inject(REQUEST) request: Request,
                private doorService: DoorService) {
        super(request);
    }

    // ///////////////////////////////////////
    // THERE IS PROBABLY NOTHING TO DO IN HERE
    // ///////////////////////////////////////


    @Get("doors")
    @ApiOperation({
        summary: "Returns a summary of all our doors and the PINs that are whitelisted on them.",
    })
    async getDoors() {
        return await this.doorService.getDoors();
    }


    /**
     * This endpoint is used to simulate an access request. We assume somebody
     * entered the submitted pin code, and it's the specified time. This endpoint
     * should indicate whether the door should open or not.
     */
    @Post("doors/:doorId")
    @HttpCode(200)
    @ApiOperation({
        summary: "Simulates a PIN entry at a given door at a specific time.",
        description: "Your code should validate whether the door would open or not in the simulated scenario, and return the result accordingly."
    })
    async validateAccessRequest(@Param("doorId") doorId: string, @Body() accessRequest: AccessRequestDto) {
        
        console.log('validateAccessRequest Controller: ', doorId)

        return await this.doorService.validateAccessRequest(doorId, accessRequest.pinCode, accessRequest.simulatedTimestamp);
    }


}
