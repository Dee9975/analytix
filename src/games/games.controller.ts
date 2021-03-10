import {Body, Controller, Post} from "@nestjs/common";
import {GamesService} from "./games.service";

@Controller("games")
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}
    @Post()
    async getGames(
        @Body("source") source: string,
        @Body("timezone") timezone: string,
    ) : Promise<{games: {}}> {
        const returnData = await this.gamesService.formatData(source);
        return {games: returnData};
    }
    @Post("odds")
    async getOdds(
        @Body("source") source: string,
        @Body("id") id: string,
    ) : Promise<{odds: {}}> {
        const data = await this.gamesService.getOdds(id, source);
        return {odds: data};
    }
}
