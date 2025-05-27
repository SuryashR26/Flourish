import Link from "next/link"
import { FaFacebookF, FaInstagram } from "react-icons/fa"

export default function Footer() {
    return (
        <footer className="bg-black py-8 px-4 text-white font-['Figtree']">
            <div className="max-w-6xl mx-0 flex justify-between items-start flex-wrap">
                <div className="flex-1 min-w-[200px]">
                    <h1 className="m-0 text-4xl flex items-center">
                        Flourish <i className="fa-solid fa-lightbulb ml-2"></i>
                    </h1>
                    <div className="flex gap-12 my-4">
                        <Link href="/" className="text-[#1877F2] hover:opacity-80">
                            <FaFacebookF />
                        </Link>
                        <Link href="/about" className="text-[#E4405F] hover:opacity-80">
                            <FaInstagram />
                        </Link>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                        The Idea Board is a platform where you can share your ideas and get feedback from others. Join us today and
                        start sharing your ideas!
                    </p>
                </div>

                <div className="flex-[2] min-w-[600px] flex justify-around flex-wrap">
                    <div className="m-4 min-w-[150px]">
                        <h2 className="text-lg font-bold mb-3 text-white">About us</h2>
                        <ul className="list-none p-0 m-0">
                            <li className="my-4">
                                <Link href="/?carousel=true" className="text-gray-300 no-underline hover:underline">
                                    How it works
                                </Link>
                            </li>
                            <li className="my-4">
                                <Link href="/about" className="text-gray-300 no-underline hover:underline">
                                    Who we are
                                </Link>
                            </li>
                            <li className="my-4">
                                <Link href="/post" className="text-gray-300 no-underline hover:underline">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="m-4 min-w-[150px]">
                        <h2 className="text-lg font-bold mb-3 text-white">Quick Links</h2>
                        <ul className="list-none p-0 m-0">
                            <li className="my-4">
                                <Link href="/" className="text-gray-300 no-underline hover:underline">
                                    Home
                                </Link>
                            </li>
                            <li className="my-4">
                                <Link href="/post" className="text-gray-300 no-underline hover:underline">
                                    Post
                                </Link>
                            </li>
                            <li className="my-4">
                                <Link href="/search" className="text-gray-300 no-underline hover:underline">
                                    Search
                                </Link>
                            </li>
                            <li className="my-4">
                                <Link href="/login" className="text-gray-300 no-underline hover:underline">
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="m-4 min-w-[150px]">
                        <h2 className="text-lg font-bold mb-3 text-white">Contact Us</h2>
                        <ul className="list-none p-0 m-0">
                            <li className="my-4">
                                <Link href="/" className="text-gray-300 no-underline hover:underline">
                                    Home
                                </Link>
                            </li>
                            <li className="my-4">
                                <Link href="/post" className="text-gray-300 no-underline hover:underline">
                                    Post
                                </Link>
                            </li>
                            <li className="my-4">
                                <Link href="/search" className="text-gray-300 no-underline hover:underline">
                                    Search
                                </Link>
                            </li>
                            <li className="my-4">
                                <Link href="/login" className="text-gray-300 no-underline hover:underline">
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <hr className="border-none border-t border-gray-300 w-full my-8" />

            <div className="text-center">
                <h3 className="text-xs m-0">© 2025 TheIdeaBoard. All rights reserved.</h3>
            </div>
        </footer>
    )
}
