"use client"

import StreamView from "../components/StreamView"

export default function Dashboard() {
  
const creatorId =" 6527833d-c527-4b83-993f-1f8270463634"

  return <div>
    <StreamView creatorId={creatorId} playVideo={true}/> 
  </div>

}
