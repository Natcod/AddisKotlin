"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchGoogle = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const cheerio = __importStar(require("cheerio"));
const searchGoogle = async (query) => {
    const browser = await puppeteer_1.default.launch({
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
        const results = [];
        // Parse Google Search Results
        $('.g').each((i, element) => {
            const title = $(element).find('h3').text();
            const link = $(element).find('a').attr('href');
            const snippet = $(element).find('.VwiC3b').text(); // Snippet class
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
        return results;
    }
    catch (error) {
        console.error("Scraping Error:", error);
        throw error;
    }
    finally {
        await browser.close();
    }
};
exports.searchGoogle = searchGoogle;
