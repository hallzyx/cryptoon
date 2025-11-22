"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCurrentUser, useIsSignedIn } from "@coinbase/cdp-hooks";
import { FaArrowLeft, FaArrowRight, FaHome, FaList, FaHeart, FaComment, FaShare } from "react-icons/fa";
import { MdTheaterComedy } from "react-icons/md";



export default function ReadChapterPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params?.seriesId as string;
  const chapterId = params?.chapterId as string;
  const { currentUser } = useCurrentUser();
  const { isSignedIn } = useIsSignedIn();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [liked, setLiked] = useState(false);
  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/db.json')
      .then(res => res.json())
      .then(data => {
        const chapterData = data.chapterContent?.[seriesId]?.[chapterId];
        setChapter(chapterData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading chapter:', err);
        setLoading(false);
      });
  }, [seriesId, chapterId]);

  // Auto-hide header on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Chapter not found</h1>
          <Link href="/series" className="text-purple-400 hover:text-purple-300">
            Back to Series
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Auto-hide on scroll */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-purple-900/30 transition-transform duration-300 ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left - Back & Info */}
            <div className="flex items-center gap-4 flex-1">
              <Link
                href={`/series/${seriesId}`}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <FaArrowLeft />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <div className="hidden md:block border-l border-purple-900/30 pl-4">
                <h1 className="text-sm font-medium text-gray-300 line-clamp-1">
                  {chapter.seriesTitle}
                </h1>
                <p className="text-xs text-gray-500">
                  Chapter {chapter.id}: {chapter.title}
                </p>
              </div>
            </div>

            {/* Center - Logo */}
            <Link href="/series" className="flex items-center gap-2">
              <MdTheaterComedy className="text-2xl text-purple-500" />
              <span className="hidden sm:inline text-lg font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                CRYPTOON
              </span>
            </Link>

            {/* Right - Actions */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <button
                onClick={() => setLiked(!liked)}
                className={`p-2 rounded-lg transition-colors ${
                  liked
                    ? "text-red-500 bg-red-500/10"
                    : "text-gray-400 hover:text-white hover:bg-purple-900/30"
                }`}
              >
                <FaHeart />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-purple-900/30 rounded-lg transition-colors">
                <FaComment />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-purple-900/30 rounded-lg transition-colors">
                <FaShare />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Reader Content - Vertical Scroll (Webtoon Style) */}
      <main className="pt-16">
        <div className="max-w-3xl mx-auto">
          {/* Chapter Images */}
          <div className="space-y-0">
            {chapter.images.map((image: string, index: number) => (
              <div key={index} className="w-full">
                <img
                  src={image}
                  alt={`${chapter.title} - Panel ${index + 1}`}
                  className="w-full h-auto"
                  loading={index > 2 ? "lazy" : "eager"}
                />
              </div>
            ))}
          </div>

          {/* End of Chapter Card */}
          <div className="p-8 bg-gradient-to-b from-purple-900/20 to-black border-t border-purple-500/30">
            <div className="text-center max-w-md mx-auto space-y-6">
              <h2 className="text-2xl font-bold">End of Chapter {chapter.id}</h2>
              <p className="text-gray-400">{chapter.title}</p>

              {/* Navigation Buttons */}
              <div className="flex gap-4 justify-center pt-4">
                {chapter.prevChapter && (
                  <Link
                    href={`/read/${seriesId}/${chapter.prevChapter}`}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-900/30 hover:bg-purple-900/50 rounded-lg transition-colors border border-purple-500/30"
                  >
                    <FaArrowLeft />
                    <span>Previous</span>
                  </Link>
                )}
                <Link
                  href={`/series/${seriesId}`}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-900/30 hover:bg-purple-900/50 rounded-lg transition-colors border border-purple-500/30"
                >
                  <FaList />
                  <span>Chapters</span>
                </Link>
                {chapter.nextChapter ? (
                  <Link
                    href={`/read/${seriesId}/${chapter.nextChapter}`}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium"
                  >
                    <span>Next</span>
                    <FaArrowRight />
                  </Link>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 rounded-lg text-gray-500 border border-gray-700">
                    <span>Coming Soon</span>
                  </div>
                )}
              </div>

              {/* Back to Series */}
              <Link
                href={`/series/${seriesId}`}
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <FaHome />
                <span>Back to {chapter.seriesTitle}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Navigation (Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-sm border-t border-purple-900/30 md:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            {chapter.prevChapter ? (
              <Link
                href={`/read/${seriesId}/${chapter.prevChapter}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-900/30 rounded-lg text-sm"
              >
                <FaArrowLeft />
                <span>Prev</span>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            <Link
              href={`/series/${seriesId}`}
              className="px-4 py-2 bg-purple-900/30 rounded-lg text-sm"
            >
              <FaList />
            </Link>
            {chapter.nextChapter ? (
              <Link
                href={`/read/${seriesId}/${chapter.nextChapter}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium"
              >
                <span>Next</span>
                <FaArrowRight />
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
