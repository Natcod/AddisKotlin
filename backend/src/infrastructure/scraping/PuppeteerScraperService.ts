import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { IScraperService } from '../../domain/interfaces/IScraperService';
import { SearchResult } from '../../domain/models/SearchResult';

export class PuppeteerScraperService implements IScraperService {
    async search(query: string): Promise<SearchResult[]> {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        try {
            // Construct Google Search Query
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' "lyrics" site:facebook.com OR site:youtube.com')}`;

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

            const content = await page.content();
            const $ = cheerio.load(content);
            const results: SearchResult[] = [];

            // Parse Google Search Results
            $('.g').each((i, element) => {
                const title = $(element).find('h3').text();
                const link = $(element).find('a').attr('href');
                const snippet = $(element).find('.VwiC3b').text();

                if (title && link) {
                    results.push({
                        id: link,
                        title: title,
                        artist: "Unknown",
                        lyrics: snippet,
                        category: "Mezmur",
                        source: link.includes('facebook.com') ? 'Facebook' : 'YouTube'
                    });
                }
            });

            // Enrich results with full lyrics for Facebook links (Limit to top 3 to save time)
            const facebookResults = results.filter(r => r.source === 'Facebook').slice(0, 3);

            for (const result of facebookResults) {
                try {
                    // Use mbasic.facebook.com for easier scraping
                    const mbasicUrl = result.id.replace('www.facebook.com', 'mbasic.facebook.com').replace('web.facebook.com', 'mbasic.facebook.com');

                    await page.goto(mbasicUrl, { waitUntil: 'domcontentloaded' });

                    // Try to find the post content
                    // In mbasic, the post content is usually inside a div with specific structure or just the largest text block
                    // This is a heuristic: look for the story body
                    const content = await page.content();
                    const $post = cheerio.load(content);

                    // mbasic selector for post content (often inside .jb or similar, but varies)
                    // A generic approach: find the div that contains the snippet text or is the main body
                    let fullText = $post('.story_body_container').text() || $post('#m_story_permalink_view').text();

                    if (!fullText) {
                        // Fallback: Try to find a div with a lot of text
                        fullText = $post('div[data-ft]').first().text();
                    }

                    if (fullText && fullText.length > result.lyrics.length) {
                        result.lyrics = fullText.trim();
                    }
                } catch (err) {
                    console.error(`Failed to scrape Facebook post: ${result.id}`, err);
                }
            }

            // Enrich results for YouTube links (Limit to top 3)
            const youtubeResults = results.filter(r => r.source === 'YouTube').slice(0, 3);

            for (const result of youtubeResults) {
                try {
                    await page.goto(result.id, { waitUntil: 'domcontentloaded' });

                    // Wait for description selector (this is tricky on YouTube as it's heavy JS)
                    // We might need to click "more" to see full description
                    // Selector for "more" button: #expand
                    try {
                        const moreButton = await page.$('#expand');
                        if (moreButton) {
                            await moreButton.click();
                            // Wait a bit for expansion
                            await new Promise(r => setTimeout(r, 500));
                        }
                    } catch (e) {
                        // Ignore if button not found
                    }

                    // Selector for description: #description-inline-expander or #description
                    const description = await page.$eval('#description-inline-expander', el => el.textContent);

                    if (description && description.length > result.lyrics.length) {
                        result.lyrics = description.trim();
                    }
                } catch (err) {
                    console.error(`Failed to scrape YouTube video: ${result.id}`, err);
                }
            }

            return results;

        } catch (error) {
            console.error("Scraping Error:", error);
            throw error;
        } finally {
            await browser.close();
        }
    }
}
