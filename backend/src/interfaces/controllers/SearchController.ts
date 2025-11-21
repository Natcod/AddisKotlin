import { Request, Response } from 'express';
import { SearchSongsUseCase } from '../../application/usecases/SearchSongsUseCase';

export class SearchController {
    constructor(private searchSongsUseCase: SearchSongsUseCase) { }

    search = async (req: Request, res: Response) => {
        try {
            const query = req.query.q as string;
            if (!query) {
                return res.status(400).json({ error: 'Query parameter "q" is required' });
            }

            const results = await this.searchSongsUseCase.execute(query);
            res.json(results);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
