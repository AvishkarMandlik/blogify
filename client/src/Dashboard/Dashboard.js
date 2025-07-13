import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Tab,
  Spinner,
  Nav,
  Button,
  Modal,
  Form,
  Table,
} from "react-bootstrap";
import {
  FaUser,
  FaBlog,
  FaBookmark,
  FaThumbsUp,
  FaChartLine,
  FaEdit,
  FaTrash,
  FaCog,
  FaHome,
  FaPlus,
  FaSearch,
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaUsers,
  FaTrashAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
// import api from "../util/api";
import axios from "axios";
import Navbar from "../components/Navbar/Navbar";
import { getUserProfile } from "../util/getUserProfile";

const fmt = (d) => new Date(d).toLocaleDateString();

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  /* ---------- auth ---------- */
  const [auth, setAuth] = useState({
    userId: "",
    username: "",
    email: "",
    role: "user",
  });
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = await getUserProfile();

      if (!user) {
        sessionStorage.clear();
        localStorage.clear();
        navigate("/login");
      } else {
        setAuth({
          userId: user.id || user._id, // support both cases
          username: user.username,
          email: user.email,
          role: user.role || "user",
        });
        setLoadingAuth(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  /* ---------- state ---------- */
  const [active, setActive] = useState(searchParams.get("tab") || "overview");
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({});
  const [myBlogs, setMyBlogs] = useState([]);
  const [likedBlogs, setLikedBlogs] = useState([]);
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  /* admin */
  const [stats, setStats] = useState({});
  const [allBlogs, setAllBlogs] = useState([]);
  const [users, setUsers] = useState([]);

  /* blog modal */
  const emptyBlog = {
    title: "",
    imgUrl: "",
    description: "",
    category: "",
    content: "",
  };
  const [blogForm, setBlogForm] = useState(emptyBlog);
  const [editMode, setEditMode] = useState(false);
  const [showBlog, setShowBlog] = useState(false);

  /* user deletion */
  const [targetUser, setTargetUser] = useState(null);
  const [pwd, setPwd] = useState("");
  const [showDelU, setShowDelU] = useState(false);

  const [delSelf, setDelSelf] = useState(false);
  const [selfCred, setSelfCred] = useState({ email: "", password: "" });

  /* search */
  const [qMine, setQMine] = useState("");
  const [qAll, setQAll] = useState("");
  useEffect(() => {
    // console.log("Fetched users:", users);
  }, [users]);

  useEffect(() => {
    if (loadingAuth) return;
    if (!auth.userId) return navigate("/login");

    (async () => {
      try {
        const base = [
          axios.get("/userProfile", {
            params: { userId: auth.userId },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get("/savedBlogs", { params: { userId: auth.userId } }),
          axios.get("/likedBlogs", { params: { userId: auth.userId } }),
        ];

        const adminPart =
          auth.role === "admin"
            ? [
                axios.get("/dashboardStats", { params: { userId: auth.userId } }),
                axios.get("/allBlogs", { params: { userId: auth.userId } }),
                axios.get("/admin/users"),
              ]
            : [axios.get("/myBlogs", { params: { userId: auth.userId } })];

        const res = await Promise.all([...base, ...adminPart]);

        setProfile(res[0].data.data);
        setSavedBlogs(res[1].data.data);
        setLikedBlogs(res[2].data.data);

        if (auth.role === "admin") {
          setStats(res[3].data.data);
          setAllBlogs(res[4].data.data);
          setUsers(res[5].data.data);
          setMyBlogs(
            res[4].data.data.filter((b) => b.author === auth.username)
          );
        } else {
          setMyBlogs(res[3].data.data);
        }
      } catch (e) {
        Swal.fire({
          icon: "error",
          title: "Oops…",
          text: e.response?.data?.message || "Load failed",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [auth.userId, auth.role, navigate]);

  /* ---------------- like / save (optimistic) ---------------- */
  const toggleLike = async (blog, liked) => {
    const mutate = (setter) =>
      setter((prev) =>
        prev.map((b) =>
          b._id === blog._id
            ? {
                ...b,
                likes: liked
                  ? b.likes.filter((i) => i !== auth.userId)
                  : [...b.likes, auth.userId],
              }
            : b
        )
      );
    auth.role === "admin" ? mutate(setAllBlogs) : mutate(setMyBlogs);
    mutate(setLikedBlogs);

    try {
      await axios.post(liked ? "/unlikeBlog" : "/likeBlog", {
        blogId: blog._id,
        userId: auth.userId,
      });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Like failed" });
    }
  };

  const toggleSave = async (blog, saved) => {
    setSavedBlogs((prev) =>
      saved ? prev.filter((b) => b._id !== blog._id) : [...prev, blog]
    );
    try {
      await axios.post(saved ? "/unsaveBlog" : "/saveBlog", {
        blogId: blog._id,
        userId: auth.userId,
      });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Save failed" });
    }
  };

  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/categories");
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load categories");
    }
  };
  /* ---------------- CRUD ---------------- */
  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setBlogForm(emptyBlog);
    setEditMode(false);
    setShowBlog(true);
  };
  const openEdit = (b) => {
    setBlogForm(b);
    setEditMode(true);
    setShowBlog(true);
  };

  const renderCategoryField = () => (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>
        <Form.Select
          value={
            categories.includes(blogForm.category)
              ? blogForm.category
              : "__other__"
          }
          onChange={(e) => {
            const selected = e.target.value;
            if (selected === "__other__") {
              setBlogForm({ ...blogForm, category: "" }); // Clear it for text input
            } else {
              setBlogForm({ ...blogForm, category: selected });
            }
          }}
        >
          <option value="">👇Add or Select a category</option>
          {categories.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {!categories.includes(blogForm.category) && (
        <Form.Group className="mb-3">
          <Form.Label>Add New Category</Form.Label>
          <Form.Control
            type="text"
            value={blogForm.category}
            onChange={(e) =>
              setBlogForm({ ...blogForm, category: e.target.value })
            }
            placeholder="Enter a new category"
          />
        </Form.Group>
      )}
    </>
  );

  const submitBlog = async (e) => {
    e.preventDefault();

    try {
      if (editMode)
        await axios.put("/updateBlog", null, {
          params: { title: blogForm.title, ...blogForm },
        });
      else
        await axios.post("/createBlogs", { ...blogForm, author: auth.username });

      Swal.fire({
        icon: "success",
        title: editMode ? "Updated" : "Created",
        timer: 1200,
        showConfirmButton: false,
      });
      setShowBlog(false);
      window.location.reload();
    } catch (er) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: er.response?.data?.message || "Blog error",
      });
    }
  };

  const deleteBlog = async (title) => {
    if (!window.confirm("Delete blog?")) return;
    try {
      await axios.delete("/deleteBlog", { params: { title } });
      Swal.fire({
        icon: "success",
        title: "Deleted",
        timer: 1000,
        showConfirmButton: false,
      });
      window.location.reload();
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Delete failed" });
    }
  };

  /* ---------------- admin user ops ---------------- */
  const updateRole = async (uid, newRole) => {
    const adminPwd = prompt("Enter admin password to confirm:");
    if (!adminPwd) return;
    try {
      await axios.put("/admin/updateRole", {
        targetId: uid,
        newRole,
        adminEmail: auth.email,
        password: adminPwd,
      });
      setUsers((prev) =>
        prev.map((u) => (u._id === uid ? { ...u, role: newRole } : u))
      );
      Swal.fire({
        icon: "success",
        title: "Role updated",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Role update failed" });
    }
  };

  const confirmDelUser = async () => {
    Swal.fire({
      title: "Delete user?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
      background: "#1f1f1f",
      color: "#eee",
    }).then(async (result) => {
      if (!result.isConfirmed || !pwd) return;
      if (pwd.length < 6) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Password must be at least 6 characters",
        });
        return;
      }
      if (targetUser.email === auth.email) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Cannot delete self",
        });
        return;
      }
      await deleteUser();
    });
  };

  const deleteUser = async () => {
    try {
      await axios.delete("/admin/deleteUser", {
        data: {
          adminEmail: auth.email,
          targetEmail: targetUser.email,
          password: pwd,
        },
      });
      setUsers((prev) => prev.filter((u) => u._id !== targetUser._id));
      setShowDelU(false);
      setPwd("");
      Swal.fire({
        icon: "success",
        title: "User deleted",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Cannot delete user" });
    }
  };

  const deleteSelf = async () => {
    Swal.fire({
      title: "Delete account?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
      background: "#1f1f1f",
      color: "#eee",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
    });
    if (!selfCred.email || !selfCred.password) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Email and password required",
      });
      return;
    }
    try {
      await axios.delete("/deleteAccount", { data: selfCred });
      localStorage.clear();
      Swal.fire({
        icon: "success",
        title: "Account deleted",
        timer: 1200,
        showConfirmButton: false,
      });
      navigate("/login");
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Delete account failed",
      });
    }
  };

  /* ------------- helpers ------------- */
  const BlogCard = ({ blog, hideActions }) => {
    const liked = blog.likes?.includes(auth.userId);
    const saved = savedBlogs.some((b) => b._id === blog._id);
    const editable = auth.role === "admin" || blog.author === auth.username;
    const navigate = useNavigate();

    const openBlog = (blogId) => {
      navigate(`/BlogContent?blogId=${blogId}`);
    };

    return (
      <Col md={6} lg={4} className="mb-4">
        <div style={{ cursor: "pointer" }} onClick={() => openBlog(blog._id)}>
          <Card className="h-90 bg-white text-dark shadow-sm">
            <Card.Img
              variant="top"
              className="card-img-top"
              style={{ height: 200, objectFit: "cover" }}
              src={blog.imgUrl || "../assets/Blogify1.jpg"}
            />
            <Card.Body>
              <Card.Title>{blog.title.slice(0, 35)}</Card.Title>
              <p className="text-secondary">
                {blog.description?.slice(0, 120)}...
              </p>
              <Badge bg="secondary">{blog.category}</Badge>
              <div className="d-flex align-items-center mt-2">
                <span
                  style={{ cursor: "pointer", color: liked ? "red" : "#555" }}
                  className="me-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(blog, liked);
                  }}
                >
                  {liked ? <FaHeart /> : <FaRegHeart />}{" "}
                  {blog.likes?.length || 0}
                </span>
                <span className="me-3">
                  <FaRegComment /> {blog.comments?.length || 0}
                </span>
                {!hideActions && editable && (
                  <div className="ms-auto d-flex align-items-center">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(blog);
                      }}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBlog(blog.title);
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                )}
              </div>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between">
              <small>By {blog.author}</small>
              <Button
                size="sm"
                variant={saved ? "success" : "outline-primary"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSave(blog, saved);
                }}
              >
                <FaBookmark className="me-1" />
                {saved ? "Saved" : "Save"}
              </Button>
            </Card.Footer>
          </Card>
        </div>
      </Col>
    );
  };

  /* --- counts for My Blogs card --- */
  const myBlogCount =
    auth.role === "admin" ? stats.totalBlogs ?? 0 : profile.blogsCount ?? 0;

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" />
      </div>
    );

  return (
    <>
      <div>
        <Navbar />
      </div>

      <Container
        fluid
        style={{
          backgroundColor: "#011F5B",
          color: "#fff",
          minHeight: "100vh",
        }}
      >
        <Row className="flex-nowrap">
          {/* ---------------- SIDEBAR ---------------- */}
          <Col
            md={3}
            lg={2}
            className="bg-dark text-white p-3 vh-100 sticky-top d-none d-md-block"
            style={{ overflowY: "auto" }}
          >
            <div className="text-center mb-4">
              <div
                className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                style={{ width: 80, height: 80 }}
              >
                <FaUser size={30} />
              </div>
              <h5 className="mb-1">{profile.username}</h5>
              <small className="d-block">{profile.email}</small>
              <Badge
                bg={auth.role === "admin" ? "danger" : "primary"}
                className="mt-1"
              >
                {auth.role}
              </Badge>
            </div>

            <Tab.Container activeKey={active} onSelect={setActive}>
              <Nav variant="pills" className="flex-column gap-1">
                <Nav.Link
                  eventKey="overview"
                  className="d-flex align-items-center py-2"
                >
                  <FaHome className="me-3 text-white" />
                  Overview
                </Nav.Link>

                {auth.role === "admin" && (
                  <>
                    <Nav.Link
                      eventKey="admin"
                      className="d-flex align-items-center py-2"
                    >
                      <FaChartLine className="me-3 text-secondary" />
                      Admin Dashboard
                    </Nav.Link>
                    <Nav.Link
                      eventKey="users"
                      className="d-flex align-items-center py-2"
                    >
                      <FaUsers className="me-3" />
                      User Management
                    </Nav.Link>
                  </>
                )}

                <Nav.Link
                  eventKey="myblogs"
                  className="d-flex align-items-center py-2"
                >
                  <FaBlog className="me-3 text-info" />
                  My Blogs
                </Nav.Link>

                <Nav.Link
                  eventKey="liked"
                  className="d-flex align-items-center py-2"
                >
                  <FaHeart className="me-3 text-danger" />
                  Liked Blogs
                </Nav.Link>

                <Nav.Link
                  eventKey="saved"
                  className="d-flex align-items-center py-2"
                >
                  <FaBookmark className="me-3 text-success" />
                  Saved Blogs
                </Nav.Link>

                <div className="mt-3">
                  <Nav.Link
                    eventKey="settings"
                    className="d-flex align-items-center py-2"
                  >
                    <FaCog className="me-3 text-secondary" />
                    Account Settings
                  </Nav.Link>
                </div>
              </Nav>
            </Tab.Container>
          </Col>

          {/* Mobile Side Bar Code */}
          <Button
            variant="primary"
            className="d-md-none position-fixed rounded-circle shadow"
            style={{
              bottom: "20px",
              left: "20px",
              width: "56px",
              height: "56px",
              zIndex: 1040,
            }}
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          >
            {showMobileSidebar ? <FaTimes size={20} /> : <FaBars size={20} />}
          </Button>

          {showMobileSidebar && (
            <div
              className="d-md-none position-fixed top-0 start-0 vh-100 bg-dark bg-opacity-75"
              style={{ zIndex: 1050 }}
            >
              <Button
                variant="link"
                className="text-white position-absolute top-0 end-0 m-2"
                onClick={() => setShowMobileSidebar(false)}
              >
                <FaTimes />
              </Button>

              <div
                className="d-md-none position-fixed top-0 start-0 vh-100 bg-dark text-white p-4"
                style={{
                  width: "280px",
                  zIndex: 1050,
                  overflowY: "auto",
                  boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
                }}
              >
                {/* Close Button */}
                <div className="d-flex justify-content-end mb-4">
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="rounded-circle"
                    style={{ width: "32px", height: "32px" }}
                    onClick={() => setShowMobileSidebar(false)}
                  >
                    <FaTimes size={14} />
                  </Button>
                </div>

                <div className="text-center mb-4">
                  <div
                    className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                    style={{ width: 80, height: 80 }}
                  >
                    <FaUser size={30} />
                  </div>
                  <h5 className="mb-1">{profile.username}</h5>
                  <small className="d-block ">{profile.email}</small>
                  <Badge
                    bg={auth.role === "admin" ? "danger" : "primary"}
                    className="m-1 w-50 "
                  >
                    {auth.role}
                  </Badge>
                </div>

                <Tab.Container activeKey={active} onSelect={setActive}>
                  <Nav variant="pills" className="flex-column gap-1">
                    <Nav.Link
                      eventKey="overview"
                      className="d-flex align-items-center py-2"
                    >
                      <FaHome className="me-3" />
                      Overview
                    </Nav.Link>

                    {auth.role === "admin" && (
                      <>
                        <Nav.Link
                          eventKey="admin"
                          className="d-flex align-items-center py-2"
                        >
                          <FaChartLine className="me-3" />
                          Admin Dashboard
                        </Nav.Link>
                        <Nav.Link
                          eventKey="users"
                          className="d-flex align-items-center py-2"
                        >
                          <FaUsers className="me-3" />
                          User Management
                        </Nav.Link>
                      </>
                    )}

                    <Nav.Link
                      eventKey="myblogs"
                      className="d-flex align-items-center py-2"
                    >
                      <FaBlog className="me-3" />
                      My Blogs
                    </Nav.Link>

                    <Nav.Link
                      eventKey="liked"
                      className="d-flex align-items-center py-2"
                    >
                      <FaHeart className="me-3" />
                      Liked Blogs
                    </Nav.Link>

                    <Nav.Link
                      eventKey="saved"
                      className="d-flex align-items-center py-2"
                    >
                      <FaBookmark className="me-3" />
                      Saved Blogs
                    </Nav.Link>

                    <div className="">
                      <Nav.Link
                        eventKey="settings"
                        className="d-flex align-items-center py-2"
                      >
                        <FaCog className="me-3" />
                        Account Settings
                      </Nav.Link>
                    </div>
                  </Nav>
                </Tab.Container>
              </div>
            </div>
          )}
          {/* Mobile Side Bar Code ends here */}

          {/* ---------------- MAIN ---------------- */}
          <Col md={9} lg={10} className="p-4">
            <Tab.Container activeKey={active} onSelect={setActive}>
              <Tab.Content>
                {/* ===== OVERVIEW ===== */}
                <Tab.Pane eventKey="overview">
                  <h2 className="mb-4">Overview</h2>
                  <Row className="mb-4 g-3">
                    <Col md={4} sm={12} xs={12}>
                      <StatCard
                        color="info"
                        label="My Blogs"
                        icon={FaBlog}
                        value={myBlogCount}
                      />
                    </Col>
                    <Col md={4} sm={6} xs={6}>
                      <StatCard
                        color="success"
                        label="Saved"
                        icon={FaBookmark}
                        value={profile.savedBlogsCount}
                      />
                    </Col>
                    <Col md={4} sm={6} xs={6}>
                      <StatCard
                        color="warning"
                        label="Joined"
                        icon={FaUser}
                        value={fmt(profile.joinDate)}
                        small
                      />
                    </Col>
                  </Row>

                  <Card className="bg-white">
                    <Card.Header>
                      <h5>Recent Activity</h5>
                    </Card.Header>
                    <Card.Body>
                      {(auth.role === "admin" ? allBlogs : myBlogs).slice(0, 3)
                        .length ? (
                        <Row>
                          {(auth.role === "admin" ? allBlogs : myBlogs)
                            .slice(0, 3)
                            .map((b) => (
                              <BlogCard key={b._id} blog={b} />
                            ))}
                        </Row>
                      ) : (
                        <p className="text-secondary">No recent posts</p>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* ===== MY BLOGS ===== */}

                <Tab.Pane eventKey="myblogs">
                  <Col md={6} lg={4} sm={6} xs={8}>
                    <StatCard
                      color="info"
                      label="My Blogs"
                      icon={FaBlog}
                      value={myBlogCount}
                    />
                  </Col>
                  <Header onCreate={openCreate} search={[qMine, setQMine]} />

                  {myBlogs.filter((b) =>
                    b.title.toLowerCase().includes(qMine.toLowerCase())
                  ).length ? (
                    <Row className="g-4">
                      {myBlogs
                        .filter((b) =>
                          b.title.toLowerCase().includes(qMine.toLowerCase())
                        )
                        .map((b) => (
                          <Col xs={12} sm={6} md={12} lg={12} key={b._id}>
                            <BlogCard blog={b} />
                          </Col>
                        ))}
                    </Row>
                  ) : (
                    <Empty msg="No blogs yet" onCreate={openCreate} />
                  )}
                </Tab.Pane>

                {/* ===== LIKED ===== */}
                <Tab.Pane eventKey="liked">
                  <h2 className="mb-4">Liked Blogs</h2>
                  <Row className="mb-4">
                    <Col md={6} lg={4} sm={6} xs={8}>
                      <StatCard
                        color="danger"
                        label="Total Liked Value"
                        icon={FaBlog}
                        value={likedBlogs.length}
                      />
                    </Col>
                  </Row>
                  {likedBlogs.length ? (
                    <Row>
                      {likedBlogs.map((b) => (
                        <BlogCard key={b._id} blog={b} hideActions />
                      ))}
                    </Row>
                  ) : (
                    <Empty msg="You haven't liked any blog yet" />
                  )}
                </Tab.Pane>

                {/* ===== SAVED ===== */}
                <Tab.Pane eventKey="saved">
                  <h2 className="mb-4">Saved Blogs</h2>
                  <Row className="mb-4">
                    <Col md={6} lg={4} sm={6} xs={8}>
                      <StatCard
                        color="success"
                        label="Total Saved Blogs"
                        icon={FaBookmark}
                        value={savedBlogs.length}
                      />
                    </Col>
                  </Row>
                  {savedBlogs.length ? (
                    <Row>
                      {savedBlogs.map((b) => (
                        <BlogCard key={b._id} blog={b} hideActions />
                      ))}
                    </Row>
                  ) : (
                    <Empty msg="No saved blogs yet" />
                  )}
                </Tab.Pane>

                {/* ===== ADMIN DASHBOARD ===== */}
                {auth.role === "admin" && (
                  <Tab.Pane eventKey="admin">
                    <h2 className="mb-4">Admin Dashboard</h2>
                    <Row className="mb-4 g-3">
                      <Col md={4} xs={12} sm={12} lg={4}>
                        <StatCard
                          color="primary"
                          label="Users"
                          icon={FaUsers}
                          value={stats.totalUsers}
                        />
                      </Col>
                      <Col md={4} xs={12} sm={6} lg={4}>
                        <StatCard
                          color="info"
                          label="Blogs"
                          icon={FaBlog}
                          value={stats.totalBlogs}
                        />
                      </Col>
                      <Col xs={12} sm={6} md={4} lg={4}>
                        <StatCard
                          color="danger"
                          label="Top Likes"
                          icon={FaThumbsUp}
                          value={stats?.mostLikedBlogs?.[0]?.likes?.length || 0}
                        />
                      </Col>
                    </Row>
                    <Header title="All Blogs" search={[qAll, setQAll]} />
                    {allBlogs.filter((b) =>
                      b.title.toLowerCase().includes(qAll.toLowerCase())
                    ).length ? (
                      <Row>
                        {allBlogs
                          .filter((b) =>
                            b.title.toLowerCase().includes(qAll.toLowerCase())
                          )
                          .map((b) => (
                            <BlogCard key={b._id} blog={b} />
                          ))}
                      </Row>
                    ) : (
                      <Empty msg="No blogs found" />
                    )}
                  </Tab.Pane>
                )}

                {/* ===== USERS (Admin) ===== */}
                {auth.role === "admin" && (
                  <Tab.Pane eventKey="users">
                    <h2 className="mb-4">User Management</h2>
                    <Row className="mb-4">
                      <Col md={6} lg={4} sm={6} xs={8}>
                        <StatCard
                          color="primary"
                          label="Total Users"
                          icon={FaUsers}
                          value={stats.totalUsers}
                        />
                      </Col>
                    </Row>
                    <Card className="bg-white">
                      <Table striped hover responsive>
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr key={u._id}>
                              <td>{u.username}</td>
                              <td>{u.email}</td>
                              <td>
                                <Form.Select
                                  size="sm"
                                  value={u.role}
                                  style={{
                                    color:
                                      u.role === "admin"
                                        ? "#EF4E6E"
                                        : "#49A4FF",
                                    backgroundColor: "#f8f9fa",
                                    borderColor: "#dee2e6",
                                    fontWeight: "bold",
                                  }}
                                  onChange={(e) =>
                                    updateRole(u._id, e.target.value)
                                  }
                                >
                                  <option
                                    value="user"
                                    style={{
                                      color: "#49A4FF",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    user
                                  </option>
                                  <option
                                    value="admin"
                                    style={{
                                      color: "#EF4E6E",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    admin
                                  </option>
                                </Form.Select>
                              </td>
                              <td>{fmt(u.joinedAt)}</td>
                              <td>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  disabled={u._id === auth.userId}
                                  onClick={() => {
                                    setTargetUser(u);
                                    setPwd("");
                                    setShowDelU(true);
                                  }}
                                >
                                  <FaTrashAlt />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card>
                  </Tab.Pane>
                )}

                {/* ===== SETTINGS ===== */}
                <Tab.Pane eventKey="settings">
                  <h2 className="mb-4">Account Settings</h2>
                  <Card className="bg-white">
                    <Card.Body>
                      <Row className="mb-3">
                        <Col xs={6} sm={4} md={3}>
                          <b>Username</b>
                        </Col>
                        <Col xs={6} sm={8} md={9}>
                          {profile.username}
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col xs={5} sm={4} md={3}>
                          <b>Email</b>
                        </Col>
                        <Col xs={7} sm={8} md={9}>
                          {profile.email}
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col xs={6} sm={4} md={3}>
                          <b>Account Type</b>
                        </Col>
                        <Col xs={6} sm={8} md={9}>
                          <Badge
                            bg={auth.role === "admin" ? "danger" : "primary"}
                            className="px-3 py-2"
                          >
                            {auth.role.toUpperCase()}
                          </Badge>
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col xs={6} sm={4} md={3}>
                          <b>Member Since</b>
                        </Col>
                        <Col xs={6} sm={8} md={9}>
                          {fmt(profile.joinDate)}
                        </Col>
                      </Row>
                      <div className="d-flex justify-content-end mt-4">
                        <Button
                          variant="danger"
                          onClick={() => setDelSelf(true)}
                          className="px-4"
                        >
                          Delete Account
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Col>
        </Row>
      </Container>

      {/* ============ BLOG MODAL ============ */}
      <Modal show={showBlog} onHide={() => setShowBlog(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit" : "Create"} Blog</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitBlog}>
            {/* Title */}
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                required
                value={blogForm.title}
                // readOnly={editMode}
                onChange={(e) =>
                  setBlogForm({ ...blogForm, title: e.target.value })
                }
              />
            </Form.Group>

            {/* Image URL */}
            <Form.Group className="mb-1">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                value={blogForm.imgUrl}
                // readOnly={editMode}
                onChange={(e) =>
                  setBlogForm({ ...blogForm, imgUrl: e.target.value })
                }
              />
            </Form.Group>

            {renderCategoryField()}

            {/* Description */}
            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2.5}
                required
                value={blogForm.description}
                onChange={(e) =>
                  setBlogForm({ ...blogForm, description: e.target.value })
                }
              />
            </Form.Group>

            {/* Content */}
            <Form.Group className="mb-2">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                required
                value={blogForm.content}
                onChange={(e) =>
                  setBlogForm({ ...blogForm, content: e.target.value })
                }
              />
            </Form.Group>

            <Button className="w-100 bg-dark" type="submit" variant="primary">
              {editMode ? "Update" : "Create"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ===== DELETE USER (admin) ===== */}
      <Modal
        show={showDelU}
        onHide={() => {
          setShowDelU(false);
          setPwd("");
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-4">
            Are you sure you want to delete user <b>{targetUser?.username}</b>{" "}
            permanently?
          </p>
          <Form.Control
            type="password"
            placeholder="Enter your admin password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="mb-3"
          />
          <small className="text-muted">This action cannot be undone</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelU(false)}>
            Cancel
          </Button>
          <Button variant="danger" disabled={!pwd} onClick={confirmDelUser}>
            Confirm Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== DELETE SELF ===== */}
      <Modal show={delSelf} onHide={() => setDelSelf(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-danger mb-4">
            <strong>Warning:</strong> This will permanently delete your account
            and all associated data.
          </div>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={selfCred.email}
              onChange={(e) =>
                setSelfCred({ ...selfCred, email: e.target.value })
              }
              placeholder="Your email"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={selfCred.password}
              onChange={(e) =>
                setSelfCred({ ...selfCred, password: e.target.value })
              }
              placeholder="Your password"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDelSelf(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteSelf}>
            Delete My Account
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

/* -- helper UI components -- */
const StatCard = ({ color, label, icon: Icon, value, small }) => (
  <Card className={`text-light bg-${color} border-0 shadow`}>
    <Card.Body className="d-flex justify-content-between align-items-center">
      <div>
        <h6 className="mb-2">{label}</h6>
        {small ? (
          <h5 className="mb-0">{value}</h5>
        ) : (
          <h2 className="mb-0">{value}</h2>
        )}
      </div>
      <div className="bg-white bg-opacity-25 p-3 rounded-circle">
        <Icon size={24} />
      </div>
    </Card.Body>
  </Card>
);

const Empty = ({ msg, onCreate, icon }) => (
  <Card className="border-0 shadow-sm">
    <Card.Body className="text-center py-5">
      {icon && <div className="mb-3">{icon}</div>}
      <h4 className="text-muted mb-4">{msg}</h4>
      {onCreate && (
        <Button variant="primary" onClick={onCreate}>
          <FaPlus className="me-2" />
          Create One
        </Button>
      )}
    </Card.Body>
  </Card>
);

const Header = ({ title, onCreate, search: [val, setVal], count }) => (
  <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3">
    {/* Title & Count Section */}
    <div className="d-flex align-items-center flex-wrap gap-2 gap-md-3">
      <h2 className="mb-0">{title}</h2>
      {count !== undefined && (
        <Badge bg="primary" pill className="fs-6 py-2 px-3">
          {count}
        </Badge>
      )}
    </div>

    {/* Search & Button Section */}
    <div className="d-flex flex-column flex-sm-row align-items-stretch w-100 w-lg-auto gap-2 gap-sm-3 mt-2">
      {/* Search Input */}
      <div
        className="position-relative flex-grow-1"
        style={{ minWidth: "180px" }}
      >
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0 pe-1">
            <FaSearch className="text-secondary" />
          </span>
          <input
            className="form-control border-start-0 ps-1"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Search blogs..."
          />
        </div>
      </div>

      {/* Create Button - Only when onCreate provided */}
      {onCreate && (
        <Button
          variant="primary"
          onClick={onCreate}
          className="flex-shrink-0 py-2"
          style={{ minWidth: "120px" }}
        >
          <FaPlus className="me-1 me-sm-2" />
          <span className="d-none d-sm-inline">New Blog</span>
          <span className="d-sm-none">Add</span>
        </Button>
      )}
    </div>
  </div>
);
