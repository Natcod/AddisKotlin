import { Request, Response } from 'express';
import { SearchSongsUseCase } from '../../application/usecases/SearchSongsUseCase';

export class SearchController {
    constructor(private searchSongsUseCase: SearchSongsUseCase) { }

    search = async (req: Request, res: Response) => {
        try {
            const query = req.query.q as string;
            if (!query) {
                console.log('Search query missing');
                return res.status(400).json({ error: 'Query parameter "q" is required' });
            }

            console.log(`Processing search for: "${query}"`);
            const results = await this.searchSongsUseCase.execute(query);
            console.log(`Found ${results.length} results for: "${query}"`);
            res.json(results);
        } catch (error) {
            console.error('Error in SearchController:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
