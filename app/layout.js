import "./globals.css";
import AuthProvider from "./providers/AuthProvider";

export const metadata = {
  title: "Pride Born Ventures — Find leads. Contact them. Close deals.",
  description:
    "The all-in-one lead intelligence and outreach platform. Build targeted audiences, identify website visitors, run email + SMS campaigns, and close deals — powered by AudienceLab.",
  keywords: [
    "lead generation",
    "audience builder",
    "website visitor tracking",
    "pixel tracking",
    "SMS marketing",
    "email marketing",
    "CRM",
    "AudienceLab",
    "home services leads",
    "med spa marketing",
    "personal injury leads",
    "insurance leads",
  ],
  authors: [{ name: "Pride Born Ventures" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://prideborn.io"),
  openGraph: {
    title: "Pride Born Ventures — Lead intelligence, outreach, and CRM in one",
    description:
      "Build audiences, identify visitors, run campaigns, track deals. Get your first leads on day one.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pride Born Ventures",
    description: "Lead intelligence, outreach, and CRM in one.",
  },
};

export const viewport = {
  themeColor: "#060B14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,800,900&f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
