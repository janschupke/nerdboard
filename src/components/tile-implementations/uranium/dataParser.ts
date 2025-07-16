import { DataParserRegistry, BaseDataParser } from '../../../services/dataParser';
import type { UraniumTileData } from './types';
import { TileType } from '../../../types/tile';

/**
 * Parses Trading Economics HTML to UraniumTileData for the tile.
 */
export class UraniumHtmlDataParser extends BaseDataParser<string, UraniumTileData> {
  parse(html: string): UraniumTileData {
    // For demonstration, use regex to extract mock values (real implementation would use DOMParser or cheerio)
    // Example: <span id="spot-price">85.5</span>
    const spotPriceMatch = html.match(/id="spot-price">([\d.]+)</);
    const spotPrice = spotPriceMatch ? parseFloat(spotPriceMatch[1]) : 0;
    // Add similar parsing for other fields as needed
    return {
      spotPrice,
      change: 0,
      changePercent: 0,
      lastUpdated: new Date().toISOString(),
      history: [],
    };
  }

  validate(html: unknown): html is string {
    return typeof html === 'string' && html.includes('spot-price');
  }

  createDefault(): UraniumTileData {
    return {
      spotPrice: 0,
      change: 0,
      changePercent: 0,
      lastUpdated: new Date().toISOString(),
      history: [],
    };
  }
}

/**
 * Registers the Uranium HTML data parser with the DataParserRegistry.
 */
export function registerUraniumDataParser() {
  DataParserRegistry.register(TileType.URANIUM, new UraniumHtmlDataParser());
} 
