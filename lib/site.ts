/** Site-wide settings. Override with environment variables at build time (see .env.example). */
export const SITE = {
  name: 'ZipperLock',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://zipperlock.net').replace(/\/$/, ''),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@zipperlock.net',
  gaId: process.env.NEXT_PUBLIC_GA_ID || '',
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '',
  gscVerification: process.env.NEXT_PUBLIC_GSC_VERIFICATION || '',
  /** set to "1" when public/contact.php is deployed on PHP hosting */
  phpContact: process.env.NEXT_PUBLIC_PHP_CONTACT === '1',
};
