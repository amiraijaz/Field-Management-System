export interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
}

export const parsePagination = (
    queryPage?: string | number,
    queryLimit?: string | number
): PaginationParams => {
    const page = Math.max(1, parseInt(String(queryPage || 1), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(queryLimit || 20), 10)));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
};

export const buildPaginationQuery = (
    baseQuery: string,
    params: PaginationParams
): string => {
    return `${baseQuery} LIMIT ${params.limit} OFFSET ${params.offset}`;
};
