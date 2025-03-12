import axios from 'axios'

interface FetchDataResponse {
  data: any[]
  totalPages: number
}

export async function fetchData(params: {
  page?: string
  search?: string
  start_date?: string
  end_date?: string
}): Promise<FetchDataResponse> {
  try {
    const response = await axios.get('http://localhost:8000/api/data', {
      params: {
        page: params.page || 1,
        page_size: 10,
        search: params.search,
        start_date: params.start_date,
        end_date: params.end_date
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
    return { data: [], totalPages: 1 }
  }
}