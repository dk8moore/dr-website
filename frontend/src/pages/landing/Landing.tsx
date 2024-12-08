import React from 'react';

import { About } from '@landing/About';
import { Cta } from '@landing/CTA';
import { FAQ } from '@landing/FAQ';
import { Features } from '@landing/Features';
import { Footer } from '@landing/Footer';
import { Hero } from '@landing/Hero';
import { HowItWorks } from '@landing/HowItWorks';
import { Navbar } from '@landing/Navbar';
import { Newsletter } from '@landing/Newsletter';
import { Pricing } from '@landing/Pricing';
import { ScrollToTop } from '@landing/ScrollToTop';
import { Services } from '@landing/Services';
import { Sponsors } from '@landing/Sponsors';
import { Team } from '@landing/Team';
import { Testimonials } from '@landing/Testimonials';
import '@style/landing.css';

function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Sponsors />
      <About />
      <HowItWorks />
      <Features />
      <Services />
      <Cta />
      <Testimonials />
      <Team />
      <Pricing />
      <Newsletter />
      <FAQ />
      <Footer />
      <ScrollToTop />
    </>
  );
}

export default LandingPage;
