import { NextApiRequest, NextApiResponse } from 'next';

interface DataItem {
  id: number;
  name: string;
}

interface PaginatedResponse {
  data: DataItem[];
  total: number;
  page: number;
  totalPages: number;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedResponse>,
) {
  const { page = '1', limit = '5', search = '' } = req.query;

  const dataset: DataItem[] = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
  }));

  const filteredData = dataset.filter((item) =>
    item.name.toLowerCase().includes((search as string).toLowerCase()),
  );

  const start =
    (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
  const paginatedData = filteredData.slice(
    start,
    start + parseInt(limit as string, 10),
  );

  res.status(200).json({
    data: paginatedData,
    total: filteredData.length,
    page: parseInt(page as string, 10),
    totalPages: Math.ceil(filteredData.length / parseInt(limit as string, 10)),
  });
}
