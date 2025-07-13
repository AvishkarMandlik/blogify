import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../util/getUserProfile';
import {
  FaHome,
  FaBlog,
  FaThList,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaBookmark,
  FaHeart,
  FaChartLine,
  FaInfoCircle
} from 'react-icons/fa';
import { Navbar as BootstrapNavbar, Container, Nav, Dropdown, Image } from 'react-bootstrap';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const profile = await getUserProfile();
      if (profile) setUser(profile);
    })();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <BootstrapNavbar
      bg="dark"
      expand="lg"
      variant="dark"
      className="shadow-sm sticky-top px-3"
      sticky="top"
    >
      <Container fluid>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold fs-3">
          <span className="text-info">Blog</span>ify
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle
          aria-controls="responsive-navbar-nav"
          className="border-0"
        />

        <BootstrapNavbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="d-flex align-items-center text-white">
              <FaHome className="me-2 text-primary" /> Home
            </Nav.Link>

            <Nav.Link as={Link} to="/home" className="d-flex align-items-center text-white">
              <FaInfoCircle className="me-2 text-primary" /> About
            </Nav.Link>

            <Nav.Link as={Link} to="/dashboard" className="d-flex align-items-center text-white">
              <FaThList className="me-2 text-primary" /> Dashboard
            </Nav.Link>
          </Nav>

          {user && (
            <Dropdown className="ms-2">
              <Dropdown.Toggle variant="light" className="d-flex align-items-center border-0">
                <div className="me-2 text-end d-none d-sm-none d-md-block text-gray">
                  <div className="fw-semibold">{user.username}</div>
                  <div className="text-gray small">{user.email}</div>
                </div>
                <Image
                  src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                  roundedCircle
                  width={40}
                  height={40}
                  className="border border-2 border-light"
                />
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow dropdown-menu-lg-end dropdown-menu-md-start">
                <Dropdown.Header>My Account</Dropdown.Header>
                <Dropdown.Item as={Link} to="/dashboard">
                  <FaUserCircle className="me-2" /> Profile
                </Dropdown.Item>
                {user.role === 'admin' && (
                  <>
                    <Dropdown.Item as={Link} to="/dashboard?tab=admin">
                      <FaChartLine className="me-2" /> Admin Panel
                    </Dropdown.Item>
                  </>
                )}
                <Dropdown.Item as={Link} to="/dashboard?tab=blogs">
                  <FaBlog className="me-2 text-info" /> My Blogs
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/dashboard?tab=saved">
                  <FaBookmark className="me-2 text-success" /> Saved Blogs
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/dashboard?tab=liked">
                  <FaHeart className="me-2 text-danger" /> Liked Blogs
                </Dropdown.Item>



                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/dashboard?tab=settings">
                  <FaCog className="me-2 text-secondary" /> Settings
                </Dropdown.Item>
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <FaSignOutAlt className="me-2" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
