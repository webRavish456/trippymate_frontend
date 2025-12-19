'use client';

import React from 'react';
import { Grid } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Footer() {


const router=useRouter()

  const handleClick=()=>
  {
     router.push("/")
  }

  return (
    <footer className="footer">
      <div className="footer-main">
        <Grid container spacing={{xs: 2, sm: 4, md: 6}} className="footer-container">
          {/* Column 1: TrippyMates */}
          <Grid size={{xs: 12, sm: 6, md: 3}}>
              <div className='footer-logo-container' onClick={handleClick}> 
              <img src="/logo.png" alt="Logo" className="footer-logo" />
              </div>
            <p className="footer-description">
              Discover, plan, and travel with confidence alongside like-minded travelers. Get 24/7 assistance, curated adventures, and seamless end-to-end trip management.
            </p>
          </Grid>

          {/* Column 2: Quick Links */}
          <Grid size={{xs: 12, sm: 6, md: 2}}>
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">About Us</a></li>
              <li><a href="#" className="footer-link">Destinations</a></li>
              <li><a href="#" className="footer-link">Community Trips</a></li>
              <li><a href="#" className="footer-link">Blog</a></li>
              <li><a href="#" className="footer-link">Gallery</a></li>
              <li><a href="#" className="footer-link">Careers</a></li>
              <li><a href="#" className="footer-link">Contact Us</a></li>
            </ul>
          </Grid>

          {/* Column 3: Destinations */}
          <Grid size={{xs: 12, sm: 6, md: 2}}>
            <h3 className="footer-heading">Destinations</h3>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Himachal Pradesh</a></li>
              <li><a href="#" className="footer-link">Uttarakhand</a></li>
              <li><a href="#" className="footer-link">Rajasthan</a></li>
              <li><a href="#" className="footer-link">Leh & Ladakh</a></li>
              <li><a href="#" className="footer-link">Goa</a></li>
              <li><a href="#" className="footer-link">Kerala</a></li>
            </ul>
          </Grid>

          {/* Column 4: Visit Our Office */}
          <Grid size={{xs: 12, sm: 6, md: 2.5}}>
            <h3 className="footer-heading">Visit Our Office</h3>
            <div className="footer-contact-item">
              <span className="footer-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                </svg>
              </span>
              <span className="footer-location-name">Trippy Mates HQ</span>
            </div>
            <p className="footer-address">
              63 LGF, World Trade Centre, Barakhamba, New Delhi 110001
            </p>
            <p className="footer-hours">
              Mon-Sat: 10:00 AM - 7:00 PM IST
            </p>
          </Grid>

          {/* Column 5: Contact Us */}
          <Grid size={{xs: 12, sm: 6, md: 2.5}}>
            <h3 className="footer-heading">Contact Us</h3>
            <div className="footer-contact-item">
              <span className="footer-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" fill="currentColor"/>
                </svg>
              </span>
              <span className="footer-contact-text">+91 98765 43210</span>
            </div>
            <div className="footer-contact-item">
              <span className="footer-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                </svg>
              </span>
              <span className="footer-contact-text">hello@trippymates.com</span>
            </div>

            {/* Follow Us Section */}
            <h3 className="footer-heading footer-heading-spacing">Follow Us</h3>
            <div className="footer-social">
              <a href="#" className="footer-social-icon footer-social-facebook" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 16.84 5.44 20.87 10 21.8V15H8V12H10V9.5C10 7.57 11.57 6 13.5 6H16V9H14C13.45 9 13 9.45 13 10V12H16V15H13V21.95C18.54 21.35 23 17.19 23 12C23 6.48 18.52 2 12 2Z" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" className="footer-social-icon footer-social-instagram" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" className="footer-social-icon footer-social-youtube" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 15L15.19 12L10 9V15ZM21.56 7.17C21.69 7.64 21.78 8.27 21.84 9.07C21.91 9.87 21.94 10.56 21.94 11.16L22 12C22 14.19 21.84 15.8 21.56 16.83C21.31 17.73 20.73 18.31 19.83 18.56C19.36 18.69 18.5 18.78 17.18 18.84C15.88 18.91 14.69 18.94 13.59 18.94L12 19C7.81 19 5.2 18.84 4.17 18.56C3.27 18.31 2.69 17.73 2.44 16.83C2.31 16.36 2.22 15.73 2.16 14.93C2.09 14.13 2.06 13.44 2.06 12.84L2 12C2 9.81 2.16 8.2 2.44 7.17C2.69 6.27 3.27 5.69 4.17 5.44C4.64 5.31 5.5 5.22 6.82 5.16C8.12 5.09 9.31 5.06 10.41 5.06L12 5C16.19 5 18.8 5.16 19.83 5.44C20.73 5.69 21.31 6.27 21.56 7.17Z" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </Grid>
        </Grid>
      </div>

      {/* Copyright Bar */}
      <div className="footer-copyright">
        <p>© {new Date().getFullYear()} TrippyMates. All rights reserved.</p>
      </div>
    </footer>
  );
}

