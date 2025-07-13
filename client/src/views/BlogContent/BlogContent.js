/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../../components/Navbar/Navbar";
import {
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegComment,
  FaEdit,
  FaTrashAlt,
  FaInfoCircle,
} from "react-icons/fa";
import "./BlogContent.css";
import { currentUser } from "../../util/currentUser";

export default function BlogContent() {
  // ── routing & auth ────────────────────────────────────────────
  const blogId = new URLSearchParams(useLocation().search).get("blogId");
  const userId = currentUser?.id;
  const username = currentUser?.username;
  const role = currentUser?.role;

  // ── state ─────────────────────────────────────────────────────
  const [blog, setBlog] = useState(null);

  const [comments, setComments] = useState([]);
  const [newText, setNewText] = useState("");

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCnt, setLikeCnt] = useState(0);

  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  // summary
  const [summary, setSummary] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(true); // open by default
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    if (!blogId) return;

    (async () => {
      try {
        const [{ data: blogData }, { data: commentRes }, { data: savedRes }] =
          await Promise.all([
            axios.post("/BlogContent", { blogId }),
            axios.get("/comments", { params: { blogId } }),
            axios.get("/savedBlogs", { params: { userId } }),
          ]);

        setBlog(blogData);
        setComments(commentRes.comments || []);
        setLikeCnt(blogData.likes?.length || 0);
        setLiked(blogData.likes?.includes(userId));
        setSaved(savedRes.data.some((b) => b._id === blogId));
      } catch (err) {
        console.error("Error loading blog:", err);
      }
    })();
  }, [blogId]);

  // ── like / save helpers ───────────────────────────────────────
  const toggleLike = async () => {
    const route = liked ? "/unlikeBlog" : "/likeBlog";
    try {
      await axios.post(route, { blogId, userId });
      setLiked(!liked);
      setLikeCnt((cnt) => (liked ? cnt - 1 : cnt + 1));
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const toggleSave = async () => {
    const route = saved ? "/unsaveBlog" : "/saveBlog";
    try {
      await axios.post(route, { blogId, userId });
      setSaved(!saved);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // ── comment CRUD (unchanged except brevity) ───────────────────
  const addComment = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    try {
      const { data } = await axios.post("/addComment", {
        blogId,
        userId,
        comment: newText.trim(),
      });
      if (data.success) {
        setComments((prev) => [...prev, data.comment]);
        setNewText("");
      }
    } catch (err) {
      console.error("Add comment:", err);
    }
  };

  const startEdit = (c) => {
    setEditId(c.commentId);
    setEditText(c.comment);
  };
  const cancelEdit = () => {
    setEditId(null);
    setEditText("");
  };

  const saveEdit = async (id) => {
    try {
      const { data } = await axios.put("/editComment", {
        commentId: id,
        newComment: editText.trim(),
        userId,
      });
      if (data.success) {
        setComments((prev) =>
          prev.map((c) =>
            c.commentId === id ? { ...c, comment: editText.trim() } : c
          )
        );
        cancelEdit();
        Swal.fire({
          title: "Comment updated!",
          icon: "success",
          timer: 900,
          showConfirmButton: false,
          background: "#1f1f1f",
          color: "#eee",
        });
      }
    } catch (err) {
      console.error("Edit error:", err);
    }
  };

  const deleteComment = (commentId) => {
    Swal.fire({
      title: "Delete comment?",
      text: "This action cannot be undone.",
      icon: "warning",
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
      showCancelButton: true,
      reverseButtons: true,
      background: "#1f1f1f",
      color: "#eee",
    }).then(async (r) => {
      if (!r.isConfirmed) return;
      try {
        const { data } = await axios.delete("/deleteComment", {
          params: { blogId, commentId, userId },
        });
        if (data.success) {
          setComments((prev) => prev.filter((c) => c.commentId !== commentId));
          Swal.fire({
            title: "Deleted!",
            icon: "success",
            timer: 900,
            showConfirmButton: false,
            background: "#1f1f1f",
            color: "#eee",
          });
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
    });
  };

  const [typingWord, setTypingWord] = useState("");

  const typeSummary = (full) => {
    let i = 0;
    let text = " ";
    setTypingWord("");
    setSummary("");

    const interval = setInterval(() => {
      text += full[i];
      setTypingWord(text);
      i++;
      if (i >= full.length) {
        clearInterval(interval);
        setSummary(full.trim());
      }
    }, 300);
  };

  const [hasSummarized, setHasSummarized] = useState(false);

  useEffect(() => {
    if (!blog?.content || hasSummarized) return;

    setHasSummarized(true); // prevent re-trigger
    setSummaryLoading(true);
    setSummaryError(""); // reset previous error

    setTimeout(async () => {
      try {
        const { data } = await axios.post("/summarizeBlog", {
          content: blog.content,
        });

        if (data.success) {
          typeSummary(data.summary); // animate
          setSummary(data.summary); // store full
          setSummaryError("");
        } else {
          setSummaryError("❌ Unable to generate summary. Please try again.");
        }
      } catch (err) {
        console.error("Gemini summarization error:", err);

        if (err.response?.status === 429) {
          setSummaryError("🚫 Too many requests. Please wait a moment.");
        } else if (err.response?.status === 503) {
          setSummaryError("⚠️ AI service unavailable. Try again later.");
        } else {
          setSummaryError("❌ Unexpected error. Please try again.");
        }
      } finally {
        setSummaryLoading(false);
      }
    }, 1000);
  }, [blog?.content]);

  const initials = (str) => str?.slice(0, 1).toUpperCase();

  if (!blog) return <div className="container mt-5 text-light">Loading…</div>;

  return (
    <>
      <Navbar user={username} />

      <div
        className="container-fluid text-light p-5"
        style={{ backgroundColor: "#1F305E", wordWrap: "break-word" }}
      >
        <div className="bg-dark p-4 rounded shadow">
          <img
            src={blog.imgUrl || "/assets/Blogify1.jpg"}
            alt="banner"
            className="img-fluid rounded mb-4"
            style={{ maxHeight: 420, objectFit: "cover", width: "100%" }}
          />
          <h1 className="display-5 fw-bold">{blog.title}</h1>
          <p className="lead ">{blog.description}</p>
          <p>
            <strong className="text-info">Author:</strong> {blog.author}
          </p>

          <div className="d-flex align-items-center gap-4 border-top pt-3">
            <span
              onClick={toggleLike}
              style={{
                cursor: "pointer",
                fontSize: "1.7rem",
                color: liked ? "red" : "#bbb",
              }}
            >
              {liked ? <FaHeart /> : <FaRegHeart />}
              <span className="ms-1" style={{ fontSize: "1.2rem" }}>
                {likeCnt}
              </span>
            </span>

            <button
              className={`btn btn-sm ${
                saved ? "btn-success" : "btn-outline-primary"
              }`}
              onClick={toggleSave}
            >
              <FaBookmark className="me-1" />
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        <div className="ai-summary-card shadow-sm mt-4">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span className="emoji-face">🤖</span>
              <div>
                <h6 className="mb-0 text-info assistant-name">
                  {"Blogify Assistant".split("").map((ch, i) => (
                    <span key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                      {ch}
                    </span>
                  ))}
                </h6>
                <small className="text-gray">AI-generated Summary</small>
              </div>
            </div>

            <button
              className="btn btn-sm btn-outline-info"
              disabled={summaryLoading}
              onClick={() => {
                setSummaryError("");
                setSummary("");
                setTypingWord("Thinking");
                setSummaryLoading(true);

                axios
                  .post("/summarizeBlog", { content: blog.content })
                  .then((res) => {
                    if (res.data.success) {
                      typeSummary(res.data.summary); // char‑by‑char
                    } else {
                      setSummaryError("Unable to generate summary.");
                    }
                  })
                  .catch((err) => {
                    const msg =
                      err.response?.status === 429
                        ? "Rate‑limit hit (429). Try later."
                        : "Gemini API error.";
                    setSummaryError(msg);
                  })
                  .finally(() => {
                    setSummaryLoading(false);
                  });
              }}
            >
              🔁 {summary ? "Regenerate Summary 🪄" : "Generate Summary 🪄"}
            </button>
          </div>

          <div className="d-flex mt-3 ">
            <div className="ai-bubble">
              {summaryLoading && (
                <div className="typing-animation">
                  {typingWord}
                  <span className="cursor">|</span>
                </div>
              )}
              {summaryError && (
                <p className="text-danger mb-0">{summaryError}</p>
              )}
              {!summaryLoading && !summaryError && summary && (
                <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                  {summary}
                </p>
              )}
            </div>
          </div>
        </div>

        <p
          className="bg-dark fs-5 mt-2 p-4 rounded shadow"
          style={{ whiteSpace: "pre-line" }}
        >
          {blog.content}
        </p>

        <div className="bg-dark text-white p-4 mt-2 rounded shadow">
          <h4 className="mb-4">
            <FaRegComment className="me-2" />
            Comments ({comments.length})
          </h4>

          {comments.map((c) => (
            <div
              key={c.commentId}
              className="d-flex align-items-start py-2 border-bottom comment-row"
            >
              <div className="avatar-circle me-3">{initials(c.username)}</div>

              <div className="flex-grow-1">
                <div className="d-flex justify-content-between">
                  <span className="fw-bold text-warning">{c.username}</span>

                  {(c.userId === userId || role === "admin") && (
                    <div className="comment-actions">
                      {editId === c.commentId ? (
                        <>
                          <button
                            className="btn btn-sm btn-success me-1"
                            onClick={() => saveEdit(c.commentId)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-sm btn-outline-light"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-sm btn-outline-light me-1"
                            onClick={() => startEdit(c)}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteComment(c.commentId)}
                          >
                            <FaTrashAlt /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {editId === c.commentId ? (
                  <textarea
                    className="form-control mt-2"
                    rows={2}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  <p className="mb-2">{c.comment}</p>
                )}
              </div>
            </div>
          ))}

          {/* add comment */}
          <form onSubmit={addComment} className="d-flex align-items-start mt-3">
            <div className="avatar-circle me-3">{initials(username)}</div>
            <input
              className="form-control flex-grow-1"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Add a comment…"
              required
            />
            <button className="btn btn-light ms-2">Post</button>
          </form>
        </div>
      </div>

      {/* ── floating reopen icon ────────────── */}
      {!summaryOpen && (
        <div
          className="floating-summary-icon"
          onClick={() => setSummaryOpen(true)}
          title="Show Summary"
        >
          <FaInfoCircle size={26} />
        </div>
      )}
    </>
  );
}
