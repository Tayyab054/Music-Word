import "../styles/footer.css";
import { FaInstagram, FaTwitter, FaFacebookF } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <img
          className="logo"
          src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
          alt="Spotify"
        />

        <div className="links">
          <div>
            <h4>Company</h4>
            <a>About</a>
            <a>Jobs</a>
            <a>For the Record</a>
          </div>

          <div>
            <h4>Communities</h4>
            <a>For Artists</a>
            <a>Developers</a>
            <a>Advertising</a>
            <a>Investors</a>
            <a>Vendors</a>
          </div>

          <div>
            <h4>Useful Links</h4>
            <a>Support</a>
            <a>Web Player</a>
            <a>Free Mobile App</a>
          </div>

          <div>
            <h4>Spotify Plans</h4>
            <a>Premium Individual</a>
            <a>Premium Duo</a>
            <a>Premium Family</a>
            <a>Premium Student</a>
            <a>Spotify Free</a>
          </div>
        </div>

        <div className="social">
          <a aria-label="Instagram">
            <FaInstagram />
          </a>
          <a aria-label="Twitter">
            <FaTwitter />
          </a>
          <a aria-label="Facebook">
            <FaFacebookF />
          </a>
        </div>
      </div>

      <div className="bottom">
        <span>Pakistan (English)</span>
      </div>
    </footer>
  );
}
