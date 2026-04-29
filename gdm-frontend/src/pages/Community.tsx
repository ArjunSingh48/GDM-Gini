import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Heart, Clock, Plus, ArrowLeft, Send, ChevronUp, ExternalLink } from "lucide-react";
import { learningArticles } from "@/data/dailyContent";

// ─── Forum Posts ───────────────────────────────────────────
const forumPosts = [
  { id: 1, author: "Sarah M.", topic: "Meals", title: "Best snacks for late-night cravings?", content: "I've been craving something sweet before bed. Any GDM-friendly suggestions that won't spike my morning glucose?", replies: 8, likes: 12, time: "2h ago" },
  { id: 2, author: "Priya K.", topic: "Emotional Support", title: "Feeling overwhelmed with tracking everything", content: "Some days I feel like I'm doing everything right and the numbers are still off. Anyone else feel this way?", replies: 15, likes: 24, time: "5h ago" },
  { id: 3, author: "Maria L.", topic: "Exercise", title: "Walking routine that actually works", content: "Sharing my routine: 10 min walk after each meal. My post-meal numbers improved within a week!", replies: 6, likes: 18, time: "1d ago" },
  { id: 4, author: "Jenny T.", topic: "Doctor Advice", title: "Questions to ask at your next appointment", content: "Made a list of helpful questions to bring to your OB about GDM. Happy to share!", replies: 10, likes: 20, time: "2d ago" },
];

const topicColors: Record<string, string> = {
  Meals: "bg-primary/10 text-primary",
  Exercise: "bg-accent/30 text-accent-foreground",
  "Emotional Support": "bg-secondary/40 text-secondary-foreground",
  "Doctor Advice": "bg-muted text-muted-foreground",
};

type Comment = {
  id: string;
  author: string;
  content: string;
  likes: number;
  time: string;
  replies: Comment[];
};

const mockComments: Record<number, Comment[]> = {
  1: [
    { id: "c1", author: "Maria L.", content: "Greek yogurt with a few walnuts works great for me! Low sugar and keeps me full.", likes: 5, time: "1h ago", replies: [
      { id: "c1r1", author: "Sarah M.", content: "Thanks Maria! I'll try that tonight 💚", likes: 2, time: "45m ago", replies: [] },
    ] },
    { id: "c2", author: "Jenny T.", content: "Cottage cheese with cinnamon is my go-to. The protein helps keep morning glucose stable.", likes: 3, time: "1.5h ago", replies: [] },
  ],
  2: [
    { id: "c3", author: "Sarah M.", content: "You're not alone! Some days my fasting numbers are high no matter what I do. It's hormones, not failure 💚", likes: 8, time: "4h ago", replies: [] },
    { id: "c4", author: "Maria L.", content: "My doctor reminded me that GDM is not about perfection. Progress matters more than perfect numbers.", likes: 6, time: "3h ago", replies: [
      { id: "c4r1", author: "Priya K.", content: "This really helps. Thank you both 🥺", likes: 4, time: "2h ago", replies: [] },
    ] },
  ],
  3: [
    { id: "c5", author: "Priya K.", content: "This is so helpful! Do you walk at a brisk pace or gentle?", likes: 2, time: "20h ago", replies: [
      { id: "c5r1", author: "Maria L.", content: "Moderate pace — enough to feel warm but still be able to talk comfortably!", likes: 3, time: "18h ago", replies: [] },
    ] },
  ],
  4: [
    { id: "c6", author: "Sarah M.", content: "Great idea! I always forget what to ask during appointments.", likes: 4, time: "1d ago", replies: [] },
  ],
};

