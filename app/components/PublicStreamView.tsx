// "use client"

// import { Button } from "@/components/ui/button"
// import { useEffect, useState,  useRef } from "react"
// import { Card, CardContent } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import YouTubePlayer from 'youtube-player';
// import { Badge } from "@/components/ui/badge"
// import {
//   ThumbsUp,
//   ThumbsDown,
//   UserPlus,
// } from "lucide-react"
// import axios from "axios"
// import toast from "react-hot-toast"

// const REFRESH_INTERVAL_MS = 1 * 1000; // Refresh every 1 second for real-time updates

// interface Stream {
//   id: string;
//   title: string;
//   upvotes: number;
//   extractedId: string;
//   type: string;
//   url: string;
//   smallImg: string;
//   bigImg: string;
//   userId: string;
//   haveUpVoted: boolean;
//   createAt: string;
// }

// interface Video {
//   id: string;
//   title: string;
//   extractedId: string;
//   bigImg: string;
// }

// export default function PublicStreamView({
//     creatorId,
// }:{
//     creatorId: string;
// }) {

//   const [streams, setStreams] = useState<Stream[]>([]);
//   const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
//   const [loading, setLoading] = useState(true);
//   const [inputLink, setInputLink] = useState('')
//   const [lastActionTime, setLastActionTime] = useState<number>(0);
//   const videoPlayerRef = useRef<HTMLDivElement>(null);
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const playerRef = useRef<any>(null);

//   const RATE_LIMIT_MS = 45 * 1000; // 45 seconds

//   // Fetch streams for the creator
//   async function refreshStreams(){
//     try {
//       const res = await axios.get(`/api/streams?creatorId=${creatorId}`);
//       const streamsData = res.data.streams || [];
//       const currentStreamData = res.data.currentStream;

//       // Sort streams by upvotes (most voted first, then oldest first)
//       const sortedStreams = streamsData.sort((a: Stream, b: Stream) => {
//         if (b.upvotes !== a.upvotes) {
//           return b.upvotes - a.upvotes; // Most upvotes first
//         }
//         return new Date(a.createAt).getTime() - new Date(b.createAt).getTime(); // Oldest first for same upvotes
//       });

//       setStreams(sortedStreams);
//       setLoading(false);

//       // Set current video to the creator's current stream, or most voted if none
//       if (currentStreamData) {
//         const video: Video = {
//           id: currentStreamData.id,
//           title: currentStreamData.title,
//           extractedId: currentStreamData.extractedId,
//           bigImg: currentStreamData.bigImg
//         };
//         setCurrentVideo(video);
//       } else if (!currentVideo && sortedStreams.length > 0) {
//         const mostVotedStream = sortedStreams[0];
//         const video: Video = {
//           id: mostVotedStream.id,
//           title: mostVotedStream.title,
//           extractedId: mostVotedStream.extractedId,
//           bigImg: mostVotedStream.bigImg
//         };
//         setCurrentVideo(video);
//       }
//     } catch (error) {
//       console.error("Error fetching streams:", error);
//       setLoading(false);
//     }
//   }

//   async function handleUpvote(streamId: string) {
//     const now = performance.now();
//     if (now - lastActionTime < RATE_LIMIT_MS) {
//       toast.error("Please sign up to gain full access and vote without rate limits!");
//       return;
//     }

//     try {
//       await axios.post(`/api/streams/upvote`, {
//         streamId: streamId
//       });
//       setLastActionTime(now);
//       toast.success("Upvoted successfully!");
//       // Refresh streams after upvote
//       refreshStreams();
//     } catch (error) {
//       console.error("Error upvoting:", error);
//       toast.error("Failed to upvote");
//     }
//   }

//   async function handleDownvote(streamId: string) {
//     const now = performance.now();
//     if (now - lastActionTime < RATE_LIMIT_MS) {
//       toast.error("Please sign up to gain full access and vote without rate limits!");
//       return;
//     }

//     try {
//       await axios.post(`/api/streams/downvote`, {
//         streamId: streamId
//       });
//       setLastActionTime(now);
//       toast.success("Downvoted successfully!");
//       // Refresh streams after downvote
//       refreshStreams();
//     } catch (error) {
//       console.error("Error downvoting:", error);
//       toast.error("Failed to downvote");
//     }
//   }

//   const handleAddToQueue = async () => {
//     const now = performance.now();
//     if (now - lastActionTime < RATE_LIMIT_MS) {
//       toast.error("Please sign up to gain full access and add videos without rate limits!");
//       return;
//     }

