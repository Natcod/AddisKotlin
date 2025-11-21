"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
class SearchController {
    constructor(searchSongsUseCase) {
        this.searchSongsUseCase = searchSongsUseCase;
        this.search = async (req, res) => {
            try {
                const query = req.query.q;
                if (!query) {
                    return res.status(400).json({ error: 'Query parameter "q" is required' });
                }
                console.log(`Searching for: ${query}`);
                const results = await this.searchSongsUseCase.execute(query);
                console.log(`Found ${results.length} results for: ${query}`);
                res.json(results);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        };
    }
}
exports.SearchController = SearchController;
