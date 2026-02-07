import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
export function Footer() {
  return <footer className="bg-foreground border-t border-primary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-semibold text-gradient">{SITE_NAME}</h3>
            <p className="text-sm text-white/60">{SITE_TAGLINE}</p>
            <p className="text-sm text-white/60">
              Premium perfumes crafted for those who appreciate the finer things in life.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-sm text-white/60 hover:text-primary transition-colors">
                  All Perfumes
                </Link>
              </li>
              <li>
                <Link to="/products?category=For+Him" className="text-sm text-white/60 hover:text-primary transition-colors">
                  For Him
                </Link>
              </li>
              <li>
                <Link to="/products?category=For+Her" className="text-sm text-white/60 hover:text-primary transition-colors">
                  For Her
                </Link>
              </li>
              <li>
                <Link to="/products?category=Luxury" className="text-sm text-white/60 hover:text-primary transition-colors">
                  Luxury Collection
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium text-white">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-sm text-white/60 hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-white/60 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <span className="text-sm text-white/60">Shipping Info</span>
              </li>
              <li>
                <span className="text-sm text-white/60">Return Policy</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium text-white">Contact</h4>
            <ul className="space-y-2">
              <li className="text-sm text-white/60">Narayangonj, Araihazar, Dhaka</li>
              <li className="text-sm text-white/60">+880 1996640576</li>
              <li className="text-sm text-white/60">relievebdbrand@gmail.com</li>
            </ul>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-white/60 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary/20 text-center">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
}