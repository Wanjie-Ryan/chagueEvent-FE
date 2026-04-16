import { useState, useEffect } from "react";
import { X, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NewsletterModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem("newsletter-dismissed")) return;

    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.8;
      if (window.scrollY > heroHeight) {
        setIsOpen(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem("newsletter-dismissed", "true");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(dismiss, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-foreground/50 backdrop-blur-sm"
            onClick={dismiss}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-background border border-border p-8">
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {!submitted ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-foreground flex items-center justify-center">
                      <Mail className="w-5 h-5 text-background" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground uppercase">
                      Stay in the Loop
                    </h2>
                  </div>
                  <p className="font-body text-sm text-muted-foreground mb-6">
                    Get early access to new drops, exclusive deals, and style inspiration — straight to your inbox.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full px-4 py-3 bg-secondary text-foreground font-body text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                    <button
                      type="submit"
                      className="w-full bg-foreground text-background font-body text-sm font-medium py-3 hover:bg-foreground/90 transition-colors uppercase tracking-wider"
                    >
                      Subscribe
                    </button>
                  </form>
                  <p className="font-body text-xs text-muted-foreground mt-4 text-center">
                    No spam. Unsubscribe anytime.
                  </p>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-foreground mx-auto mb-4 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-background" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2 uppercase">
                    You're In!
                  </h2>
                  <p className="font-body text-sm text-muted-foreground">
                    Welcome to the crew. Watch your inbox for the freshest drops.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewsletterModal;
