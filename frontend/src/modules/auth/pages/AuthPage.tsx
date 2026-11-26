import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useAuth } from "../context/useAuth";
import "./AuthPage.css";
import whiteSymbol from "../../../assets/brand/stat-forge/01_white_symbol.png";
import statText from "../../../assets/brand/stat-forge/02_stat.png";
import forgeText from "../../../assets/brand/stat-forge/03_forge.png";
import bluePiece1 from "../../../assets/brand/stat-forge/blue_piece_1.png";
import bluePiece2 from "../../../assets/brand/stat-forge/blue_piece_2.png";
import bluePiece3 from "../../../assets/brand/stat-forge/blue_piece_3.png";
import bluePiece4 from "../../../assets/brand/stat-forge/blue_piece_4.png";
import bluePiece5 from "../../../assets/brand/stat-forge/blue_piece_5.png";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
    const isRegister = mode === "register";
    const { status, signIn, signUp } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (status === "loading") return <div className="auth-loading">Checking your session…</div>;
    if (status === "authenticated") return <Navigate to="/dashboard" replace />;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            if (isRegister) await signUp({ username, email, password });
            else await signIn({ email, password });
            const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
            navigate(from && from !== "/login" && from !== "/register" ? from : "/dashboard", { replace: true });
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-side-orbit" aria-hidden="true" />
            <section className="auth-brand-panel" aria-label="Stat Forge">
                <div className="auth-logo" role="img" aria-label="Stat Forge">
                    <img className="auth-logo-symbol" src={whiteSymbol} alt="" />
                    <img className="auth-logo-piece auth-logo-piece-one" src={bluePiece1} alt="" />
                    <img className="auth-logo-piece auth-logo-piece-two" src={bluePiece2} alt="" />
                    <img className="auth-logo-piece auth-logo-piece-three" src={bluePiece3} alt="" />
                    <img className="auth-logo-piece auth-logo-piece-four" src={bluePiece4} alt="" />
                    <img className="auth-logo-piece auth-logo-piece-five" src={bluePiece5} alt="" />
                    <img className="auth-logo-text auth-logo-stat" src={statText} alt="" />
                    <img className="auth-logo-text auth-logo-forge" src={forgeText} alt="" />
                </div>
            </section>

            <section className="auth-card">
                <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {isRegister && <label className="auth-field">
                        <span>Username</span>
                        <span className="auth-input-wrap"><UserRound size={17} /><input autoComplete="username" required minLength={5} maxLength={50} value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Your username" /></span>
                    </label>}
                    <label className="auth-field">
                        <span>Email address</span>
                        <span className="auth-input-wrap"><Mail size={17} /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></span>
                    </label>
                    <label className="auth-field">
                        <span>Password</span>
                        <span className="auth-input-wrap"><LockKeyhole size={17} /><input type="password" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={8} maxLength={16} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8–16 characters" /></span>
                    </label>
                    {error && <p className="auth-error" role="alert">{error}</p>}
                    <button className="auth-submit" type="submit" disabled={submitting}>
                        {submitting ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
                        {!submitting && <ArrowRight size={17} />}
                    </button>
                </form>
                <p className="auth-switch">
                    {isRegister ? "Already have an account? " : "New to Stat Forge? "}
                    <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link>
                </p>
            </section>
        </main>
    );
}
