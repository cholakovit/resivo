import { UserRepository } from "../Users/Data/UserRepository";
import { DoorRepository } from "../../Coding Challenge/Doors/Repositories/DoorRepository";
import { DoorEntity } from "../../Coding Challenge/Doors/Model/DoorEntity";
import { UserEntity } from "../Users/Model/UserEntity";

/**
 * Just creates a few test entries in the DB to work with.
 */
export class DbSeeder {


    // //////////////////////////////
    // THERE IS NOTHING TO DO IN HERE
    // //////////////////////////////


    static createTestUsers(repository: UserRepository) {

        // please don't change test data, this will make it easier for us to review
        // your solution

        const users: UserEntity[] = [
            {
                id: "peter",
                name: "Peter Parker"
            },
            {
                id: "wanda",
                name: "Wanda Maximoff"
            },
            {
                id: "thor",
                name: "Thor Odinson"
            },
            {
                id: "groot",
                name: "I am Groot"
            }
        ];

        users.forEach(u => repository.create(u));
    }

    static createTestDoors(repository: DoorRepository) {

        // please don't change test data, this will make it easier for us to review
        // your solution

        const doors: DoorEntity[] = [
            {
                id: "main",
                name: "Main Entrance",
                authorizedPinCodes: []
            },
            {
                id: "garage",
                name: "Garage",
                authorizedPinCodes: []
            },
            {
                id: "spa",
                name: "Spa",
                authorizedPinCodes: []
            },
            {
                id: "gym",
                name: "Gym",
                authorizedPinCodes: []
            }
        ];

        doors.forEach(u => repository.create(u));
    }

}
