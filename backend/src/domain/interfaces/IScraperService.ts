import { SearchResult } from "../models/SearchResult";

export interface IScraperService {
    search(query: string): Promise<SearchResult[]>;
}
