import { PinCodeRegistration } from "../Model/PinCodeRegistration";
import { IsArray, IsOptional, IsString, Length, ValidateNested } from "class-validator";
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
    @Length(4, 10, { message: "PIN code must be between 4 and 10 characters long" }) // Prevent short/long PINs
    pinCode: string;

    /**
     * The authorized doors that will whitelist the registered pin code.
     */
    @ApiProperty({description: "The authorized doors that will whitelist the registered pin code."})
    @IsArray()
    @IsString({ each: true })
    doorIds: string[];

    /**
     * Optional restrictions: If specified, the door will only open
     * at the specified time for that key.
     */
    @ApiPropertyOptional({ type: AccessRestrictionsDto, isArray: true, description: "Optional restrictions: If specified, the door will only open at the specified time for that key."})
    @Type(() => AccessRestrictionsDto)
    @ValidateNested({ each: true })
    @IsOptional()
    restrictions?: AccessRestrictionsDto[];
}
