export interface ExportTask {
    content: string;
    filename: string;
    expiresAt: number;
}
export declare function saveExportTask(taskId: string, task: ExportTask): void;
export declare function getExportTask(taskId: string): ExportTask | undefined;
export declare function toCsv(headers: string[], rows: Array<Array<string | number>>): string;
