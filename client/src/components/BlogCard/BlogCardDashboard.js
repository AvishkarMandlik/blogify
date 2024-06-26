import React from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function BlogCardDashboard({title,imgUrl,description,category,author}) {
      async function dltblog(){
            const response = await axios.delete("/deleteBlog?title="+title);

            Swal.fire({
              title: "Are you sure?",
              text: "You should delete this blog",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, delete it!"
            }).then((resp) => {
              if (resp.isConfirmed) {
                Swal.fire({
                  title: "Deleted!",
                  text: response.data.message,
                  icon: "success"
                });
                window.location.reload();
              }
            });
      }
  return (
        <div className='my-3'>
         <div className="card shadow-sm bg-body rounded">
              <span className="position-absolute top-0 translate-middle badge rounded-pill bg-secondary" style={{left:"90%", zIndex:"1"}}>{author}</span>
              <img src={!imgUrl?"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSj1cbtHrCxTGHJ4la-6fBeY670i0Drg92lUg&usqp=CAU":imgUrl} className="card-img-top" style={{height: "17rem"}} alt="..." />
              <div className="card-body">
                  <h5 className="card-title">{title}</h5>
                  <p className="card-text">{description}</p>
            <span>{category}</span>
            <button type="button" className='logout btn btn-primary bg-dark' onClick={dltblog}>Delete</button>
            {/* <p className="card-text"><small className="text-muted">By {!author?"Unknown":author} on {new Date().toGMTString()}</small></p> */}
            </div>
        </div>
        </div>
  )
}

export default BlogCardDashboard
