
import whiteSymbol from "../../../assets/brand/stat-forge/01_white_symbol.png";
import statText from "../../../assets/brand/stat-forge/02_stat.png";
import forgeText from "../../../assets/brand/stat-forge/03_forge.png";

import bluePiece1 from "../../../assets/brand/stat-forge/blue_piece_1.png";
import bluePiece2 from "../../../assets/brand/stat-forge/blue_piece_2.png";
import bluePiece3 from "../../../assets/brand/stat-forge/blue_piece_3.png";
import bluePiece4 from "../../../assets/brand/stat-forge/blue_piece_4.png";
import bluePiece5 from "../../../assets/brand/stat-forge/blue_piece_5.png";

import "./LogoLarge.css";

interface LogoLargeProps {
    onAnimationComplete?: () => void;
}

export function LogoLarge({
    onAnimationComplete,
}: LogoLargeProps) {
    return (
        <div
            className="brand-logo-intro"
            onAnimationEnd={(event) => {
                if (
                    event.target === event.currentTarget &&
                    event.animationName === "logo-intro-complete"
                ) {
                    onAnimationComplete?.();
                }
            }}
        >
            <img className="intro-white" src={whiteSymbol} alt="" />

            <img className="intro-blue piece-1" src={bluePiece1} alt="" />
            <img className="intro-blue piece-2" src={bluePiece2} alt="" />
            <img className="intro-blue piece-3" src={bluePiece3} alt="" />
            <img className="intro-blue piece-4" src={bluePiece4} alt="" />
            <img className="intro-blue piece-5" src={bluePiece5} alt="" />

            <img className="intro-text intro-stat" src={statText} alt="STAT" />
            <img className="intro-text intro-forge" src={forgeText} alt="FORGE" />
        </div>
    );
}
