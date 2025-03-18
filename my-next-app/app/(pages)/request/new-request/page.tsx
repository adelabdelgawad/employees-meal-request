import React from 'react'
import NewRequestForm from './NewRequestForm'
import { getRequests } from '@/app/actions/request-requests';
import { getNewRequestData } from '@/app/actions/new-request';

export default async function Page() {
  const formData: NewRequestDataResponse | null = await getNewRequestData();
  console.log(formData)
  return (
    <div><NewRequestForm formData={formData}/></div>
  )
}