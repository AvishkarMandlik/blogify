import React from 'react';
import { Link } from 'react-router-dom';

function BlogCardHome({title, imgUrl, description, category, author}) {
  return (
    <div className='my-3'>
      <Link to={{ pathname: "/BlogContent", search: `?title=${encodeURIComponent(title)}` }} style={{ textDecoration: 'none' }}>
        <div className="card shadow-sm bg-body rounded" style={{cursor: "pointer"}}>
          <span className="position-absolute top-0 translate-middle badge rounded-pill bg-secondary" style={{left:"90%", zIndex:"1"}}>{author}</span>
          <img src={!imgUrl ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSj1cbtHrCxTGHJ4la-6fBeY670i0Drg92lUg&usqp=CAU" : imgUrl} className="card-img-top" style={{height: "17rem"}} alt="..." />
          <div className="card-body">
            <h5 className="card-title">{title}</h5>
            <p className="card-text">{description}</p>
            <span>{category}</span>
            {/* <p className="card-text"><small className="text-muted">By {!author?"Unknown":author} on {new Date().toGMTString()}</small></p> */}
          </div>
        </div>
      </Link>
    </div>
  )
}

export default BlogCardHome;
