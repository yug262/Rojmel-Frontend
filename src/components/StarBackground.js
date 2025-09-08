import React, { useEffect } from 'react';

// You can move the CSS into a CSS module or keep it as a styled component,
// but for simplicity, let's keep it in a style block for this example.
const starStyles = `

    @keyframes star-fall {
        from { transform: translate(0, 0); }
        to { transform: translate(-50vw, -100vh); }
    }
    @keyframes star-rise {
        from { transform: translate(0, 0); }
        to { transform: translate(50vw, 100vh); }
    }
    .star {
        position: absolute;
        background: rgb(173, 173, 173);
        border-radius: 50%;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
    }
    .star-up { animation-name: star-fall; }
    .star-down { animation-name: star-rise; }
    .star-layer-1 {
        width: 1.5px; height: 1.5px; opacity: 0.9; animation-duration: 40s;
    }
    .star-layer-2 {
        width: 2.5px; height: 2.5px; opacity: 0.6; animation-duration: 80s;
    }
    .star-layer-3 {
        width: 1px; height: 1px; opacity: 0.3; animation-duration: 120s;
    }
    .star-layer-4 {
        width: 4px; height: 4px; opacity: 1; animation-duration: 30s;
    }
`;

const StarBackground = () => {
    useEffect(() => {
        const container = document.querySelector('.star-background');
        const numStars = 1000;

        if (!container) return; // Add a safety check

        for (let i = 0; i < numStars; i++) {
            const star = document.createElement('div');
            star.className = 'star';

            const direction = Math.random() < 0.5 ? 'up' : 'down';
            star.classList.add(direction === 'up' ? 'star-up' : 'star-down');

            const layerChance = Math.random();
            let layer = 3;
            if (layerChance < 0.1) layer = 4;
            else if (layerChance < 0.4) layer = 1;
            else if (layerChance < 0.7) layer = 2;
            else layer = 3;

            star.classList.add(`star-layer-${layer}`);

            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const delay = Math.random() * (
                layer === 4 ? 30 : layer === 1 ? 40 : layer === 2 ? 80 : 120
            );

            star.style.left = `${x}vw`;
            star.style.top = `${y}vh`;
            star.style.animationDelay = `-${delay}s`;

            container.appendChild(star);
        }

        // Cleanup function to remove stars when the component unmounts
        return () => {
            if (container) {
                container.innerHTML = '';
            }
        };
    }, []); // Empty dependency array ensures this runs only once

    return (
        <>
            <style>{starStyles}</style>
            <div className="star-background absolute inset-0 overflow-hidden bg-black -z-10" />
        </>
    );
};

export default StarBackground;