//     try {
//       const response = await axios.post(`/api/streams`, {
//         creatorId: creatorId,
//         url: inputLink
//       });

//       setInputLink(''); // Clear input on success
//       setLastActionTime(now);
//       toast.success("Song added to queue successfully!");

//       // Update streams optimistically with the returned data
//       if (response.data.stream) {
//         setStreams(prevStreams => [...prevStreams, response.data.stream]);
//       } else {
//         // Fallback to refresh if no stream data returned
//         await refreshStreams();
//       }
//     } catch (error) {
//       console.error("Error adding to queue:", error);
//       if (axios.isAxiosError(error)) {
//         toast.error(error.response?.data?.message || "Failed to add to queue");
//       } else {
//         toast.error("Failed to add to queue");
//       }
//     }
//   };

//   const handlePlayNext = () => {
//     // Show signup prompt
//     const shouldSignUp = window.confirm("Sign up to gain full access and manually control the playlist!");
//     if (shouldSignUp) {
//       window.location.href = "/"; // Redirect to home page with auth
//     }
//   };

//   const playNextVideo = async () => {
//     if (streams.length > 0) {
//       // Get the most voted stream
//       const nextStream = streams[0];
//       const video: Video = {
//         id: nextStream.id,
//         title: nextStream.title,
//         extractedId: nextStream.extractedId,
//         bigImg: nextStream.bigImg
//       };

//       setCurrentVideo(video);

//       // Mark as played and refresh
//       try {
//         await axios.get(`/api/next?creatorId=${creatorId}`);
//         await refreshStreams();
//       } catch (error) {
//         console.error("Error playing next:", error);
//       }
//     }
//   };

//   useEffect(() => {
//     refreshStreams();
//     const interval = setInterval(() => {
//       refreshStreams();
//     }, REFRESH_INTERVAL_MS);

//     return () => clearInterval(interval);
//   }, [creatorId]);

//   useEffect(() => {
//     if (!videoPlayerRef.current || !currentVideo) {
//       return;
//     }

//     // Clear any existing player content
//     videoPlayerRef.current.innerHTML = '';

//     const player = YouTubePlayer(videoPlayerRef.current, {
//       videoId: currentVideo.extractedId,
//       playerVars: {
//         autoplay: 1,
//         controls: 1,
//         modestbranding: 1,
//         rel: 0
//       }
//     });

//     playerRef.current = player;

//     // Load and play the video
//     player.loadVideoById(currentVideo.extractedId);
//     player.playVideo();

