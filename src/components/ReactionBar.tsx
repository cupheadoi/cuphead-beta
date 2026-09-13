import React, { useEffect, useState } from 'react';
import { ThumbsDown, ThumbsUp, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, authToken } from '../lib/api';

interface ReactionCounts {
  likes: number;
  dislikes: number;
}

interface ReactionBarProps {
  contentType: string;
  contentId: string;
}

export default function ReactionBar({ contentType, contentId }: ReactionBarProps) {
  const [value, setValue] = useState<number>(0);
  const [counts, setCounts] = useState<ReactionCounts>({ likes: 0, dislikes: 0 });
  const [busy, setBusy] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(Boolean(authToken()));

  useEffect(() => {
    if (!contentType || !contentId) return;

    let active = true;
    const token = authToken();
    setIsLoggedIn(Boolean(token));

    api.reactions(contentType, contentId)
      .then((r) => {
        if (!active) return;
        setValue(Number(r?.userValue || 0));
        setCounts({
          likes: Number(r?.likes || 0),
          dislikes: Number(r?.dislikes || 0)
        });
      })
      .catch((err) => {
        console.warn('Failed to load reactions:', err?.message || err);
      });

    return () => {
      active = false;
    };
  }, [contentType, contentId]);

  async function handleReact(targetValue: number) {
    if (!contentType || !contentId || busy) return;

    // Disallow unauthenticated users completely
    if (!isLoggedIn || !authToken()) {
      return;
    }

    // Toggle logic: if user clicks the already active button, cancel reaction (set to 0)
    const nextValue = value === targetValue ? 0 : targetValue;
    const prevValue = value;
    const prevCounts = { ...counts };

    // Calculate optimistic counts
    let newLikes = counts.likes;
    let newDislikes = counts.dislikes;

    if (prevValue === 1) newLikes = Math.max(0, newLikes - 1);
    if (prevValue === -1) newDislikes = Math.max(0, newDislikes - 1);

    if (nextValue === 1) newLikes += 1;
    if (nextValue === -1) newDislikes += 1;

    // Optimistically update
    setValue(nextValue);
    setCounts({ likes: newLikes, dislikes: newDislikes });
    setBusy(true);

    try {
      const res = await api.react({ contentType, contentId, value: nextValue });
      if (res && res.likes !== undefined && res.dislikes !== undefined) {
        setCounts({
          likes: Number(res.likes),
          dislikes: Number(res.dislikes)
        });
      }
    } catch (err: any) {
      // Revert optimistic changes on failure
      setValue(prevValue);
      setCounts(prevCounts);
      if (err?.message === 'UNAUTHORIZED') {
        setIsLoggedIn(false);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 pt-3 border-t border-slate-800/80">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[11px] font-medium text-slate-500 ml-1">آیا این بخش مفید بود؟</span>

        {/* Like Button */}
        <button
          type="button"
          disabled={!isLoggedIn || busy}
          onClick={() => isLoggedIn && handleReact(1)}
          title={isLoggedIn ? 'مفید بود' : 'برای ثبت نظر ابتدا وارد حساب شوید'}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 select-none ${
            !isLoggedIn
              ? 'bg-slate-900/40 border-slate-800/80 text-slate-500 opacity-70 cursor-not-allowed'
              : value === 1
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/10 cursor-pointer'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800/40 cursor-pointer'
          }`}
          aria-label="پسندیدم"
        >
          <ThumbsUp size={13} className={value === 1 ? 'fill-emerald-400/20 text-emerald-400' : ''} />
          <span>مفید بود</span>
          {counts.likes > 0 && (
            <span
              className={`text-[11px] font-mono px-1.5 py-0.2 rounded-md ${
                value === 1 ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {counts.likes}
            </span>
          )}
        </button>

        {/* Dislike Button */}
        <button
          type="button"
          disabled={!isLoggedIn || busy}
          onClick={() => isLoggedIn && handleReact(-1)}
          title={isLoggedIn ? 'نیاز به بهبود' : 'برای ثبت نظر ابتدا وارد حساب شوید'}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 select-none ${
            !isLoggedIn
              ? 'bg-slate-900/40 border-slate-800/80 text-slate-500 opacity-70 cursor-not-allowed'
              : value === -1
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-500/10 cursor-pointer'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800/40 cursor-pointer'
          }`}
          aria-label="نپسندیدم"
        >
          <ThumbsDown size={13} className={value === -1 ? 'fill-rose-400/20 text-rose-400' : ''} />
          <span>نیاز به بهبود</span>
          {counts.dislikes > 0 && (
            <span
              className={`text-[11px] font-mono px-1.5 py-0.2 rounded-md ${
                value === -1 ? 'bg-rose-500/20 text-rose-200' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {counts.dislikes}
            </span>
          )}
        </button>

        {/* Prompt for unauthenticated users */}
        {!isLoggedIn && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-900/40 border border-slate-800/60 px-2.5 py-1 rounded-lg">
            <Lock size={12} className="text-slate-500" />
            <span>برای ثبت نظر،</span>
            <Link to="/auth" className="text-cyan-400 hover:text-cyan-300 underline font-medium">
              وارد شوید
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
