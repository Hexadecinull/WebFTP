import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const CLICK_TARGET = 200;
const CLICK_TIMEOUT = 2000; // 2 seconds max between clicks

export function useEasterEgg() {
  const { user } = useAuth();
  const [clickCount, setClickCount] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const lastClickTime = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Check if already unlocked
  useEffect(() => {
    const key = user ? `easterEgg_${user.id}` : 'easterEgg_guest';
    if (localStorage.getItem(key) === 'true') {
      setUnlocked(true);
    }
  }, [user]);

  const handleEmptyClick = useCallback((e: React.MouseEvent) => {
    if (unlocked) return;

    // Only count clicks on empty areas (not on buttons, inputs, links, etc.)
    const target = e.target as HTMLElement;
    const interactive = target.closest('button, a, input, select, textarea, [role="button"], [data-sidebar]');
    if (interactive) return;

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;

    if (lastClickTime.current > 0 && timeSinceLastClick > CLICK_TIMEOUT) {
      // Reset - took too long
      setClickCount(1);
    } else {
      setClickCount(prev => prev + 1);
    }

    lastClickTime.current = now;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout to reset if no click within 2 seconds
    timeoutRef.current = setTimeout(() => {
      setClickCount(0);
      lastClickTime.current = 0;
    }, CLICK_TIMEOUT);
  }, [unlocked]);

  // Check for achievement
  useEffect(() => {
    if (clickCount >= CLICK_TARGET && !unlocked) {
      setUnlocked(true);
      const key = user ? `easterEgg_${user.id}` : 'easterEgg_guest';
      localStorage.setItem(key, 'true');

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (user) {
        toast({
          title: '🏆 Serious Dedication!',
          description: 'Check your profile :)',
          duration: 6000,
        });
      } else {
        toast({
          title: '🏆 Serious Dedication!',
          description: 'You discovered a hidden secret! Sign in to unlock the exclusive Easter Hunter badge.',
          duration: 8000,
        });
      }
    }
  }, [clickCount, unlocked, user]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { handleEmptyClick, unlocked, clickCount };
}
