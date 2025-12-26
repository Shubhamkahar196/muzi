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

      if (!currentVideo && res.data.currentStream) {
        const s = res.data.currentStream;
        setCurrentVideo({
          id: s.id,
          title: s.title,
          extractedId: s.extractedId,
          bigImg: s.bigImg,
        });
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
      const res = await axios.get("/api/next");
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
  }, [refreshStreams]);

  /* ---------------- YOUTUBE PLAYER ---------------- */

  useEffect(() => {
    if (!playVideo || !videoPlayerRef.current || !currentVideo) return;

    videoPlayerRef.current.innerHTML = "";

    const player = YouTubePlayer(videoPlayerRef.current, {
      videoId: currentVideo.extractedId,
      playerVars: { autoplay: 1, controls: 1, rel: 0 },
    });

    playerRef.current = player;

    player.on("stateChange", (event: { data: number }) => {
      if (event.data === 0) playNext();
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [currentVideo?.id, playVideo, playNext]);

  /* ---------------- ACTIONS ---------------- */

  async function handleUpvote(id: string) {
    await axios.post("/api/streams/upvote", { streamId: id });
    refreshStreams();
  }

  async function handleDownvote(id: string) {
    await axios.post("/api/streams/downvote", { streamId: id });
    refreshStreams();
  }

  async function handleDelete(id: string) {
    await axios.delete("/api/streams", { data: { streamId: id } });
    refreshStreams();
  }

  async function handleAdd() {
    if (!inputLink) return;

    await axios.post("/api/streams", {
      creatorId: session?.user?.id,
      url: inputLink,
    });

    setInputLink("");
    refreshStreams();
  }

  function handleShare() {
    const link = `${window.location.origin}/public/${session?.user?.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Public link copied");
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Song Voting Queue</h1>
        <Button onClick={handleShare}>
          <Share2 size={16} /> Share
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Queue */}
        <div>
          <h2 className="text-xl mb-4">Upcoming Songs</h2>
          {loading ? (
            <p>Loading...</p>
          ) : streams.length === 0 ? (
            <p>No videos in queue</p>
          ) : (
            streams.map((s) => (
              <Card key={s.id} className="mb-3 bg-zinc-900">
                <CardContent className="flex justify-between items-center p-4">
                  <div className="flex gap-3">
                    <Image src={s.smallImg} width={48} height={48} className="w-12 h-12 rounded" alt={s.title} />
                    <div>
                      <p className="text-zinc-50 font-semibold">{s.title}</p>
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
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(s.id)}
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
          <h2 className="text-xl">Now Playing</h2>
          <Card className="bg-zinc-900">
            <CardContent className="p-4">
              {currentVideo ? (
                <>
                  {playVideo && (
                    <div ref={videoPlayerRef} className="aspect-video" />
                  )}
                  <p className="text-center mt-2 text-zinc-50 font-bold">
                    {currentVideo.title}
                  </p>
                </>
              ) : (
                <p>No video playing</p>
              )}
            </CardContent>
          </Card>

          {playVideo && (
            <Button onClick={playNext} className="w-full">
              <Play size={18} /> Play Next
            </Button>
          )}

          <Input
            value={inputLink}
            onChange={(e) => setInputLink(e.target.value)}
            placeholder="YouTube link"
          />
          <Button onClick={handleAdd} className="w-full">
            Add to Queue
          </Button>
        </div>
      </div>
    </div>
  );
}
