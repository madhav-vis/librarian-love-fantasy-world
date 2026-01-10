declare module 'html-to-text' {
  export interface ConvertOptions {
    wordwrap?: number | null;
    selectors?: Array<{
      selector: string;
      format?: string;
      options?: Record<string, any>;
    }>;
    formatters?: Record<string, (elem: any, walk: any, builder: any, formatOptions: any) => void>;
  }

  export function convert(html: string, options?: ConvertOptions): string;
}