//     // Handle video end - auto-play next song
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     player.on('stateChange', (event: any) => {
//       console.log('Player state:', event.data);
//       // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
//       if (event.data === 0) { // Video ended
//         console.log('Video ended, playing next...');
//         playNextVideo();
//       }
//     });

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     player.on('ready', () => {
//       console.log('Player ready for video:', currentVideo.extractedId);
//     });

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     player.on('error', (error: any) => {
//       console.error('Player error:', error);
//       // On error, try to play next video
//       setTimeout(() => {
//         playNextVideo();
//       }, 2000);
//     });

//   }, [currentVideo?.id]);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white px-6 py-8">

//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-bold">Public Song Voting Queue</h1>
//         <div className="flex items-center gap-3">
//           <Button
//             variant="outline"
//             className="gap-2"
//             onClick={() => window.location.href = "/"}
//           >
//             <UserPlus size={16} />
//             Sign Up
//           </Button>
//           <Badge variant="secondary" className="text-sm">
//             Live Voting Session
//           </Badge>
//         </div>
//       </div>

//       {/* Main Content - Two Column Layout */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

//         {/* Left Column - Upcoming Songs */}
//         <div>
//           <h2 className="text-xl font-semibold mb-4">Upcoming Songs</h2>
//           {streams.length === 0 && <Card className="bg-gray-900 border-gray-800 w-full">
//              <CardContent className="p-4">
//               <p className="text-center py-8 text-gray-400">No videos in queue</p>
//              </CardContent>
//             </Card>}

//           {loading ? (
//             <div className="text-center text-zinc-400 py-8">Loading streams...</div>
//           ) : streams.length === 0 ? (
//             <div className="text-center text-zinc-400 py-8">No streams found</div>
//           ) : (
//             <div className="grid grid-cols-1 gap-4">
//               {streams.map((stream) => (
//                 <Card key={stream.id} className="bg-zinc-900 border-zinc-800">
//                   <CardContent className="flex justify-between items-center p-4">
//                     <div className="flex items-center gap-3">
//                       <img
//                         src={stream.smallImg}
//                         alt={stream.title}
//                         className="w-12 h-12 rounded object-cover"
//                         onError={(e) => {
//                           e.currentTarget.src = "https://via.placeholder.com/48x48?text=No+Image";
//                         }}
//                       />
//                       <div>
//                         <h3 className="font-semibold text-zinc-100 text-sm">{stream.title}</h3>
//                         <Badge variant="secondary" className="mt-1 text-xs">
//                           {stream.type}
//                         </Badge>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="gap-1 h-8 px-2"
//                         onClick={() => handleUpvote(stream.id)}
//                       >
//                         <ThumbsUp size={12} /> {stream.upvotes}
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="gap-1 h-8 px-2"
//                         onClick={() => handleDownvote(stream.id)}
//                       >
//                         <ThumbsDown size={12} />
//                       </Button>
//                     </div>

//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Right Column - Now Playing */}
//         <div className="space-y-6">

//           {/* Add Video Section */}
//           <div>
//             <h2 className="text-xl font-semibold mb-4">Add to Queue</h2>
//             <div className="space-y-3">
//               <Input
//                 value={inputLink}
//                 onChange={(e) => setInputLink(e.target.value)}
//                 placeholder="Paste YouTube link here"
//                 className="bg-zinc-800 border-zinc-700"
//               />
//               <Button onClick={handleAddToQueue} className="w-full bg-purple-600 hover:bg-purple-700">
//                 Add to Queue
//               </Button>
//             </div>
//           </div>

//           {/* Now Playing Section */}
//           <div>
//             <h2 className="text-xl font-semibold mb-3">Now Playing</h2>

//             <Card className="bg-zinc-900 border-zinc-800">
//               <CardContent className="p-4">
//                 {currentVideo ? (
//                   <div className="space-y-4">
//                     <div ref={videoPlayerRef} className="w-full aspect-video">
//                       {/* YouTube player will be rendered here */}
//                     </div>
//                     <p className="text-center font-semibold text-white">{currentVideo?.title}</p>
//                     <p className="text-center text-sm text-zinc-400">
//                       Auto-playing next song when current ends
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="flex items-center justify-center h-64 text-zinc-400">
//                     <div className="text-center">
//                       <p className="text-lg mb-2">Waiting for songs...</p>
//                       <p className="text-sm">Vote on songs to start the playlist!</p>
//                     </div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//             <Button
//               onClick={handlePlayNext}
//               className="w-full mt-4 bg-purple-600 hover:bg-purple-700 gap-2"
//             >
//               <span>Play Next</span>
//             </Button>
//           </div>

//           {/* Instructions */}
//           <Card className="bg-zinc-900 border-zinc-800">
//             <CardContent className="p-4">
//               <h3 className="font-semibold mb-2">How to Participate:</h3>
//               <ul className="text-sm text-zinc-300 space-y-1">
//                 <li>• Click 👍 to upvote songs you want to hear</li>
//                 <li>• Click 👎 to downvote songs you don't want</li>
//                 <li>• Add new songs to the queue</li>
//                 <li>• Songs auto-play when the current one ends</li>
//                 <li>• Sign up for unlimited voting and adding songs</li>
//               </ul>
//             </CardContent>
//           </Card>

//         </div>

//       </div>

//     </div>
//   )
// }



"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import YouTubePlayer from "youtube-player";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, UserPlus } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const REFRESH_INTERVAL_MS = 1000;
const RATE_LIMIT_MS = 45 * 1000;

/* ---------------- TYPES ---------------- */

interface Stream {
  id: string;
  title: string;
  upvotes: number;
  extractedId: string;
  type: string;
  smallImg: string;
  bigImg: string;
  createdAt: string;
}

interface Video {
  id: string;
  title: string;
  extractedId: string;
  bigImg: string;
}

/* ---------------- RATE LIMIT ---------------- */

function canPerformAction(key: string) {
  const last = localStorage.getItem(key);
  const now = Date.now();

  if (last && now - Number(last) < RATE_LIMIT_MS) {
    return false;
  }

  localStorage.setItem(key, now.toString());
  return true;
}

/* ---------------- COMPONENT ---------------- */

export default function PublicStreamView({
  creatorId,
}: {
  creatorId: string;
}) {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputLink, setInputLink] = useState("");

  const videoPlayerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);

  /* ---------------- FETCH + POLL STREAMS ---------------- */

  useEffect(() => {
    let cancelled = false;

    const loadStreams = async () => {
      try {
        const res = await axios.get(`/api/streams?creatorId=${creatorId}`);
        const list: Stream[] = res.data.streams || [];

        const sorted = [...list].sort((a, b) => {
          if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
          return (
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
          );
        });

        if (cancelled) return;

        setStreams(sorted);
        setLoading(false);

        setCurrentVideo((prev) => {
          if (prev || sorted.length === 0) return prev;
          return {
            id: sorted[0].id,
            title: sorted[0].title,
            extractedId: sorted[0].extractedId,
            bigImg: sorted[0].bigImg,
          };
        });
      } catch (err) {
        if (!cancelled) setLoading(false);
        console.error(err);
      }
    };

    loadStreams();
    const interval = setInterval(loadStreams, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [creatorId]);

  /* ---------------- PLAY NEXT VIDEO ---------------- */

  const playNextVideo = () => {
    setStreams((prev) => {
      if (prev.length <= 1) {
        setCurrentVideo(null);
        return [];
      }

      const [, ...remaining] = prev;
      const next = remaining[0];

      setCurrentVideo({
        id: next.id,
        title: next.title,
        extractedId: next.extractedId,
        bigImg: next.bigImg,
      });

      return remaining;
    });
  };

  /* ---------------- YOUTUBE PLAYER ---------------- */

  useEffect(() => {
    if (!videoPlayerRef.current || !currentVideo) return;

    videoPlayerRef.current.innerHTML = "";

    const player = YouTubePlayer(videoPlayerRef.current, {
      videoId: currentVideo.extractedId,
      playerVars: {
        autoplay: 1,
        controls: 1,
        rel: 0,
      },
    });

    playerRef.current = player;

    player.on("stateChange", (event: { data: number }) => {
      if (event.data === 0) {
        playNextVideo();
      }
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [currentVideo?.id]);

  /* ---------------- ACTIONS ---------------- */

  async function handleUpvote(id: string) {
    if (!canPerformAction("vote_limit")) {
      toast.error("Wait 45 seconds or sign up for unlimited voting");
      return;
    }
    await axios.post("/api/streams/upvote", { streamId: id });
  }

  async function handleDownvote(id: string) {
    if (!canPerformAction("vote_limit")) {
      toast.error("Wait 45 seconds or sign up for unlimited voting");
      return;
    }
    await axios.post("/api/streams/downvote", { streamId: id });
  }

  async function handleAddToQueue() {
    if (!canPerformAction("add_limit")) {
      toast.error("Wait 45 seconds or sign up");
      return;
    }

    await axios.post("/api/streams", {
      creatorId,
      url: inputLink,
    });

    setInputLink("");
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Public Song Voting</h1>
        <Button onClick={() => (window.location.href = "/")}>
          <UserPlus size={16} /> Sign Up
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Queue */}
        <div>
          <h2 className="text-xl mb-3">Upcoming Songs</h2>
          {loading ? (
            <p>Loading...</p>
          ) : streams.length === 0 ? (
            <p>No songs in queue</p>
          ) : (
            streams.map((s) => (
              <Card key={s.id} className="mb-3 bg-zinc-900">
                <CardContent className="flex justify-between items-center p-3">
                  <div className="flex gap-3">
                    <img
                      src={s.smallImg}
                      alt={s.title}
                      className="w-12 h-12 rounded"
                    />
                    <div>
                      <p>{s.title}</p>
                      <Badge>{s.type}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpvote(s.id)}>
                      <ThumbsUp size={14} /> {s.upvotes}
                    </Button>
                    <Button size="sm" onClick={() => handleDownvote(s.id)}>
                      <ThumbsDown size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Player */}
        <div>
          <h2 className="text-xl mb-3">Now Playing</h2>
          <Card className="bg-zinc-900">
            <CardContent className="p-4">
              {currentVideo ? (
                <>
                  <div ref={videoPlayerRef} className="aspect-video" />
                  <p className="mt-3 text-center">
                    {currentVideo.title}
                  </p>
                </>
              ) : (
                <p>No song playing</p>
              )}
            </CardContent>
          </Card>

          <div className="mt-4">
            <Input
              value={inputLink}
              onChange={(e) => setInputLink(e.target.value)}
              placeholder="YouTube link"
            />
            <Button className="w-full mt-2" onClick={handleAddToQueue}>
              Add to Queue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
