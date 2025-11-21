import { IScraperService } from "../../domain/interfaces/IScraperService";
import { SearchResult } from "../../domain/models/SearchResult";

export class SearchSongsUseCase {
    constructor(private scraperService: IScraperService) { }

    async execute(query: string): Promise<SearchResult[]> {
        if (!query) {
            throw new Error("Query cannot be empty");
        }
        return await this.scraperService.search(query);
    }
}
