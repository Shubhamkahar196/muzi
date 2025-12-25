"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState, useCallback } from "react"
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
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import StreamView from "../components/StreamView"



const REFRESH_INTERVAL_MS = 10 * 1000;

interface Stream {
  id: string;
  title: string;
  upvotes: number;
  extractedId: string;
  type: string;
  url: string;
  smallImg: string;
  bigImg: string;
  userId: string;
  haveUpVoted: boolean
}

export default function Dashboard() {
  // const { data: session, status } = useSession();
  // const router = useRouter();
  // const [streams, setStreams] = useState<Stream[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [inputLink, setInputLink] = useState('')
  // // Redirect to sign in if not authenticated
  // useEffect(() => {
  //   if (status === "unauthenticated") {
  //     router.push("/");
  //   }
  // }, [status, router]);

  // // Only fetch streams if authenticated
  // async function refreshStreams(){
  //   if (status !== "authenticated") return;

  //   try {
  //     const res = await axios.get(`/api/streams/my`);
  //     console.log(res.data);
  //     setStreams(res.data.streams || []);
  //     setLoading(false);
  //   } catch (error) {
  //     console.error("Error fetching streams:", error);
  //     setLoading(false);
  //   }
  // }

  // async function handleUpvote(streamId: string) {
  //   try {
  //     await axios.post(`/api/streams/upvote`, {
  //       streamId: streamId
  //     });
  //     // Refresh streams after upvote
  //     refreshStreams();
  //   } catch (error) {
  //     console.error("Error upvoting:", error);
  //   }
  // }

  // async function handleDownvote(streamId: string) {
  //   try {
  //     await axios.post(`/api/streams/downvote`, {
  //       streamId: streamId
  //     });
  //     // Refresh streams after downvote
  //     refreshStreams();
  //   } catch (error) {
  //     console.error("Error downvoting:", error);
  //   }
  // }

  // const handleShare = () => {
  //   const shareableLink = `${window.location.href}`;
  //   navigator.clipboard.writeText(shareableLink).then(() => {
  //     alert("Link copied to clipboard!");
  //   }).catch(() => {
  //     alert("Failed to copy link");
  //   });
  // };



  // useEffect(()=>{
  //   if (status === "authenticated") {
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //     refreshStreams();
  //     const interval = setInterval(()=>{
  //       refreshStreams();
  //     }, REFRESH_INTERVAL_MS);

  //     return () => clearInterval(interval);
  //   }
  // }, [status])

  // return (
  //   <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white px-6 py-8">

  //     {/* Header */}
  //     <div className="flex items-center justify-between mb-6">
  //       <h1 className="text-2xl font-bold">Song Voting Queue</h1>
  //       <Button variant="secondary" className="gap-2" onClick={handleShare}>
  //         <Share2 size={16} /> Share
  //       </Button>
  //     </div>


  //     <div className="space-y-3 mb-8">
  //       <Input
  //         value={inputLink}
  //         onChange={(e) => setInputLink(e.target.value)}
  //         placeholder="Paste YouTube link here"
  //         className="bg-zinc-800 border-zinc-700"
  //       />
  //       <Button onClick={async ()=>{
  //         try {
  //           await axios.post(`/api/streams`, {
  //             creatorId: session?.user?.id,
  //             url: inputLink
  //           });
  //           setInputLink(''); // Clear input on success
  //           refreshStreams(); // Refresh the list
  //         } catch (error) {
  //           console.error("Error adding to queue:", error);
  //           if (axios.isAxiosError(error)) {
  //             alert(error.response?.data?.message || "Failed to add to queue");
  //           } else {
  //             alert("Failed to add to queue");
  //           }
  //         }
  //       }}

  //       className="w-full bg-purple-600 hover:bg-purple-700">
  //         Add to Queue
  //       </Button>
  //     </div>


  //     <div className="mb-10">
  //       <h2 className="text-xl font-semibold mb-3">Now Playing</h2>

  //       <Card className="bg-zinc-900 border-zinc-800">
  //         <CardContent className="flex items-center justify-center h-40 text-zinc-400">
  //           No Video Playing
  //         </CardContent>
  //       </Card>

  //       <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 gap-2">
  //         <Play size={18} /> Play Next
  //       </Button>
  //     </div>

  //     <div>
  //       <h2 className="text-xl font-semibold mb-4">Upcoming Songs</h2>

  //       {loading ? (
  //         <div className="text-center text-zinc-400 py-8">Loading streams...</div>
  //       ) : streams.length === 0 ? (
  //         <div className="text-center text-zinc-400 py-8">No streams found</div>
  //       ) : (
  //         <div className="space-y-4">
  //           {streams.map((stream) => (
  //             <Card key={stream.id} className="bg-zinc-900 border-zinc-800">
  //               <CardContent className="flex justify-between items-center p-4">
  //                 <div className="flex items-center gap-3">
  //                   <img
  //                     src={stream.smallImg}
  //                     alt={stream.title}
  //                     className="w-50 h-50 rounded object-cover"
  //                     onError={(e) => {
  //                       e.currentTarget.src = "https://via.placeholder.com/48x48?text=No+Image";
  //                     }}
  //                   />
  //                   <div>
  //                     <h3 className="font-semibold text-zinc-100">{stream.title}</h3>
  //                     <Badge variant="secondary" className="mt-1">
  //                       {stream.type}
  //                     </Badge>
  //                   </div>
  //                 </div>

  //                 <div className="flex items-center gap-3">
  //                   <Button
  //                     size="sm"
  //                     variant="outline"
  //                     className="gap-1"
  //                     onClick={() => handleUpvote(stream.id)}
  //                   >
  //                     <ThumbsUp size={14} /> {stream.upvotes}
  //                   </Button>
  //                   <Button
  //                     size="sm"
  //                     variant="outline"
  //                     className="gap-1"
  //                     onClick={() => handleDownvote(stream.id)}
  //                   >
  //                     <ThumbsDown size={14} />
  //                   </Button>
  //                 </div>

  //               </CardContent>
  //             </Card>
  //           ))}
  //         </div>
  //       )}
  //     </div>

  //   </div>
  // )
  // const { data: session, status } = useSession();
  // const router = useRouter();
  // const [streams, setStreams] = useState<Stream[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [inputLink, setInputLink] = useState('')
  // // Redirect to sign in if not authenticated
  // useEffect(() => {
  //   if (status === "unauthenticated") {
  //     router.push("/");
  //   }
  // }, [status, router]);

  // // Only fetch streams if authenticated
  // async function refreshStreams(){
  //   if (status !== "authenticated") return;

  //   try {
  //     const res = await axios.get(`/api/streams/my`);
  //     console.log(res.data);
  //     setStreams(res.data.streams || []);
  //     setLoading(false);
  //   } catch (error) {
  //     console.error("Error fetching streams:", error);
  //     setLoading(false);
  //   }
  // }

  // async function handleUpvote(streamId: string) {
  //   try {
  //     await axios.post(`/api/streams/upvote`, {
  //       streamId: streamId
  //     });
  //     // Refresh streams after upvote
  //     refreshStreams();
  //   } catch (error) {
  //     console.error("Error upvoting:", error);
  //   }
  // }

  // async function handleDownvote(streamId: string) {
  //   try {
  //     await axios.post(`/api/streams/downvote`, {
  //       streamId: streamId
  //     });
  //     // Refresh streams after downvote
  //     refreshStreams();
  //   } catch (error) {
  //     console.error("Error downvoting:", error);
  //   }
  // }

  // const handleShare = () => {
  //   const shareableLink = `${window.location.href}`;
  //   navigator.clipboard.writeText(shareableLink).then(() => {
  //     alert("Link copied to clipboard!");
  //   }).catch(() => {
  //     alert("Failed to copy link");
  //   });
  // };



  // useEffect(()=>{
  //   if (status === "authenticated") {
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //     refreshStreams();
  //     const interval = setInterval(()=>{
  //       refreshStreams();
  //     }, REFRESH_INTERVAL_MS);

  //     return () => clearInterval(interval);
  //   }
  // }, [status])

  // return (
  //   <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white px-6 py-8">

  //     {/* Header */}
  //     <div className="flex items-center justify-between mb-6">
  //       <h1 className="text-2xl font-bold">Song Voting Queue</h1>
  //       <Button variant="secondary" className="gap-2" onClick={handleShare}>
  //         <Share2 size={16} /> Share
  //       </Button>
  //     </div>


  //     <div className="space-y-3 mb-8">
  //       <Input
  //         value={inputLink}
  //         onChange={(e) => setInputLink(e.target.value)}
  //         placeholder="Paste YouTube link here"
  //         className="bg-zinc-800 border-zinc-700"
  //       />
  //       <Button onClick={async ()=>{
  //         try {
  //           await axios.post(`/api/streams`, {
  //             creatorId: session?.user?.id,
  //             url: inputLink
  //           });
  //           setInputLink(''); // Clear input on success
  //           refreshStreams(); // Refresh the list
  //         } catch (error) {
  //           console.error("Error adding to queue:", error);
  //           if (axios.isAxiosError(error)) {
  //             alert(error.response?.data?.message || "Failed to add to queue");
  //           } else {
  //             alert("Failed to add to queue");
  //           }
  //         }
  //       }}

  //       className="w-full bg-purple-600 hover:bg-purple-700">
  //         Add to Queue
  //       </Button>
  //     </div>


  //     <div className="mb-10">
  //       <h2 className="text-xl font-semibold mb-3">Now Playing</h2>

  //       <Card className="bg-zinc-900 border-zinc-800">
  //         <CardContent className="flex items-center justify-center h-40 text-zinc-400">
  //           No Video Playing
  //         </CardContent>
  //       </Card>

  //       <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 gap-2">
  //         <Play size={18} /> Play Next
  //       </Button>
  //     </div>

  //     <div>
  //       <h2 className="text-xl font-semibold mb-4">Upcoming Songs</h2>

  //       {loading ? (
  //         <div className="text-center text-zinc-400 py-8">Loading streams...</div>
  //       ) : streams.length === 0 ? (
  //         <div className="text-center text-zinc-400 py-8">No streams found</div>
  //       ) : (
  //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  //           {streams.map((stream) => (
  //             <Card key={stream.id} className="bg-zinc-900 border-zinc-800">
  //               <CardContent className="flex justify-between items-center p-4">
  //                 <div className="flex items-center gap-3">
  //                   <img
  //                     src={stream.smallImg}
  //                     alt={stream.title}
  //                     className="w-50 h-50 rounded object-cover"
  //                     onError={(e) => {
  //                       e.currentTarget.src = "https://via.placeholder.com/48x48?text=No+Image";
  //                     }}
  //                   />
  //                   <div>
  //                     <h3 className="font-semibold text-zinc-100">{stream.title}</h3>
  //                     <Badge variant="secondary" className="mt-1">
  //                       {stream.type}
  //                     </Badge>
  //                   </div>
  //                 </div>

  //                 <div className="flex items-center gap-3">
  //                   <Button
  //                     size="sm"
  //                     variant="outline"
  //                     className="gap-1"
  //                     onClick={() => handleUpvote(stream.id)}
  //                   >
  //                     <ThumbsUp size={14} /> {stream.upvotes}
  //                   </Button>
  //                   <Button
  //                     size="sm"
  //                     variant="outline"
  //                     className="gap-1"
  //                     onClick={() => handleDownvote(stream.id)}
  //                   >
  //                     <ThumbsDown size={14} />
  //                   </Button>
  //                 </div>

  //               </CardContent>
  //             </Card>
  //           ))}
  //         </div>
  //       )}
  //     </div>

  //   </div>
  // )

    

const creatorId =" 6527833d-c527-4b83-993f-1f8270463634"

  return <div>
    <StreamView creatorId={creatorId} playVideo={true}/> 
  </div>

}
