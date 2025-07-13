import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./../../components/Navbar/Navbar";
import { getUserProfile } from "../../util/getUserProfile";
import { loginRequired } from "../../util/loginRequired";
import BlogCardHome from "../../components/BlogCard/BlogCardHome";
import { FiFilter } from "react-icons/fi";

function Home() {
  const [searchText, setSearchText] = useState("");
  const [AllBlogs, setAllBlogsitems] = useState([]);
  // const userId = localStorage.getItem('userId');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  // console.log("user in Home:", user.username);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userProfile = await getUserProfile();
      setUser(userProfile);
    };
    fetchUserProfile();
  }, []);

  const fetchAllItem = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/allBlogs?userId=${user?.id}`
      );
      // headers: {
      //   Authorization: `Bearer ${localStorage.getItem("token")}`,
      // },

      let blogs = response.data.data;
      if (selectedCategory) {
        blogs = blogs.filter((blog) => blog.category === selectedCategory);
      }
      setAllBlogsitems(blogs);
    } catch (error) {
      console.error("Fetch all blogs failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecificItems = async () => {
    try {
      // const response = await axios.get(`http://localhost:5000/Blogsbytitle?title=${searchText}`);
      const trimmedText = searchText.trim();
      const response = await axios.get(
        `/Blogsbytitle?title=${trimmedText}`
      );
      setAllBlogsitems(response.data.data);
    } catch (error) {
      console.error("Fetch specific blogs failed:", error);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/categories");
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!user) return;
    if (searchText.trim()) {
      fetchSpecificItems();
    } else {
      fetchAllItem();
    }
  }, [searchText, user, selectedCategory]);

  useEffect(() => {
    loginRequired(); // Redirect if not logged in
  }, []);

  return (
    <div className="container-fluid" style={{backgroundColor: "#011F5B"}}>
      <Navbar user={user?.username} />

      <div className="row justify-content-center my-3 ">
        <div className="col-md-6 mb-3">
          <input
            type="text"
            placeholder="🔍 Type to Search Blogs"
            className="form-control border border-primary"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <div className="dropdown">
            <button
              className="btn d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
              type="button"
              id="categoryDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{
                background: "#007FFF",
                color: "white",
                border: "none",
                borderRadius: "30px",
                fontWeight: 500,
                fontSize: "14px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "0 6px 12px rgba(102, 16, 242, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 4px 8px rgba(0, 123, 255, 0.2)";
              }}
            >
              <i className="bi bi-funnel-fill me-1" /> <FiFilter size={18} />{" "}
              {selectedCategory || "Filter"}
            </button>
            <ul className="dropdown-menu" aria-labelledby="categoryDropdown">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setSelectedCategory("")}
                >
                  All Categories
                </button>
              </li>
              {categories.map((cat, i) => (
                <li key={i}>
                  <button
                    className="dropdown-item"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <div className="row">
          {Array.isArray(AllBlogs) && AllBlogs.length > 0 ? (
            AllBlogs.map((blog) => (
              <div className="col-md-3" key={blog._id}>
                <BlogCardHome
                  blogId={blog._id}
                  title={blog.title}
                  description={blog.description}
                  imgUrl={blog.imgUrl}
                  category={blog.category}
                  author={blog.author}
                  isLiked={blog.isLiked}
                  isSaved={blog.isSaved}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-5 text-muted">
              <h5>No blogs found.</h5>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
