import { PinCodeRegistration } from "../Model/PinCodeRegistration";
import { IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { AccessRestrictionsDto } from "./AccessRestrictionsDto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PinCodeRegistrationDto implements PinCodeRegistration {
    /**
     * The registered pin code that is being whitelisted in the authorized
     * devices.
     */
    @ApiProperty({description: "The registered pin code that is being whitelisted in the authorized devices."})
    @IsString()
    pinCode: string;

    /**
     * The authorized doors that will whitelist the registered pin code.
     */
    @ApiProperty({description: "The authorized doors that will whitelist the registered pin code."})
    @IsString({ each: true })
    doorIds: string[];

    /**
     * Optional restrictions: If specified, the door will only open
     * at the specified time for that key.
     */
    @ApiPropertyOptional({ type: AccessRestrictionsDto, isArray: true, description: "Optional restrictions: If specified, the door will only open at the specified time for that key."})
    @Type(() => AccessRestrictionsDto)
    @ValidateNested()
    restrictions: AccessRestrictionsDto[];
}
