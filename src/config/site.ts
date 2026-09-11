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
  commissions: {
    isOpen: true,
    statusLabel: 'OPEN',
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdlij7_gfc9gt1PeVf7we4nzIGEvwi5f6pdD3JWp8cpL_AlzA/viewform?usp=sharing&ouid=101127023819410763660',
    email: 'kyoronginus@gmail.com',
  },
  announcements: [
    'My new personal website!',
  ],
};
