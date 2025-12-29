"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import YouTubePlayer from "youtube-player";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Play, Share2, Trash2 } from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

const REFRESH_INTERVAL_MS = 30_000;

/* ---------------- TYPES ---------------- */

interface Stream {
  id: string;
  title: string;
  upvotes: number;
  extractedId: string;
  type: string;
  smallImg: string;
  bigImg: string;
}

interface Video {
  id: string;
  title: string;
  extractedId: string;
  bigImg: string;
}

/* ---------------- COMPONENT ---------------- */

export default function StreamView({ playVideo }: { playVideo: boolean }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [streams, setStreams] = useState<Stream[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputLink, setInputLink] = useState("");
  const [addingSong, setAddingSong] = useState(false);

  const videoPlayerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);

  /* ---------------- AUTH GUARD ---------------- */

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  /* ---------------- FETCH STREAMS ---------------- */

  const refreshStreams = useCallback(async () => {
    if (status !== "authenticated") return;

    try {
      const res = await axios.get("/api/streams/my");
      const list: Stream[] = res.data.streams || [];

      setStreams(list);
      setLoading(false);

      // Always sync with the current stream from API
      if (res.data.currentStream && res.data.currentStream.id) {
        const s = res.data.currentStream;
        setCurrentVideo({
          id: s.id || "",
          title: s.title || "Unknown Title",
          extractedId: s.extractedId || "",
          bigImg: s.bigImg || "",
        });
      } else if (!currentVideo && res.data.streams && res.data.streams.length > 0) {
        // Fallback: if no current stream but there are streams, use the first one
        const firstStream = res.data.streams[0];
        if (firstStream && firstStream.id) {
          setCurrentVideo({
            id: firstStream.id,
            title: firstStream.title || "Unknown Title",
            extractedId: firstStream.extractedId || "",
            bigImg: firstStream.bigImg || "",
          });
        }
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [status, currentVideo]);

  /* ---------------- INITIAL LOAD ---------------- */

  useEffect(() => {
    if (status !== "authenticated") return;
    refreshStreams();
  }, [status, refreshStreams]);

  /* ---------------- POLLING ---------------- */

  useEffect(() => {
    if (status !== "authenticated") return;

    const interval = setInterval(refreshStreams, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [status, refreshStreams]);

  /* ---------------- PLAY NEXT (BACKEND AUTHORITY) ---------------- */

  const playNext = useCallback(async () => {
    try {
      const res = await axios.get(`/api/next?creatorId=${session?.user?.id}`);
      const next = res.data.stream;

      if (!next) {
        setCurrentVideo(null);
        toast("Queue finished");
        return;
      }

      setCurrentVideo({
        id: next.id,
        title: next.title,
        extractedId: next.extractedId,
        bigImg: next.bigImg,
      });

      refreshStreams();
    } catch (err) {
      console.error(err);
      toast.error("Failed to play next");
    }
  }, [refreshStreams, session]);

  /* ---------------- YOUTUBE PLAYER ---------------- */

  useEffect(() => {
    if (!playVideo || !videoPlayerRef.current || !currentVideo || !currentVideo.extractedId) return;

    // Validate videoId format (should be 11 characters)
    if (currentVideo.extractedId.length !== 11) {
      console.error("Invalid YouTube video ID:", currentVideo.extractedId);
      toast.error("Invalid video ID");
      return;
    }

    videoPlayerRef.current.innerHTML = "";

    try {
      const player = YouTubePlayer(videoPlayerRef.current, {
        videoId: currentVideo.extractedId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          fs: 1,
          cc_load_policy: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : ''
        } as any,
      });

      playerRef.current = player;

      player.on("ready", () => {
        console.log("YouTube player ready");
      });

      player.on("stateChange", (event: { data: number }) => {
        console.log("Player state:", event.data);
        if (event.data === 0) { // Video ended
          playNext();
        }
      });

      player.on("error", (error: any) => {
        console.error("YouTube player error:", error);
        toast.error("Error playing video - it may be private or unavailable");
      });
    } catch (error) {
      console.error("Failed to initialize YouTube player:", error);
      toast.error("Failed to load video player");
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying player:", e);
        }
        playerRef.current = null;
      }
    };
  }, [currentVideo?.id, playVideo, playNext]);

  /* ---------------- ACTIONS ---------------- */

  async function handleUpvote(id: string) {
    await axios.post("/api/streams/upvote", { streamId: id });
    refreshStreams();
    toast.success("Upvoted Song")
  }

  async function handleDownvote(id: string) {
    await axios.post("/api/streams/downvote", { streamId: id });
    refreshStreams();
    toast.success("Downvoted Song")
  }

  async function handleDelete(id: string) {
    await axios.delete("/api/streams", { data: { streamId: id } });
    refreshStreams();
    toast.error("Deleted Song")
  }

  async function handleAdd() {
    if (!inputLink || addingSong) return;

    setAddingSong(true);
    try {
      await axios.post("/api/streams", {
        creatorId: session?.user?.id,
        url: inputLink,
      });

      setInputLink("");
      refreshStreams();
      toast.success("Song added to queue!");
    } catch (error) {
      console.error("Error adding song:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to add song");
      } else {
        toast.error("Adding....")
      }
    } finally {
      setAddingSong(false);
    }
  }

  function handleShare() {
    const link = `${window.location.origin}/public/${session?.user?.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Public link copied");
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Song Voting Queue</h1>
        <Button onClick={handleShare} className="cursor-pointer hover:bg-blue-500 w-full sm:w-auto">
          <Share2 size={16} /> Share
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        {/* Queue */}
        <div>
          <h2 className="text-lg md:text-xl mb-4">Upcoming Songs</h2>
          {loading ? (
            <p>Loading...</p>
          ) : streams.length === 0 ? (
            <p>No videos in queue</p>
          ) : (
            streams.filter(s => s && s.id).map((s) => (
              <Card key={s.id} className="mb-3 bg-zinc-900">
                <CardContent className="flex justify-between items-center p-4">
                  <div className="flex gap-3">
                    <Image
                      src={s.smallImg || "https://via.placeholder.com/48x48?text=No+Image"}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded"
                      alt={s.title || "Unknown Title"}
                    />
                    <div>
                      <p className="text-zinc-50 font-semibold">{s.title || "Unknown Title"}</p>
                      <Badge>{s.type || "Unknown"}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpvote(s.id)} className="cursor-pointer hover:bg-blue-500">
                      <ThumbsUp size={14} /> {s.upvotes || 0}
                    </Button>
                    <Button size="sm" onClick={() => handleDownvote(s.id)} className="cursor-pointer hover:bg-blue-500">
                      <ThumbsDown size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(s.id)}
                      className="cursor-pointer hover:bg-blue-500"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Player */}
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl">Now Playing</h2>
          <Card className="bg-zinc-900">
            <CardContent className="p-4">
              {currentVideo ? (
                <>
                  {playVideo && (
                    <div
                      ref={videoPlayerRef}
                      className="w-full aspect-video bg-black rounded"
                      style={{ minHeight: '200px' }}
                    />
                  )}
                  <p className="text-center mt-2 text-zinc-50 font-bold text-sm md:text-base">
                    {currentVideo.title}
                  </p>
                </>
              ) : (
                <div className="w-full aspect-video bg-zinc-800 rounded flex items-center justify-center">
                  <p className="text-zinc-400 font-semibold">No video playing</p>
                </div>
              )}
            </CardContent>
          </Card>

          {playVideo && (
            <Button onClick={playNext} className="w-full cursor-pointer hover:bg-blue-500">
              <Play size={18} /> Play Next
            </Button>
          )}

          <Input
            value={inputLink}
            onChange={(e) => setInputLink(e.target.value)}
            placeholder="YouTube link"
          />
          <Button
            onClick={handleAdd}
            disabled={addingSong}
            className="w-full cursor-pointer hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingSong ? "Adding..." : "Add to Queue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
