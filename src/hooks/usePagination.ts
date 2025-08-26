import { useState } from 'react';

export function usePagination(data: any[]) {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const pagedData = data.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );
  return { pagination, pagedData, setPagination };
}