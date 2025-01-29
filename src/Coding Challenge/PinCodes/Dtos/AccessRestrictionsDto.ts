import { AccessRestrictions } from "../Model/AccessRestrictions";
import { IsDate, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class AccessRestrictionsDto implements AccessRestrictions {

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    @ApiPropertyOptional({ description: "Optional start date. If not set, immediately valid." })
    validFrom?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    @ApiPropertyOptional({ description: "Optional end date. If not set, the registration will never expire." })
    validTo?: Date;
}
