import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Template uses sonner for toasts
import { Link } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { data, error } = await signIn(email, password);
        if (error) throw new Error(error);

        toast.success("Signed in successfully");

        // SURGICAL: Role-based redirection
        const role = data.user.role;
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "provider") {
          navigate("/admin"); // For now, providers go to a similar dashboard or profile
        } else {
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password, username);
        if (error) throw new Error(error);
        toast.success("Account created! Please login now.");
        setIsLogin(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-bold text-foreground text-center mb-2 cursor-pointer" onClick={goHome}>
          STYLE N TUNES
        </h1>
        <p className="font-body text-sm text-muted-foreground text-center mb-8">
          {isLogin ? "Sign in to your account" : "Create an account"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-border bg-background text-foreground px-4 py-3 font-body text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-border bg-background text-foreground px-4 py-3 font-body text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border border-border bg-background text-foreground px-4 py-3 font-body text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background py-3 font-body text-sm font-bold hover:bg-foreground/90 transition-all disabled:opacity-50 h-11"
          >
            {loading ? "PROCESSING..." : isLogin ? "LOGIN" : "REGISTER"}
          </button>
        </form>

        <p className="font-body text-xs text-muted-foreground text-center mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-foreground underline">
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
