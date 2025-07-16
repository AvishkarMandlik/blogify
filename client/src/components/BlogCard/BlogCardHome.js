import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaRegHeart, FaBookmark, FaRegComment, FaUser } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { currentUser } from "../../util/currentUser";
import CreateBlogModal from "./CreateBlogModal";
import Swal from "sweetalert2";
import { Modal, ListGroup, Button } from "react-bootstrap";

export default function BlogCardHome({
  blogId,
  title,
  imgUrl,
  description,
  category,
  author,
  isLiked,
  isSaved,
}) {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [latestComment, setLatestComment] = useState("");
  const [commentUsername, setCommentUsername] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likedUsernames, setLikedUsernames] = useState([]);

  const handleCreateSuccess = () => {
    window.location.reload();
  };

  const handleOpenCommentBox = (e) => {
    e.stopPropagation();
    setShowCommentBox((prev) => !prev);
  };

  useEffect(() => {
    (async () => {
      try {
        const [likeRes, commentRes] = await Promise.all([
          axios.get(`/likeCount?blogId=${blogId}`),
          axios.get(`/comments?blogId=${blogId}`),
        ]);

        setLikeCount(likeRes.data.data);
        const comments = commentRes.data.comments || [];
        setCommentCount(comments.length);
        if (comments.length) {
          const last = comments.at(-1);
          setLatestComment(last.comment.slice(0, 20) + "…");
          setCommentUsername(last.username);
        }
      } catch (err) {
        console.error("Error fetching counts:", err);
      }
    })();
  }, [blogId]);

  const handleLike = async (e) => {
    e.preventDefault();
    const url = liked ? "unlikeBlog" : "likeBlog";
    try {
      const { data } = await axios.post(`/${url}`, {
        blogId,
        userId: currentUser?.id,
      });
      if (data.success) {
        setLiked(!liked);
        setLikeCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    try {
      await axios.post("/addComment", {
        blogId,
        userId: currentUser?.id,
        comment: commentText.trim(),
      });
      setCommentText("");
      setShowCommentBox(false);
      setCommentCount((c) => c + 1);
      setLatestComment(commentText.slice(0, 20) + "…");
      setCommentUsername(currentUser?.username);
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const url = saved ? "unsaveBlog" : "saveBlog";
    try {
      const { data } = await axios.post(`/${url}`, {
        blogId,
        userId: currentUser?.id,
      });
      if (data.success) setSaved(!saved);
    } catch (err) {
      console.error("Save error:", err);
    }
  };
  const openBlog = (blogId) => {
    window.location.href = `/BlogContent?blogId=${blogId}`;
  };

  const openLikeUsernames = async (blogId) => {
  try {
    const res = await axios.get("/likeDetails", { params: { blogId } });
    
    if (res.data.success) {
      // Simply set the usernames without showing any warnings
      setLikedUsernames(res.data.usernames || []);
      setShowLikesModal(true);
      
      // Optional: Log the discrepancy for debugging (but don't show to users)
      if (res.data.count !== res.data.usernames.length) {
        console.log(`Like count discrepancy: ${res.data.count} total likes, ${res.data.usernames.length} valid usernames`);
      }
    } else {
      throw new Error(res.data.message || "Failed to fetch likes");
    }
  } catch (err) {
    console.error("Error fetching likes:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.response?.data?.message || "Failed to fetch likes",
    });
  }
};

  const LikeUsersModal = ({ show, onHide, usernames, totalCount }) => {
    return (
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>
      <FaHeart className="text-danger" /> by {usernames.length} {totalCount} users 
    </Modal.Title>

        </Modal.Header>
        <Modal.Body>
          <Modal.Title>People who liked this post</Modal.Title>
          {usernames.length > 0 ? (
            <ListGroup variant="flush">
              {usernames.map((username, index) => (
                <ListGroup.Item key={index}>
                  <FaUser className="me-2" />
                  {username} <FaHeart className="text-danger float-end" />
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-muted">No likes yet</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <div className="my-4 col-lg-12">
      <button
        onClick={() => setShowCreate(true)}
        className="btn btn-gradient shadow d-flex align-items-center gap-2"
        style={{
          position: "fixed",
          bottom: 60,
          right: 20,
          maxWidth: "90vw",
          background: "#0070FF",
          color: "#fff",
          border: "none",
          borderRadius: "30px",
          padding: "10px 20px",
          fontSize: "16px",
          fontWeight: 500,
          zIndex: 1000,
          transition: "all 0.3s ease",
          // boxShadow: "0px 8px 20px rgba(0, 123, 255, 0.4)",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow =
            "0 10px 25px rgba(102, 16, 242, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 123, 255, 0.4)";
        }}
        title="Create Blog"
      >
        <FiEdit size={20} />{" "}
        <span className="d-none d-sm-inline ">Create Blog</span>
      </button>

      <div
        className="card shadow-lg bg-white rounded border-0 w-100"
        style={{ minHeight: 435, transition: "all .3s", cursor: "pointer" }}
      >
        <span className="position-absolute top-0 start-0 badge bg-dark text-white m-2">
          {author}
        </span>
        <span
          className="position-absolute top-0 end-0 badge m-2"
          style={{ background: "#0d51f0" }}
        >
          {category}
        </span>

        <Link
          to={`/BlogContent?blogId=${blogId}`}
          style={{ textDecoration: "none" }}
        >
          <img
            src={imgUrl || "/assets/Blogify1.jpg"}
            alt="blog banner"
            className="card-img-top"
            style={{ height: 200, objectFit: "cover" }}
          />
        </Link>

        <div className="card-body">
          <h5 className="card-title text-dark" onClick={() => openBlog(blogId)}>
            {title.slice(0, 25) + (title.length > 25 ? "..." : "")}
          </h5>
          <p
            className="card-text text-secondary"
            style={{ fontSize: ".9rem" }}
            onClick={() => openBlog(blogId)}
          >
            {description?.slice(0, 140) +
              (description?.length > 140 ? "..." : "")}
          </p>

          <div className="d-flex justify-content-between align-items-center border-top pt-2">
            <div className="d-flex align-items-center gap-3">
             <span
                onClick={handleLike}
                style={{
                  cursor: "pointer",
                  color: liked ? "red" : "#444",
                  fontSize: "1.4rem",
                }}
              >
                {liked ? <FaHeart /> : <FaRegHeart />}
                <span 
                  className="ms-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (likeCount > 0) openLikeUsernames(blogId);
                  }}
                  style={{ 
                    cursor: likeCount > 0 ? "pointer" : "default",
                    textDecoration: likeCount > 0 ? "underline" : "none"
                  }}
                >
                  {likeCount}
                </span>
              </span>
              <button
                className="border-0 bg-transparent"
                onClick={handleOpenCommentBox}
              >
                <span style={{ fontSize: "1.4rem", color: "#444" }}>
                  <FaRegComment className="me-1" />
                  {commentCount}
                </span>
              </button>
            </div>

            <button
              className={`btn btn-sm ${
                saved ? "btn-success" : "btn-outline-primary"
              }`}
              onClick={handleSave}
            >
              <FaBookmark className="me-1" /> {saved ? "Saved" : "Save"}
            </button>
          </div>

          {latestComment && (
            <div className="mt-3 border-top pt-2">
              <p className="mb-0 text-muted" style={{ fontSize: ".9rem" }}>
                <strong>{commentUsername}:</strong> {latestComment}
              </p>
            </div>
          )}
        </div>

        {showCommentBox && (
          <div className="border-top p-3 bg-light">
            <div className="input-group">
              <input
                className="form-control"
                placeholder="Write a comment…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                className="btn btn-dark"
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
<LikeUsersModal 
        show={showLikesModal} 
        onHide={() => setShowLikesModal(false)} 
        usernames={likedUsernames} 
      />
      <CreateBlogModal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        onSuccess={handleCreateSuccess}
        author={currentUser?.username}
      />
    </div>
  );
}
