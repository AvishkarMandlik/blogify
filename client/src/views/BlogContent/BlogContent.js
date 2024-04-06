import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { currentUser } from '../../util/currentUser';

function BlogContent() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const title = queryParams.get('title');
    const [blog, setBlog] = useState(null);

    useEffect(() => {
        async function fetchBlog() {
            try {
                const resp = await axios.post('/BlogContent', { title });
                setBlog(resp.data);
            } catch (error) {
                console.error('Error fetching blog:', error);
            }
        }
        fetchBlog();
    }, [title]);

    if (!blog) {
        return <div className="container">Loading...</div>;
    }

    return (
        <div className="container">
            <Navbar user={currentUser?.username} />
            <div className="mt-5">
                <h1 className="display-4">{blog.title}</h1>
                <p className="lead">{blog.description}</p>
                <p className="fw-bold">Author: {blog.author}</p>
                <hr className="my-4" />
                <p className="text-break">{blog.content}</p>
            </div>
        </div>
    );
}

export default BlogContent;
