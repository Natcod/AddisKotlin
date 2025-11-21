"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SearchController_1 = require("../controllers/SearchController");
const SearchSongsUseCase_1 = require("../../application/usecases/SearchSongsUseCase");
const PuppeteerScraperService_1 = require("../../infrastructure/scraping/PuppeteerScraperService");
const router = express_1.default.Router();
// Dependency Injection (Manual for now, could use a container later)
const scraperService = new PuppeteerScraperService_1.PuppeteerScraperService();
const searchSongsUseCase = new SearchSongsUseCase_1.SearchSongsUseCase(scraperService);
const searchController = new SearchController_1.SearchController(searchSongsUseCase);
router.get('/', (req, res) => searchController.search(req, res));
exports.default = router;
