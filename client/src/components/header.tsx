import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Compass, Menu, X } from "lucide-react";

interface HeaderProps {
  onOpenCurrencyConverter?: () => void;
}

export default function Header({ onOpenCurrencyConverter }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <Compass className="text-2xl text-brand-orange" />
            <h1 className="text-xl font-bold text-gray-900">Vihari</h1>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#destinations" className="text-gray-600 hover:text-brand-orange transition-colors" data-testid="link-destinations">
              Destinations
            </a>
            <a href="#services" className="text-gray-600 hover:text-brand-orange transition-colors" data-testid="link-services">
              Services
            </a>
            <a href="#about" className="text-gray-600 hover:text-brand-orange transition-colors" data-testid="link-about">
              About
            </a>
            <a href="#help" className="text-gray-600 hover:text-brand-orange transition-colors" data-testid="link-help">
              Help
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            {onOpenCurrencyConverter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenCurrencyConverter}
                className="hidden md:flex items-center space-x-1 text-gray-600 hover:text-brand-orange"
                data-testid="button-open-currency-converter"
              >
                <ArrowRightLeft className="h-4 w-4" />
                <span>₹ Currency</span>
              </Button>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {user?.firstName && (
                  <span className="text-sm text-gray-600" data-testid="text-user-name">
                    Hi, {user.firstName}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  data-testid="button-logout"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/api/login'}
                  className="text-brand-blue hover:text-blue-700"
                  data-testid="button-login"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-brand-orange text-white hover:bg-orange-600"
                  data-testid="button-signup"
                >
                  Sign Up
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200" data-testid="mobile-menu">
            <nav className="flex flex-col space-y-4">
              <a href="#destinations" className="text-gray-600 hover:text-brand-orange transition-colors">
                Destinations
              </a>
              <a href="#services" className="text-gray-600 hover:text-brand-orange transition-colors">
                Services
              </a>
              <a href="#about" className="text-gray-600 hover:text-brand-orange transition-colors">
                About
              </a>
              <a href="#help" className="text-gray-600 hover:text-brand-orange transition-colors">
                Help
              </a>
              {onOpenCurrencyConverter && (
                <Button
                  variant="ghost"
                  onClick={onOpenCurrencyConverter}
                  className="justify-start text-gray-600 hover:text-brand-orange"
                >
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Currency Converter
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
