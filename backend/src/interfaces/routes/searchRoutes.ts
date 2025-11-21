import express from 'express';
import { SearchController } from '../controllers/SearchController';
import { SearchSongsUseCase } from '../../application/usecases/SearchSongsUseCase';
import { PuppeteerScraperService } from '../../infrastructure/scraping/PuppeteerScraperService';

const router = express.Router();

// Dependency Injection (Manual for now, could use a container later)
const scraperService = new PuppeteerScraperService();
const searchSongsUseCase = new SearchSongsUseCase(scraperService);
const searchController = new SearchController(searchSongsUseCase);

router.get('/', (req, res) => searchController.search(req, res));

export default router;
