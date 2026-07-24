import { Outlet, Link } from 'react-router';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';
import { Mail, Phone } from 'lucide-react';
import { Navbar } from '@/components/navigation/Navbar';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-secondary text-secondary-foreground">
        <div className="container grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="text-h6 font-bold">PropertyFlow</span>
            <p className="mt-2 text-small opacity-80">
              Modern property management for landlords and tenants across Nigeria.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://facebook.com/propertyflow"
                aria-label="Facebook"
                className="opacity-80 hover:opacity-100"
              >
                <FaFacebookF className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/propertyflow"
                aria-label="Instagram"
                className="opacity-80 hover:opacity-100"
              >
                <FaInstagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/propertyflow"
                aria-label="Twitter"
                className="opacity-80 hover:opacity-100"
              >
                <FaTwitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-small font-semibold uppercase tracking-wide opacity-70">Company</h3>
            <ul className="mt-3 flex flex-col gap-2 text-small">
              <li>
                <Link to="/guide" className="opacity-90 hover:opacity-100">
                  User Guide
                </Link>
              </li>
              <li>
                <Link to="/about" className="opacity-90 hover:opacity-100">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/properties" className="opacity-90 hover:opacity-100">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link to="/contact" className="opacity-90 hover:opacity-100">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="opacity-90 hover:opacity-100">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-small font-semibold uppercase tracking-wide opacity-70">Legal</h3>
            <ul className="mt-3 flex flex-col gap-2 text-small">
              <li>
                <Link to="/privacy-policy" className="opacity-90 hover:opacity-100">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="opacity-90 hover:opacity-100">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-small font-semibold uppercase tracking-wide opacity-70">
              Get in Touch
            </h3>
            <ul className="mt-3 flex flex-col gap-2 text-small">
              <li className="flex items-center gap-2 opacity-90">
                <Mail className="h-3.5 w-3.5" /> support@propertyflow.com
              </li>
              <li className="flex items-center gap-2 opacity-90">
                <Phone className="h-3.5 w-3.5" /> +234 813 146 5903
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-6 text-center text-caption opacity-70">
          © {new Date().getFullYear()} PropertyFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
