import type {Metadata} from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Voice Diary",
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className="h-full w-full">
        <body className="antialiased w-full h-full bg-gradient-to-b from-white to-gray-50">
            {children}
        </body>
        </html>
    );
}
