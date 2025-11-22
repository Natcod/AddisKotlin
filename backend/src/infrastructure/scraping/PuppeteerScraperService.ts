import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { IScraperService } from '../../domain/interfaces/IScraperService';
import { SearchResult } from '../../domain/models/SearchResult';

export class PuppeteerScraperService implements IScraperService {
    private browser: any = null;

    private async getBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage', // Critical for Docker memory limits
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-blink-features=AutomationControlled',
                    '--window-size=1920,1080'
                ],
                ignoreDefaultArgs: ['--enable-automation']
            });

            // Handle browser disconnect/crash
            this.browser.on('disconnected', () => {
                console.log('Browser disconnected, resetting instance');
                this.browser = null;
            });
        }
        return this.browser;
    }

    async search(query: string): Promise<SearchResult[]> {
        let page = null;
        try {
            const browser = await this.getBrowser();
            page = await browser.newPage();

            // Block images and fonts to save memory and bandwidth
            await page.setRequestInterception(true);
            page.on('request', (req: any) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            // Switch to DuckDuckGo HTML version (No JS, easier to scrape, less blocking)
            // Remove strict site: operators to get more results, then filter manually
            const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' lyrics')}`;

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

            const title = await page.title();
            console.log(`Page Title: ${title}`);

            const content = await page.content();
            console.log(`Page content length: ${content.length}`);
            const $ = cheerio.load(content);
            const results: SearchResult[] = [];

            const elements = $('.result');
            console.log(`Found ${elements.length} DuckDuckGo results`);

            // Parse DuckDuckGo Results
            elements.each((i, element) => {
                const titleElement = $(element).find('.result__title a');
                const title = titleElement.text().trim();
                let link = titleElement.attr('href');
                const snippet = $(element).find('.result__snippet').text().trim();

                console.log(`Parsed item ${i}: Title="${title}", Link="${link}"`);

                if (title && link) {
                    // Handle DuckDuckGo redirect links
                    if (link.includes('duckduckgo.com/l/') || link.startsWith('//duckduckgo.com/l/')) {
                        try {
                            const urlObj = new URL('https:' + link);
                            const uddg = urlObj.searchParams.get('uddg');
                            if (uddg) {
                                link = decodeURIComponent(uddg);
                                console.log(`Decoded link: ${link}`);
                            }
                        } catch (e) {
                            console.log('Failed to decode DDG link', e);
                        }
                    }

                    // Filter: Only accept Facebook or YouTube links for now (or allow others as "Web" source)
                    let source: 'Facebook' | 'YouTube' | 'Web' = 'Web';
                    if (link.includes('facebook.com')) source = 'Facebook';
                    else if (link.includes('youtube.com') || link.includes('youtu.be')) source = 'YouTube';

                    // Optional: Strict filter
                    // if (source === 'Web') return;

                    results.push({
                        id: link,
                        title: title,
                        artist: "Unknown",
                        lyrics: snippet,
                        category: "Mezmur",
                        source: source as any // Cast to match interface or update interface
                    });
                }
            });

            // Enrich results with full lyrics for Facebook links (Limit to top 3 to save time)
            const facebookResults = results.filter(r => r.source === 'Facebook').slice(0, 3);

            for (const result of facebookResults) {
                try {
                    // Use mbasic.facebook.com for easier scraping
                    const mbasicUrl = result.id.replace('www.facebook.com', 'mbasic.facebook.com').replace('web.facebook.com', 'mbasic.facebook.com');

                    await page.goto(mbasicUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

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
                    await page.goto(result.id, { waitUntil: 'domcontentloaded', timeout: 15000 });

                    // Wait for description selector
                    // Try to get description from meta tag first (faster, less brittle)
                    try {
                        const metaDescription = await page.$eval('meta[name="description"]', (el: any) => el.getAttribute('content'));
                        if (metaDescription && metaDescription.length > result.lyrics.length) {
                            result.lyrics = metaDescription;
                            console.log(`Extracted YouTube description from meta tag for ${result.id}`);
                            continue; // Skip complex DOM scraping if meta worked
                        }
                    } catch (e) {
                        console.log('Meta description not found');
                    }

                    // Fallback to DOM scraping
                    try {
                        const moreButton = await page.$('#expand');
                        if (moreButton) {
                            await moreButton.click();
                            await new Promise(r => setTimeout(r, 500));
                        }

                        const description = await page.$eval('#description-inline-expander', (el: any) => el.textContent);
                        if (description && description.length > result.lyrics.length) {
                            result.lyrics = description.trim();
                        }
                    } catch (e) {
                        console.log('DOM description not found');
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
            if (page) {
                await page.close();
            }
            // Do NOT close the browser here, keep it alive for next request
        }
    }
}
