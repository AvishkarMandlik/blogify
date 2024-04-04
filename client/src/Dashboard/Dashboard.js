import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./../components/Navbar/Navbar";
import { currentUser } from "../util/currentUser";
import { loginRequired } from "../util/loginRequired";
import BlogCardDashboard from "../components/BlogCard/BlogCardDashboard";

function Dashboard() {
  const [AllBlogs, setAllBlogsitems] = useState([]);

  useEffect(() => {
    loginRequired();
    if (currentUser.role === 'admin') {
      console.log('fetched all');
      fetchAllItem();
    } else {
      console.log('fetched user');
      fetchUserItems();
    }
  }, []);

  async function fetchAllItem() {
    const response = await axios.get("/allBlogs");
    console.log(response.data);
    setAllBlogsitems(response.data.data);
  }

  async function fetchUserItems() {
    const response = await axios.get(`/BlogsbyUsername?username=${currentUser.username}`);
    console.log(response.data);
    setAllBlogsitems(response.data.data);
  }

  return (
    <div>
      <Navbar user={currentUser?.username} />
      <div className="container-fluid" style={{ backgroundColor: "#e9ecef" }}>
        <div className="row">
          {AllBlogs.map((blogs) => {
            return (
              <div className="col-md-3">
                <BlogCardDashboard
                  title={blogs.title ? blogs.title?.slice(0, 45) : ""}
                  description={blogs.title ? blogs.description?.slice(0, 100) : ""}
                  imgUrl={blogs.imgUrl}
                  category={blogs.category}
                  author={blogs.author}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
