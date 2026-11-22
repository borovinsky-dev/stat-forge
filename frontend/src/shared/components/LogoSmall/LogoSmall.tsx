
import whiteSymbol from "../../../assets/brand/stat-forge/01_white_symbol.png";

import bluePiece1 from "../../../assets/brand/stat-forge/blue_piece_1.png";
import bluePiece2 from "../../../assets/brand/stat-forge/blue_piece_2.png";
import bluePiece3 from "../../../assets/brand/stat-forge/blue_piece_3.png";
import bluePiece4 from "../../../assets/brand/stat-forge/blue_piece_4.png";
import bluePiece5 from "../../../assets/brand/stat-forge/blue_piece_5.png";

import "./LogoSmall.css";

interface LogoSmallProps {
    size?: number;
}

export function LogoSmall({ size = 40 }: LogoSmallProps) {
    return (
        <div
            className="brand-logo-mark"
            style={{
                width: size * (260 / 195),
                height: size,
            }}
        >
            <div
                className="brand-logo-mark-inner"
                style={{ transform: `scale(${size / 195})` }}
            >
                <img className="mark-white" src={whiteSymbol} alt="" />
                <img className="mark-blue piece-1" src={bluePiece1} alt="" />
                <img className="mark-blue piece-2" src={bluePiece2} alt="" />
                <img className="mark-blue piece-3" src={bluePiece3} alt="" />
                <img className="mark-blue piece-4" src={bluePiece4} alt="" />
                <img className="mark-blue piece-5" src={bluePiece5} alt="" />
            </div>
        </div>
    );
}
