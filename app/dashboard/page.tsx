"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ThumbsUp,
  ThumbsDown,
  Play,
  Share2
} from "lucide-react"
import axios from "axios"

const REFRESH_INTERVAL_MS = 10 * 1000;

export default function dashboard() {
  async function refreshStreams(){
    const res = await axios.get(`/api/streams/my`)
    console.log(res)
  }

  useEffect(()=>{
    refreshStreams();
    const interval = setInterval(()=>{

    },REFRESH_INTERVAL_MS)
  },[])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white px-6 py-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Song Voting Queue</h1>
        <Button variant="secondary" className="gap-2">
          <Share2 size={16} /> Share
        </Button>
      </div>

    
      <div className="space-y-3 mb-8">
        <Input
          placeholder="Paste project / task link here"
          className="bg-zinc-800 border-zinc-700"
        />
        <Button className="w-full bg-purple-600 hover:bg-purple-700">
          Add to Queue
        </Button>
      </div>

      
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Now Playing</h2>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex items-center justify-center h-40 text-zinc-400">
            No Video Playing
          </CardContent>
        </Card>

        <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 gap-2">
          <Play size={18} /> Play Next
        </Button>
      </div>

     
      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Song</h2>

        <div className="space-y-4">
          {projects.map((project, index) => (
            <Card key={index} className="bg-zinc-900 border-zinc-800">
              <CardContent className="flex justify-between items-center p-4">
                
                <div>
                  <h3 className="font-semibold">{project.title}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {project.category}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <Button size="sm" variant="outline" className="gap-1">
                    <ThumbsUp size={14} /> {project.up}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <ThumbsDown size={14} /> {project.down}
                  </Button>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </div>
  )
}

const projects = [
  {
    title: "AI Resume Builder",
    category: "Full Stack",
    up: 5,
    down: 1
  },
  {
    title: "College ERP System",
    category: "Java + SQL",
    up: 3,
    down: 0
  },
  {
    title: "Blog CMS Platform",
    category: "Next.js",
    up: 2,
    down: 1
  }
]
