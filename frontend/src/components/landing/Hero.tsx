import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@ui/button';
import { buttonVariants } from '@ui/button';
import { HeroCards } from '@common/hero-cards';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { LogIn } from 'lucide-react'; 

export const Hero = () => {
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            A{" "}
            <span className="inline bg-gradient-to-r from-[#F596D3]  to-[#D247BF] text-transparent bg-clip-text">
              boilerplate
            </span>
          </h1>{" "}
          for{" "}
          <h2 className="inline">
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
              SaaS
            </span>{" "}
            projects
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Build your SaaS project faster with this boilerplate, from landing page to the service behind it.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Link to="/login" className="w-full md:w-1/3">
            <Button className="w-full md:w-1/3">
              Get Started
              <LogIn className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          <a
            rel="noreferrer noopener"
            href="https://github.com/dk8moore/saas-boilerplate"
            target="_blank"
            className={`w-full md:w-1/3 ${buttonVariants({
              variant: "outline",
            })}`}
          >
            Github Repository
            <GitHubLogoIcon className="ml-2 w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Hero cards sections */}
      <div className="z-10">
        <HeroCards />
      </div>

      {/* Shadow effect */}
      <div className="shadow"></div>
    </section>
  );
};
