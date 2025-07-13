import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../../util/api";

export default function CreateBlogModal({ show, onHide, onSuccess, author, editMode = false, blogData = {} }) {
  const emptyBlog = { title: "", imgUrl: "", description: "", category: "", content: "" };
  const [blogForm, setBlogForm] = useState(editMode ? blogData : emptyBlog);
  const [categories, setCategories] = useState([]);
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false); 

useEffect(() => {
  if (show) {
    setBlogForm(editMode ? blogData : emptyBlog);
    setShowCustomCategoryInput(false);
  }
}, [show]); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        if (res.data.success) setCategories(res.data.data);
      } catch {
        console.error("Category fetch failed");
      }
    };
    fetchCategories();
  }, []);

  const submitBlog = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put("/updateBlog", null, {
          params: { title: blogForm.title, ...blogForm }
        });
      } else {
        await api.post("/createBlogs", { ...blogForm, author });
      }
      onSuccess();
      onHide();
    } catch (er) {
      alert(er.response?.data?.message || "Blog submission failed.");
    }
  };

  const renderCategoryField = () => (
    <>
      <Form.Group className="mb-2">
        <Form.Label>Category</Form.Label>
        <Form.Select
        value={categories.includes(blogForm.category) ? blogForm.category : "__other__"}
          onChange={(e) => {
            const selected = e.target.value;
            if (selected === "__other__") {
              setBlogForm({ ...blogForm, category: "" }); // Clear it for text input
            } else {
              setBlogForm({ ...blogForm, category: selected });
            }
          }}
          
        >
          <option value="" >👇Add or Select a category</option>
          {categories.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </Form.Select>
      </Form.Group>
  
      {!categories.includes(blogForm.category) && (
        <Form.Group className="mb-2">
          <Form.Label>Add New Category</Form.Label>
          <Form.Control
            type="text"
            value={blogForm.category}
            onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
            placeholder="Enter a new category"
            required
          />
        </Form.Group>
      )}
    </>
  );

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? "Edit Your" : "Create Your"} Blog</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={submitBlog}>
          <Form.Group className="mb-2">
            <Form.Label>Title</Form.Label>
            <Form.Control
              required
              value={blogForm.title}
              readOnly={editMode}
              onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              value={blogForm.imgUrl}
              onChange={(e) => setBlogForm({ ...blogForm, imgUrl: e.target.value })}
            />
          </Form.Group>

          {renderCategoryField()}

          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              value={blogForm.description}
              onChange={(e) => setBlogForm({ ...blogForm, description: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={blogForm.content}
              onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
              required
            />
          </Form.Group>

          <Button className="w-100 bg-dark" type="submit">{editMode ? "Update" : "Create"}</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
