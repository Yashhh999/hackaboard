import { Github } from "lucide-react"
import Link from "next/link"

export default function Footer(){
    return(
        <>
        <div className="w-full h-16 bg-gray-900 justify-between flex">
            <h1></h1>
            <Link href="https://yashly.vercel.app" className="text-gray-200  p-2 text-xl ml-8">Made By Yash</Link>

            <Link href="https://github.com/Yashhh999/hackaboard" className="p-1 m-3 flex h-9 bg-white rounded-xl ">
            
            <Github className="w-8 h-8 p-1 "></Github>
           <h1 className="p-1"> Hackaboard</h1>

            </Link>
        </div>
        </>
    )
}