export interface StatsQuery {
    from?: string;
    to?: string;
    granularity?: 'day' | 'week' | 'month';
}
export declare function parseDateRange(params: StatsQuery): {
    from: Date;
    to: Date;
    granularity: "day" | "week" | "month";
};
export declare function bucketKey(date: Date, granularity: string): string;
export declare function buildSeries<T>(items: T[], getDate: (item: T) => Date, getValue: (item: T) => number, from: Date, to: Date, granularity: string): {
    bucket: string;
    value: number;
}[];