const Community = () => {
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);

  return (
    <div className="pt-8 pb-4 animate-fade-in">
      <h1 className="text-2xl font-display font-bold mb-1">Community</h1>
      <p className="text-sm text-muted-foreground mb-6">Learn, share, and support each other 🤝</p>

      <Tabs defaultValue="blogs" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1 h-auto">
          <TabsTrigger value="blogs" className="rounded-lg text-xs py-2 data-[state=active]:bg-card data-[state=active]:shadow-soft">Blogs</TabsTrigger>
          <TabsTrigger value="forum" className="rounded-lg text-xs py-2 data-[state=active]:bg-card data-[state=active]:shadow-soft">Forum</TabsTrigger>
        </TabsList>

        <TabsContent value="blogs" className="mt-4">
          {selectedArticle !== null ? (
            <ArticleDetail article={learningArticles.find((a) => a.id === selectedArticle)!} onBack={() => setSelectedArticle(null)} />
          ) : (
            <div className="space-y-3">
              {learningArticles.map((article) => (
                <button key={article.id} onClick={() => setSelectedArticle(article.id)} className="w-full text-left bg-card rounded-2xl p-4 shadow-soft hover:shadow-card transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{article.category}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                  </div>
                  <h3 className="font-display font-semibold text-sm mb-1">{article.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{article.content}</p>
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="forum" className="mt-4">
          {selectedPost !== null ? (
            <PostDetail post={forumPosts.find((p) => p.id === selectedPost)!} onBack={() => setSelectedPost(null)} />
          ) : (
            <ForumSection onSelectPost={setSelectedPost} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ArticleDetail = ({ article, onBack }: { article: (typeof learningArticles)[0]; onBack: () => void }) => (
  <div className="animate-fade-in">
    <button onClick={onBack} className="text-xs text-primary font-medium mb-4 hover:underline flex items-center gap-1">
      <ArrowLeft className="w-3.5 h-3.5" /> Back to articles
    </button>
    <div className="bg-card rounded-2xl p-5 shadow-soft">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{article.category}</span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
      </div>
      <h2 className="font-display font-bold text-lg mb-4">{article.title}</h2>
      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line mb-4">{article.content}</p>
      {article.sourceUrl && (
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl gap-2 w-full"
          onClick={() => window.open(article.sourceUrl, '_blank')}
        >
          <ExternalLink className="w-3.5 h-3.5" /> Read Source
        </Button>
      )}
    </div>
  </div>
);

// ─── Post Detail (Reddit-style) ────────────────────────────
const PostDetail = ({ post, onBack }: { post: (typeof forumPosts)[0]; onBack: () => void }) => {
  const [comments, setComments] = useState<Comment[]>(mockComments[post.id] || []);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [postLikes, setPostLikes] = useState(post.likes);
  const [liked, setLiked] = useState(false);

  const addComment = () => {
    if (!newComment.trim()) return;
    const c: Comment = {
      id: `new-${Date.now()}`,
      author: "You",
      content: newComment.trim(),
      likes: 0,
      time: "Just now",
      replies: [],
    };
    setComments([c, ...comments]);
    setNewComment("");
  };

  const addReply = (parentId: string) => {
    if (!replyText.trim()) return;
    const reply: Comment = {
      id: `reply-${Date.now()}`,
      author: "You",
      content: replyText.trim(),
      likes: 0,
      time: "Just now",
      replies: [],
    };
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId ? { ...c, replies: [...c.replies, reply] } : c
      )
    );
    setReplyText("");
    setReplyingTo(null);
  };

  const toggleLike = () => {
    setLiked(!liked);
    setPostLikes((p) => (liked ? p - 1 : p + 1));
  };

  return (
    <div className="animate-fade-in space-y-4">
      <button onClick={onBack} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to forum
      </button>

      {/* Post */}
      <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${topicColors[post.topic] || "bg-muted text-muted-foreground"}`}>{post.topic}</span>
          <span className="text-[10px] text-muted-foreground">{post.time}</span>
        </div>
        <h2 className="font-display font-bold text-lg mb-2">{post.title}</h2>
        <p className="text-sm text-foreground/80 leading-relaxed mb-3">{post.content}</p>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground font-medium">{post.author}</span>
          <div className="flex items-center gap-4">
            <button onClick={toggleLike} className={`flex items-center gap-1 text-xs transition-colors ${liked ? "text-coral" : "text-muted-foreground hover:text-foreground"}`}>
              <Heart className={`w-4 h-4 ${liked ? "fill-coral" : ""}`} /> {postLikes}
            </button>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="w-4 h-4" /> {comments.length}
            </span>
          </div>
        </div>
      </div>

      {/* Add Comment */}
      <div className="flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 rounded-xl"
          onKeyDown={(e) => e.key === "Enter" && addComment()}
        />
        <Button size="icon" onClick={addComment} disabled={!newComment.trim()} className="rounded-xl shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Comments */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            replyingTo={replyingTo}
            replyText={replyText}
            onReplyClick={(id) => { setReplyingTo(replyingTo === id ? null : id); setReplyText(""); }}
            onReplyTextChange={setReplyText}
            onSubmitReply={addReply}
          />
        ))}
      </div>
    </div>
  );
};

const CommentCard = ({
  comment,
  replyingTo,
  replyText,
  onReplyClick,
  onReplyTextChange,
  onSubmitReply,
  depth = 0,
}: {
  comment: Comment;
  replyingTo: string | null;
  replyText: string;
  onReplyClick: (id: string) => void;
  onReplyTextChange: (t: string) => void;
  onSubmitReply: (parentId: string) => void;
  depth?: number;
}) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes);

  return (
    <div className={`${depth > 0 ? "ml-6 pl-3 border-l-2 border-border" : ""}`}>
      <div className="bg-card rounded-xl p-3 shadow-soft">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold">{comment.author}</span>
          <span className="text-[10px] text-muted-foreground">{comment.time}</span>
        </div>
        <p className="text-sm text-foreground/80 mb-2">{comment.content}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setLiked(!liked); setLikes((l) => liked ? l - 1 : l + 1); }}
            className={`flex items-center gap-1 text-[10px] transition-colors ${liked ? "text-coral" : "text-muted-foreground"}`}
          >
            <ChevronUp className={`w-3.5 h-3.5 ${liked ? "text-coral" : ""}`} /> {likes}
          </button>
          {depth === 0 && (
            <button onClick={() => onReplyClick(comment.id)} className="text-[10px] text-muted-foreground hover:text-foreground">
              Reply
            </button>
          )}
        </div>
      </div>

      {replyingTo === comment.id && (
        <div className="ml-6 mt-2 flex gap-2">
          <Input
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 rounded-lg text-sm h-9"
            onKeyDown={(e) => e.key === "Enter" && onSubmitReply(comment.id)}
          />
          <Button size="sm" onClick={() => onSubmitReply(comment.id)} disabled={!replyText.trim()} className="rounded-lg h-9 px-3">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {comment.replies.map((reply) => (
        <CommentCard
          key={reply.id}
          comment={reply}
          replyingTo={replyingTo}
          replyText={replyText}
          onReplyClick={onReplyClick}
          onReplyTextChange={onReplyTextChange}
          onSubmitReply={onSubmitReply}
          depth={depth + 1}
        />
      ))}
    </div>
  );
};

const ForumSection = ({ onSelectPost }: { onSelectPost: (id: number) => void }) => {
  const [showNewPost, setShowNewPost] = useState(false);

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowNewPost(!showNewPost)} variant="outline" className="w-full rounded-xl gap-2">
        <Plus className="w-4 h-4" />
        {showNewPost ? "Cancel" : "New Post"}
      </Button>

      {showNewPost && (
        <div className="bg-card rounded-2xl p-4 shadow-soft space-y-3 animate-fade-in">
          <Input placeholder="Post title..." className="rounded-xl" />
          <Textarea placeholder="Share your thoughts..." className="rounded-xl min-h-[80px]" />
          <div className="flex gap-2">
            {["Meals", "Exercise", "Emotional Support", "Doctor Advice"].map((topic) => (
              <button key={topic} className="text-[10px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                {topic}
              </button>
            ))}
          </div>
          <Button className="w-full rounded-xl" size="sm">Post</Button>
        </div>
      )}

      {forumPosts.map((post) => (
        <button key={post.id} onClick={() => onSelectPost(post.id)} className="w-full text-left bg-card rounded-2xl p-4 shadow-soft hover:shadow-card transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${topicColors[post.topic] || "bg-muted text-muted-foreground"}`}>{post.topic}</span>
            <span className="text-[10px] text-muted-foreground">{post.time}</span>
          </div>
          <h3 className="font-display font-semibold text-sm mb-1">{post.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{post.content}</p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium">{post.author}</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.replies}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default Community;
