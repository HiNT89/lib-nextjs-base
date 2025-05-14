"use client";
// Best practice: Organize imports systematically
// External libraries
import { ConfigProvider } from "antd";
import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import clsx from "clsx";

// Styles
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import "@/assets/styles/index.scss";

// Internal imports
import { THEME_ANTD } from "@/common/theme";
import Loading from "./loading";
import { usePathname } from "next/navigation";

// Separate concerns: Create a configuration file for query client

// Extract metadata configuration for better maintainability
const SITE_METADATA = {
  title: "app",
  description: "app",
  url: "https://example.com/",
  thumbnail: "/public/thumbnail_logo.png",
  googleVerification: "7983Dn6Y9s_mwuD2rjNy_CX8CE4DiQzXTl_n_w60rCk",
};

// Improved: Separate component with clear responsibilities and type safety
const AppWrapper: React.FC<React.PropsWithChildren & { pathname: string }> = ({
  children,
  pathname,
}) => (
  <main>
    {children}
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  </main>
);

// Use a separate function to generate metadata for better readability
const generateMetaTags = (metadata: typeof SITE_METADATA) => (
  <>
    <title>{metadata.title}</title>
    <meta name="description" content={metadata.description} />
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1,shrink-to-fit=no,maximum-scale=1"
    />
    <link rel="icon" href="/src/app/favicon.ico" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap"
      rel="stylesheet"
    />
    {/* Open Graph / Social Media Meta Tags */}
    <meta property="og:type" content="website" />
    <meta property="og:url" content={metadata.url} />
    <meta property="og:title" content={metadata.title} />
    <meta property="og:description" content={metadata.description} />
    <meta property="og:image" content={metadata.thumbnail} />

    {/* Zalo Meta Tags */}
    <meta property="zalo:site_name" content="BaSao" />
    <meta property="zalo:description" content={metadata.description} />
    <meta property="zalo:image" content={metadata.thumbnail} />

    {/* Google Search Console Verification */}
    <meta
      name="google-site-verification"
      content={metadata.googleVerification}
    />
  </>
);

//
const PAGE_ACTIVE_SCROLLERS = [
  "/",
  "/tin-dang/tin-noi-bat",
  "/tin-dang/tin-moi",
];

// Main layout with improved type safety and readability
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Create query client with extracted configuration
  const pa = usePathname();
  return (
    <html lang="en">
      <head>{generateMetaTags(SITE_METADATA)}</head>
      <body className={clsx("relative bg-[#FAFAFA]")}>
        <ConfigProvider theme={THEME_ANTD}>
          <Suspense fallback={<Loading />}>
            <AppWrapper pathname={pa.split("/")[1]}>{children}</AppWrapper>
          </Suspense>
        </ConfigProvider>
      </body>
    </html>
  );
}
