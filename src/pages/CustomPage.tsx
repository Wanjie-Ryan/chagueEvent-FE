import { useParams, Link } from "react-router-dom";
import { usePage } from "@/hooks/usePages";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MarkdownRenderer = ({ content }: { content: string }) => {
  const html = content
    .replace(/^### (.+)$/gm, '<h3 class="font-display text-lg font-bold text-foreground mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-display text-xl font-bold text-foreground mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-display text-2xl font-bold text-foreground mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="w-full max-w-2xl my-4" />')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="font-body text-sm text-foreground ml-4">• $1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
  return <div className="font-body text-sm text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
};

const CustomPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = usePage(slug || "");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-4xl px-6 lg:px-12 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>
        ) : !page || error ? (
          <div className="text-center py-20">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">Page Not Found</h1>
            <p className="font-body text-sm text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
            <Link to="/" className="font-body text-sm underline text-foreground">Go Home</Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">{page.title}</h1>
            <MarkdownRenderer content={page.content} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CustomPage;
