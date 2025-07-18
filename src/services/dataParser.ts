/**
 * DataParser interface for scraping-based data parsing.
 * @template TRawData - The type of raw (scraped) data.
 * @template TTileData - The type of parsed tile data.
 */
export interface DataParser<TRawData, TTileData> {
  /**
   * Parses raw (scraped) data into tile content data
   * @param rawData - Raw scraped data
   * @returns Parsed tile content data
   */
  parse(rawData: TRawData): TTileData;

  /**
   * Validates if the raw data is valid
   * @param rawData - Raw scraped data
   * @returns True if valid, false otherwise
   */
  validate(rawData: unknown): rawData is TRawData;

  /**
   * Creates a default/empty tile content data object
   * @returns Default tile content data
   */
  createDefault(): TTileData;

  /**
   * Safely parses raw data with error handling
   * @param rawData - Raw scraped data
   * @returns Parsed tile content data or default if parsing fails
   */
  safeParse(rawData: unknown): TTileData;
}

/**
 * Base implementation for common data parsing patterns.
 * @template TRawData - The type of raw (scraped) data.
 * @template TTileData - The type of parsed tile data.
 */
export abstract class BaseDataParser<TRawData, TTileData>
  implements DataParser<TRawData, TTileData>
{
  abstract parse(rawData: TRawData): TTileData;
  abstract validate(rawData: unknown): rawData is TRawData;
  abstract createDefault(): TTileData;

  safeParse(rawData: unknown): TTileData {
    if (this.validate(rawData)) {
      try {
        return this.parse(rawData);
      } catch (error) {
        console.error('Data parsing failed:', error);
        return this.createDefault();
      }
    }
    console.warn('Invalid raw data format');
    return this.createDefault();
  }
}

/**
 * Registry for data parsers by tile type.
 */
export class DataParserRegistry {
  private parsers = new Map<string, DataParser<unknown, unknown>>();

  register<TTileType extends string, TRawData, TTileData>(
    tileType: TTileType,
    parser: DataParser<TRawData, TTileData>,
  ): void {
    this.parsers.set(tileType, parser as DataParser<unknown, unknown>);
  }

  get<TTileType extends string, TRawData, TTileData>(
    tileType: TTileType,
  ): DataParser<TRawData, TTileData> | undefined {
    return this.parsers.get(tileType) as DataParser<TRawData, TTileData> | undefined;
  }

  has(tileType: string): boolean {
    return this.parsers.has(tileType);
  }

  getRegisteredTypes(): string[] {
    return Array.from(this.parsers.keys());
  }
}
