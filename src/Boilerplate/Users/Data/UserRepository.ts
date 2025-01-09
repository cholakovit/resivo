import { UserEntity } from "../Model/UserEntity";
import { MemoryRepository } from "../../Data/MemoryRepository";
import { Injectable } from "@nestjs/common";
import { DbSeeder } from "../../Data/DbSeeder";

@Injectable()
export class UserRepository extends MemoryRepository<UserEntity> {

    // //////////////////////////////
    // THERE IS NOTHING TO DO IN HERE
    // //////////////////////////////


    constructor() {
        super();
        DbSeeder.createTestUsers(this);
    }

}
