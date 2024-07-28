import React from 'react';

import { buttonVariants } from '@ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@ui/card';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

interface TeamProps {
  imageUrl: string;
  name: string;
  position: string;
  socialNetworks: SocialNetworksProps[];
}

interface SocialNetworksProps {
  name: string;
  url: string;
}

const teamList: TeamProps[] = [
  {
    imageUrl: 'https://i.pravatar.cc/150?img=15',
    name: 'Pam Beesly',
    position: 'Sales Manager',
    socialNetworks: [
      { name: 'Linkedin', url: 'http://linkedin.com' },
      {
        name: 'Facebook',
        url: 'https://www.facebook.com/',
      },
      {
        name: 'Instagram',
        url: 'https://www.instagram.com/',
      },
    ],
  },
  {
    imageUrl: 'https://i.pravatar.cc/150?img=69',
    name: 'Jim Halpert',
    position: 'Tech Lead Athlead',
    socialNetworks: [
      { name: 'Linkedin', url: 'http://linkedin.com' },
      {
        name: 'Facebook',
        url: 'https://www.facebook.com/',
      },
      {
        name: 'Instagram',
        url: 'https://www.instagram.com/',
      },
    ],
  },
  {
    imageUrl: 'https://i.pravatar.cc/150?img=22',
    name: 'Angela Martin',
    position: 'Grumpy Cat Woman',
    socialNetworks: [
      { name: 'Linkedin', url: 'http://linkedin.com' },

      {
        name: 'Instagram',
        url: 'https://www.instagram.com/',
      },
    ],
  },
  {
    imageUrl: 'https://i.pravatar.cc/150?img=11',
    name: 'Dwight Schrute',
    position: 'Assistant Regional Manager',
    socialNetworks: [
      { name: 'Linkedin', url: 'http://linkedin.com' },
      {
        name: 'Facebook',
        url: 'https://www.facebook.com/',
      },
    ],
  },
];

export const Team = () => {
  const socialIcon = (iconName: string) => {
    switch (iconName) {
      case 'Linkedin':
        return <Linkedin size='20' />;

      case 'Facebook':
        return <Facebook size='20' />;

      case 'Instagram':
        return <Instagram size='20' />;
    }
  };

  return (
    <section id='team' className='container py-24 sm:py-32'>
      <h2 className='text-3xl md:text-4xl font-bold'>
        Meet our{' '}
        <span className='bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text'>
          awesome{' '}
        </span>
        team
      </h2>

      <p className='mt-4 mb-10 text-xl text-muted-foreground'>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Veritatis dolor pariatur sit!
      </p>

      <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-10'>
        {teamList.map(({ imageUrl, name, position, socialNetworks }: TeamProps) => (
          <Card
            key={name}
            className='bg-muted/50 relative mt-8 flex flex-col justify-center items-center'
          >
            <CardHeader className='mt-8 flex justify-center items-center pb-2'>
              <img
                src={imageUrl}
                alt={`${name} ${position}`}
                className='absolute -top-12 rounded-full w-24 h-24 aspect-square object-cover'
              />
              <CardTitle className='text-center'>{name}</CardTitle>
              <CardDescription className='text-primary'>{position}</CardDescription>
            </CardHeader>

            <CardContent className='text-center pb-2'>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
            </CardContent>

            <CardFooter>
              {socialNetworks.map(({ name, url }: SocialNetworksProps) => (
                <div key={name}>
                  <a
                    rel='noreferrer noopener'
                    href={url}
                    target='_blank'
                    className={buttonVariants({
                      variant: 'ghost',
                      size: 'sm',
                    })}
                  >
                    <span className='sr-only'>{name} icon</span>
                    {socialIcon(name)}
                  </a>
                </div>
              ))}
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};
