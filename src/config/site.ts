import commissionsData from '../data/commissions.json';

export interface SiteConfig {
  commissions: {
    isOpen: boolean;
    statusLabel: string;
    formUrl: string;
    email: string;
  };
  announcements: string[];
}

export const siteConfig: SiteConfig = {
  commissions: commissionsData,
  announcements: [
    'My new personal website!',
  ],
};
