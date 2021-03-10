export class GameModel {
    constructor(
        private match_id: string,
        private home_name: string,
        private away_name: string,
        private status: number,
        private status_code: number,
        private home_scored_1: number,
        private home_scored_2: number,
        private home_scored_3: number,
        private home_scored_4: number,
        private away_scored_1: number,
        private away_scored_2: number,
        private away_scored_3: number,
        private away_scored_4: number,
        private sport_id: string,
        private tour_name: string,
        private country_id: string,
        private match_date: string,
    ) {}
}
