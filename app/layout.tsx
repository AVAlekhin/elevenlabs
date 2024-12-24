import type {Metadata} from "next";
import Script from 'next/script';
import "./globals.css";

export const metadata: Metadata = {
    title: "Voice Diary",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <head>
                <Script
                    src="https://telegram.org/js/telegram-web-app.js"
                    strategy="beforeInteractive"
                />
            </head>
            <body className="antialiased bg-gradient-to-b from-gray-50 to-white">
                {children}
            </body>
        </html>
    );
}
