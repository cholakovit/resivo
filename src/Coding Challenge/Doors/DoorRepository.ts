import { MemoryRepository } from "../../Boilerplate/Data/MemoryRepository";
import { DoorEntity } from "./Model/DoorEntity";
import { Injectable } from "@nestjs/common";
import { DbSeeder } from "../../Boilerplate/Data/DbSeeder";


/**
 * A repository that provides access to door-related data.
 * May contain additional data lookups, if the base methods
 * aren't sufficient.
 */
@Injectable()
export class DoorRepository extends MemoryRepository<DoorEntity> {

    constructor() {
        super();
        DbSeeder.createTestDoors(this);
    }

}
