"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchSongsUseCase = void 0;
class SearchSongsUseCase {
    constructor(scraperService) {
        this.scraperService = scraperService;
    }
    async execute(query) {
        if (!query) {
            throw new Error("Query cannot be empty");
        }
        return await this.scraperService.search(query);
    }
}
exports.SearchSongsUseCase = SearchSongsUseCase;
