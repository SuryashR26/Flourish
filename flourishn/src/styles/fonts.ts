import { Figtree, Cinzel, IBM_Plex_Mono } from 'next/font/google';

export const figtree = Figtree({ subsets: ['latin'] });

// Used only on the LifeOrbit product page/section — its own brand identity,
// distinct from the rest of the Flourish site which stays on Figtree.
export const cinzel = Cinzel({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-cinzel' });
export const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-plex-mono' });
