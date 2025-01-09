import { IsDate, IsString } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class AccessRequestDto {
    /**
     * The key of the evaluated pinCode.
     */
    @ApiProperty({ description: "The key of the evaluated pinCode." })
    @IsString()
    pinCode: string;

    /**
     * The door being accessed.
     */
    // @ApiProperty({ description: "The door being accessed." })
    // @IsString()
    // door: string;

    /**
     * The timestamp that we simulate. We'll check whether the whitelist
     * would allow access at this time.
     */
    @ApiProperty({ description: "The timestamp that we simulate. We'll check whether the whitelist would allow access at this time." })
    @IsDate()
    @Type(() => Date)
    simulatedTimestamp: Date;
}
