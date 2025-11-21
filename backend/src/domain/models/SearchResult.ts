export interface SearchResult {
    id: string;
    title: string;
    artist: string;
    lyrics: string;
    category: string;
    source: 'Facebook' | 'YouTube';
}
