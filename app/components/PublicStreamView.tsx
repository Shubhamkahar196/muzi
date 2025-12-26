

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

  const playNextVideo = async () => {
    try {
      // Call the API to mark current video as played and get next video
      const response = await axios.get(`/api/next?creatorId=${creatorId}`);

      if (response.data.stream) {
        const nextStream = response.data.stream;
        const video: Video = {
          id: nextStream.id,
          title: nextStream.title,
          extractedId: nextStream.extractedId,
          bigImg: nextStream.bigImg,
        };
        setCurrentVideo(video);
      } else {
        // No more streams available
        setCurrentVideo(null);
      }

      // Refresh streams to update the queue
      const streamsRes = await axios.get(`/api/streams?creatorId=${creatorId}`);
      const list: Stream[] = streamsRes.data.streams || [];
      const sorted = [...list].sort((a, b) => {
        if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      setStreams(sorted);
    } catch (error) {
      console.error("Error playing next video:", error);
      // Fallback to local state update if API fails
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
    }
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

    try {
      await axios.post("/api/streams/upvote", { streamId: id });
      toast.success("Upvoted!");
      // Optionally refresh streams here if needed
    } catch (error) {
      console.error("Upvote error:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to upvote");
      } else {
        toast.error("Failed to upvote");
      }
    }
  }

  async function handleDownvote(id: string) {
    if (!canPerformAction("vote_limit")) {
      toast.error("Wait 45 seconds or sign up for unlimited voting");
      return;
    }

    try {
      await axios.post("/api/streams/downvote", { streamId: id });
      toast.success("Downvoted!");
      // Optionally refresh streams here if needed
    } catch (error) {
      console.error("Downvote error:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to downvote");
      } else {
        toast.error("Failed to downvote");
      }
    }
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
                      className="w-12 h-12 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/48x48?text=No+Image";
                      }}
                    />
                    <div>
                      <p className="text-zinc-50">{s.title}</p>
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
                  <p className="mt-3 text-center text-zinc-300">
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
