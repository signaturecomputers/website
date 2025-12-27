"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ThemeEffectWrapper() {
    const [currentTheme, setCurrentTheme] = useState<string>("default");

    useEffect(() => {
        // Listen to the site_settings/theme document
        const unsub = onSnapshot(doc(db, "site_settings", "theme"), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (data.isActive) {
                    setCurrentTheme(data.currentTheme);
                } else {
                    setCurrentTheme("default");
                }
            } else {
                setCurrentTheme("default");
            }
        });

        return () => unsub();
    }, []);

    if (currentTheme === "default") return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {currentTheme === "christmas" && <SnowfallEffect />}
            {currentTheme === "diwali" && <DiwaliLights />}
            {currentTheme === "newyear" && <FireworksEffect />}
            {currentTheme === "valentines" && <HeartsEffect />}
            {(currentTheme === "republic" || currentTheme === "independence") && <TricolorEffect />}
            {(currentTheme === "eid" || currentTheme === "bakrid") && <EidEffect />}
        </div>
    );
}

function SnowfallEffect() {
    const snowflakes = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 3 + 2}s`,
        animationDelay: `${Math.random() * 2}s`,
        opacity: Math.random(),
        size: `${Math.random() * 10 + 5}px`
    }));

    return (
        <>
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute top-[-20px] bg-white rounded-full animate-fall"
                    style={{
                        left: flake.left,
                        width: flake.size,
                        height: flake.size,
                        opacity: flake.opacity,
                        animationDuration: flake.animationDuration,
                        animationDelay: flake.animationDelay,
                    }}
                />
            ))}
        </>
    );
}

function DiwaliLights() {
    return (
        <>
            {/* Top Hanging Lights */}
            <div className="w-full flex justify-between absolute top-0 pointer-events-auto">
                <div className="w-full h-24 bg-gradient-to-b from-orange-500/20 to-transparent absolute top-0 left-0" />
                {Array.from({ length: 15 }).map((_, i) => (
                    <div key={`d-top-${i}`} className="w-3 h-24 bg-gradient-to-b from-transparent to-yellow-400/80 rounded-b-full shadow-[0_0_25px_theme('colors.yellow.500')]" style={{
                        height: `${Math.random() * 40 + 40}px`,
                        animation: `swing ${Math.random() * 2 + 2}s infinite ease-in-out`
                    }} />
                ))}
            </div>

            {/* Bottom Diyas (Floating Lamps) */}
            <div className="absolute bottom-0 w-full h-32 flex justify-around items-end pb-4 bg-gradient-to-t from-orange-900/40 to-transparent">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={`d-bot-${i}`} className="relative group">
                        {/* Diya Body */}
                        <div className="w-12 h-6 bg-amber-700 rounded-b-full shadow-lg relative z-10" />
                        {/* Flame */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-6 bg-orange-500 rounded-full animate-flicker blur-[1px]">
                            <div className="absolute inset-1 bg-yellow-200 rounded-full animate-pulse" />
                        </div>
                        {/* Glow */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-16 bg-orange-500/30 rounded-full blur-xl animate-pulse" />
                    </div>
                ))}
            </div>
        </>
    )
}

function FireworksEffect() {
    // Enhanced Fireworks with more particles and colors
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-400', 'bg-purple-500'];

    // Create multiple clusters of fireworks
    const clusters = Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 60 + 10}%`,
        left: `${Math.random() * 80 + 10}%`,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2
    }));

    return (
        <>
            {clusters.map((cluster) => (
                <div key={cluster.id} className="absolute" style={{ top: cluster.top, left: cluster.left }}>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={`fw-${cluster.id}-${i}`}
                            className={`absolute w-2 h-2 rounded-full ${cluster.color} animate-firework`}
                            style={{
                                transform: `rotate(${i * 30}deg) translate(0px)`,
                                animationDelay: `${cluster.delay}s`,
                                animationDuration: '1.5s',
                                animationIterationCount: 'infinite'
                            }}
                        />
                    ))}
                </div>
            ))}
        </>
    )
}

function HeartsEffect() {
    const hearts = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 20 + 10,
        duration: Math.random() * 5 + 5,
        delay: Math.random() * 5
    }));

    return (
        <>
            {hearts.map(heart => (
                <div
                    key={heart.id}
                    className="absolute bottom-[-50px] text-pink-500 animate-float-up opacity-60"
                    style={{
                        left: heart.left,
                        fontSize: `${heart.size}px`,
                        animationDuration: `${heart.duration}s`,
                        animationDelay: `${heart.delay}s`
                    }}
                >
                    ❤️
                </div>
            ))}
        </>
    )
}

function TricolorEffect() {
    const confetti = Array.from({ length: 60 }).map((_, i) => {
        const type = i % 3;
        let color = 'bg-orange-500'; // Saffron
        if (type === 1) color = 'bg-white';
        if (type === 2) color = 'bg-green-600';

        return {
            id: i,
            left: `${Math.random() * 100}%`,
            delay: Math.random() * 5,
            duration: Math.random() * 3 + 2,
            color
        }
    });

    return (
        <>
            {confetti.map(c => (
                <div
                    key={c.id}
                    className={`absolute top-[-10px] w-3 h-6 ${c.color} animate-confetti-fall`}
                    style={{
                        left: c.left,
                        animationDelay: `${c.delay}s`,
                        animationDuration: `${c.duration}s`
                    }}
                />
            ))}
        </>
    )
}

function EidEffect() {
    const items = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 30 + 20,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 10,
        type: i % 2 === 0 ? 'moon' : 'star'
    }));

    return (
        <>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-900/20 to-transparent" />
            {items.map(item => (
                <div
                    key={item.id}
                    className="absolute bottom-[-50px] text-yellow-500 animate-float-slow opacity-60"
                    style={{
                        left: item.left,
                        fontSize: `${item.size}px`,
                        animationDuration: `${item.duration}s`,
                        animationDelay: `${item.delay}s`
                    }}
                >
                    {item.type === 'moon' ? '🌙' : '⭐'}
                </div>
            ))}
        </>
    )
}
