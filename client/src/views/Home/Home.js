import React, { useState, useEffect } from "react";
import axios from "axios";

import Navbar from "./../../components/Navbar/Navbar";
import { currentUser } from "../../util/currentUser";
import { loginRequired } from "../../util/loginRequired";
import BlogCardHome from "../../components/BlogCard/BlogCardHome";

function Home() {
  const [searchText, setSearchText] = useState("");
  const [AllBlogs, setAllBlogsitems] = useState([]);

  async function fetchAllItem() {
    const response = await axios.get("/allBlogs");
    console.log(response.data);
    setAllBlogsitems(response.data.data);
  }

  async function fetchSpecificItems() {
    const response = await axios.get(`/Blogsbytitle?title=${searchText}`);
    console.log(response.data);
    setAllBlogsitems(response.data.data);
  }

  useEffect(() => {
    if (searchText.length > 0) {
      fetchSpecificItems();
    } else {
      fetchAllItem();
    }
  }, [searchText]);

  useEffect(() => {
    loginRequired();
  }, []);

  return (
    <div>
      <Navbar user={currentUser?.username} />
      <div className="container">
        <div className="row justify-content-center">
          <div className="p-3 ">
            <input
              type="text"
              placeholder="Type to search Blogs"
              className="form-control "
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="container-fluid" style={{ backgroundColor: "#e9ecef" }}>
        <div className="row">
          {Array.isArray(AllBlogs) && AllBlogs.map((blogs) => {
            return (
              <div className="col-md-3 ">
                <BlogCardHome
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

export default Home;
