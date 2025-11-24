import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function ConfettiAnimation() {
    useEffect(() => {
        confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.6 },
            zIndex: 9999, // optional: make sure it shows above other content
        });
    }, []);

    return null; // No UI needed
}
