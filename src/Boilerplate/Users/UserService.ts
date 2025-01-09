import { UserRepository } from "./Data/UserRepository";
import { UserEntity } from "./Model/UserEntity";
import { Injectable } from "@nestjs/common";

/**
 * Simple service that provides access to our
 * registered "users".
 */
@Injectable()
export class UserService {


    // //////////////////////////////
    // THERE IS NOTHING TO DO IN HERE
    // //////////////////////////////



    constructor(private userRepository: UserRepository) {
    }


    /**
     * Looks up a user with a given user ID and returns
     * them, if available.
     */
    async tryGetUser(userId: string) {
        return this.userRepository.findById(userId);
    }


}
