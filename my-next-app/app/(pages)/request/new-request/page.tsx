import React from 'react'
import NewRequestForm from './NewRequestForm'
import { getRequests } from '@/app/actions/request-requests';
import { getNewRequestData } from '@/app/actions/new-request';

export default async function Page() {
  const userData: NewRequestDataResponse | null = await getNewRequestData();
  return (
    <div><NewRequestForm userData={userData}/></div>
  )
}

