export declare const MAX_PROMO_LEVEL = 5;
export declare function getRelativeLevel(path: string, parentUserId: number, ancestorId: number): number | null;
export declare function maskUsername(username: string): string;
export declare function containsPath(path: string, userId: number): boolean;
export declare function levelFromPath(path: string): number;
