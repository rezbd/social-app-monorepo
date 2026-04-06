import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function PostItem({ post }) {
  const { user } = useAuth();
  const [likeCount,    setLikeCount]    = useState(post.likeCount  || 0);
  const [likedByMe,    setLikedByMe]    = useState(post.likedByMe  || false);
  const [comments,     setComments]     = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText,  setCommentText]  = useState("");
  const [loadingLike,  setLoadingLike]  = useState(false);
  const [loadingCmt,   setLoadingCmt]   = useState(false);

  // ── Like toggle ───────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (loadingLike) return;
    try {
      setLoadingLike(true);
      const { data } = await api.post(`/posts/${post._id}/like`);
      setLikeCount(data.likeCount);
      setLikedByMe(data.liked);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLike(false);
    }
  };

  // ── Load / toggle comments ────────────────────────────────────────────────
  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      try {
        const { data } = await api.get(`/posts/${post._id}/comments`);
        setComments(data);
      } catch (err) {
        console.error(err);
      }
    }
    setShowComments((v) => !v);
  };

  // ── Submit comment ────────────────────────────────────────────────────────
  const handleComment = async () => {
    if (!commentText.trim() || loadingCmt) return;
    try {
      setLoadingCmt(true);
      const { data } = await api.post(`/posts/${post._id}/comments`, { content: commentText });
      setComments((prev) => [data, ...prev]);
      setCommentText("");
      if (!showComments) setShowComments(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCmt(false);
    }
  };

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">

        {/* Post header */}
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img src="assets/images/post_img.png" alt="" className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">
                {post.author?.firstName} {post.author?.lastName}
              </h4>
              <p className="_feed_inner_timeline_post_box_para">
                {timeAgo(post.createdAt)} &middot;{" "}
                <span>{post.visibility === "public" ? "Public" : "Private"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Post content */}
        <p style={{ margin: "12px 0", lineHeight: "1.6" }}>{post.content}</p>

        {/* Post image (base64) */}
        {post.image && (
          <div className="_feed_inner_timeline_image">
            <img
              src={post.image}
              alt="Post"
              className="_time_img"
              style={{ width: "100%", borderRadius: "8px", objectFit: "cover" }}
            />
          </div>
        )}
      </div>

      {/* Like/comment counts */}
      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_image">
          <p className="_feed_inner_timeline_total_reacts_para">
            {likeCount} {likeCount === 1 ? "Like" : "Likes"}
          </p>
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <button
              onClick={handleToggleComments}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <span>{comments.length}</span> Comment{comments.length !== 1 ? "s" : ""}
            </button>
          </p>
        </div>
      </div>

      {/* Reaction bar */}
      <div className="_feed_inner_timeline_reaction">
        <button
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction${likedByMe ? " _feed_reaction_active" : ""}`}
          onClick={handleLike}
          disabled={loadingLike}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19">
                <path fill="#FFCC4D" d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z" />
                <path fill="#664500" d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z" />
                <path fill="#fff" d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z" />
                <path fill="#664500" d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z" />
              </svg>
              {likedByMe ? "Liked" : "Like"}
            </span>
          </span>
        </button>

        <button
          className="_feed_inner_timeline_reaction_comment _feed_reaction"
          onClick={handleToggleComments}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
                <path stroke="#000" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z" />
                <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
              </svg>
              Comment
            </span>
          </span>
        </button>
      </div>

      {/* Comment input */}
      <div className="_feed_inner_timeline_cooment_area">
        <div className="_feed_inner_comment_box">
          <div className="_feed_inner_comment_box_form">
            <div className="_feed_inner_comment_box_content">
              <div className="_feed_inner_comment_box_content_image">
                <img src="assets/images/comment_img.png" alt="" className="_comment_img" />
              </div>
              <div className="_feed_inner_comment_box_content_txt">
                <textarea
                  className="form-control _comment_textarea"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                />
              </div>
            </div>
            <div className="_feed_inner_comment_box_icon">
              <button
                className="_feed_inner_comment_box_icon_btn"
                onClick={handleComment}
                disabled={loadingCmt}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 14 13">
                  <path fill="#000" fillOpacity=".46" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments list */}
      {showComments && (
        <div className="_timline_comment_main" style={{ paddingLeft: "24px", paddingRight: "24px" }}>
          {comments.length === 0 && (
            <p style={{ color: "#888", fontSize: "13px", marginTop: "8px" }}>
              No comments yet. Be the first!
            </p>
          )}
          {comments.map((c) => (
            <div key={c._id} className="_comment_main" style={{ marginTop: "12px" }}>
              <div className="_comment_image">
                <img src="assets/images/txt_img.png" alt="" className="_comment_img1" />
              </div>
              <div className="_comment_area">
                <div className="_comment_details">
                  <div className="_comment_details_top">
                    <div className="_comment_name">
                      <h4 className="_comment_name_title">
                        {c.author?.firstName} {c.author?.lastName}
                      </h4>
                    </div>
                  </div>
                  <div className="_comment_status">
                    <p className="_comment_status_text">
                      <span>{c.content}</span>
                    </p>
                  </div>
                  <div className="_comment_reply">
                    <div className="_comment_reply_num">
                      <ul className="_comment_reply_list">
                        <li><span>Like.</span></li>
                        <li><span>Reply.</span></li>
                        <li><span className="_time_link">{timeAgo(c.createdAt)}</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}