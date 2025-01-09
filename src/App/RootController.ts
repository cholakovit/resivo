import { Controller, Get } from "@nestjs/common";

@Controller()
export class RootController {
    constructor() {
    }

    @Get()
    async getHello() {
        return "hello world!";
    }

}
