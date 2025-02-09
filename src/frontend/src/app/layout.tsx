'use client';
import styles from "@/app/page.module.css";
import localFont from "next/font/local";
import "./globals.css";
import "@/components/navBar";
import { Authenticator, View, useTheme, Text, ThemeProvider,Label } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { usePathname } from "next/navigation";
import outputs from "@/../amplify_outputs.json";
import { Amplify } from "aws-amplify";

Amplify.configure(outputs, {
  ssr: true 
});


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const components = {
  Header() {
    const { tokens } = useTheme();
    return (
      <View textAlign="center" 
      padding={tokens.space.large}
      backgroundColor="rgba(0, 0, 0, 0.7)"
      >
        <Text
          fontSize="2rem" 
          fontWeight="bold"
          fontFamily="Roboto, sans-serif"
          color="white"
        >
          AI-Enhanced Security Testing Platform ☄️
        </Text>
        <Text
          fontSize="1rem" 
          fontWeight="bold"
          fontFamily="Roboto, sans-serif"
          color="white"
        >
        Login and Get your Customized DAST Report
        </Text>
      </View>
    );
  },
  Label (props: any) {
    return (
      <Label {...props} style={{ color: 'white' }} /> // Make labels white
    );
  }
}

const theme = {
  name: "login-theme",
  tokens: {
    colors: {
      background: {
        primary: "rgba(0, 0, 0, 0.7)", // Transparent black background
      },
      font: {
        primary: "white", // White text
        interactive: "white",
        hover: "white",
        active: "white",
      },
      inputs: {
        background: "white", // White background for input fields
        border: "1px solid #ddd", // Light border around fields
        text: "black", // Black text inside the input fields
      },
    border: {
        pressed: "white",
        focus: "white"
    }
    },
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isPublicPage = pathname === "/";
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
      {isPublicPage ? children : 
      <>
      <style jsx global>{`
        .amplify-label {
          color: white !important; /* Force label color to white */
        }
      `}</style>
       <ThemeProvider theme = {theme}>
      <Authenticator className={styles.background5} components = {components}>
        {children} 
      </Authenticator>
      </ThemeProvider>
      </>
      }
      </body>
    </html>
  );
}
