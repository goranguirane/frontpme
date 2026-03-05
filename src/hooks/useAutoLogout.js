// ─── hooks/useAutoLogout.js ───────────────────────────────────────────────────
// Déconnexion automatique après X minutes d'inactivité
// Place ce hook dans Layout.jsx pour qu'il soit actif sur toutes les pages

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const INACTIVITY_MINUTES = 30; // ⏱ Déconnexion après 30 min sans activité
const WARNING_BEFORE_SEC = 60; // ⚠️ Avertissement 60s avant déconnexion

export default function useAutoLogout() {
  const { logout, user } = useAuth();
  const timerRef         = useRef(null);
  const warnRef          = useRef(null);
  const [warning, setWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_BEFORE_SEC);
  const countRef = useRef(null);

  const resetTimer = () => {
    if (!user) return;

    setWarning(false);
    setCountdown(WARNING_BEFORE_SEC);
    clearTimeout(timerRef.current);
    clearTimeout(warnRef.current);
    clearInterval(countRef.current);

    // Avertissement avant déconnexion
    warnRef.current = setTimeout(() => {
      setWarning(true);
      setCountdown(WARNING_BEFORE_SEC);
      countRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(countRef.current);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }, (INACTIVITY_MINUTES * 60 - WARNING_BEFORE_SEC) * 1000);

    // Déconnexion effective
    timerRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_MINUTES * 60 * 1000);
  };

  useEffect(() => {
    if (!user) return;

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      clearTimeout(timerRef.current);
      clearTimeout(warnRef.current);
      clearInterval(countRef.current);
    };
  }, [user]);

  return { warning, countdown, resetTimer };
}