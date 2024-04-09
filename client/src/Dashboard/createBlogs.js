import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { currentUser } from '../util/currentUser';
import Navbar from '../components/Navbar/Navbar';
const CreateBlogs = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imgUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general'); // Default category

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await axios.post('/createBlogs', {
      title,
      imgUrl,
      description,
      category,
      content,
      author: currentUser.username,
    });
    
    if (response.data.success) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Blog added successfully!',
      }).then(() => {
        window.location.reload();
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: response.data.message,
      });
    }
    console.log(response.data);
  };

  return (
    <div>
      <Navbar user={currentUser?.username} />
      <br/>
      <br/>
    <div className="container">
      <h2>Create a new blog post</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title:</label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="category" className="form-label">Category:</label>
          <select
            className="form-select"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="general">General</option>
            <option value="science">Science</option>
            <option value="health">Health</option>
            <option value="technology">Technology</option>
            <option value="entertainment">Entertainment</option>
            <option value="business">Business</option>
            <option value="sport">Sport</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="imageUrl" className="form-label">Image URL:</label>
          <input
            type="text"
            className="form-control"
            id="imageUrl"
            value={imgUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description:</label>
          <input
            type="text"
            className="form-control"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
       
        <div className="mb-3">
          <label htmlFor="content" className="form-label">Content:</label>
          <textarea
            className="form-control"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary bg-dark">Submit</button>
      </form>
    </div>
    </div>

  );
};

export default CreateBlogs;
