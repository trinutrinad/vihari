import { Compass, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Compass className="text-2xl text-brand-orange" />
              <h4 className="text-xl font-bold">YatraHub</h4>
            </div>
            <p className="text-gray-400 text-sm" data-testid="text-footer-description">
              Your complete travel companion for exploring incredible India with ease and convenience.
            </p>
          </div>
          
          <div>
            <h5 className="font-semibold mb-4" data-testid="text-services-heading">Services</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-flight-booking">Flight Booking</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-hotel-reservations">Hotel Reservations</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-local-transport">Local Transport</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-sightseeing-tours">Sightseeing Tours</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-4" data-testid="text-support-heading">Support</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-help-center">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-contact-us">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-safety-guidelines">Safety Guidelines</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-travel-insurance">Travel Insurance</a></li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-4" data-testid="text-connect-heading">Connect</h5>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-facebook">
                <Facebook className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-twitter">
                <Twitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-instagram">
                <Instagram className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="link-youtube">
                <Youtube className="text-xl" />
              </a>
            </div>
            <p className="text-sm text-gray-400" data-testid="text-mobile-app">
              Download our mobile app for better experience
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p data-testid="text-copyright">
            &copy; 2024 YatraHub. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
}
