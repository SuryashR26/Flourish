"use client"

import { useState } from "react"
import Button from "@/components/ui/button"
import { BookmarkIcon, PlusIcon, SaveIcon, TextQuote } from "lucide-react"
import { create } from "domain"
import { FaTrash } from "react-icons/fa"
import { FaT } from "react-icons/fa6"

interface Note {
    id: number
    title: string
    content: string
    createdAt: string
}

export default function NotesApp() {
    const [noteContent, setNoteContent] = useState("")
    const [savedNotes, setSavedNotes] = useState<string[]>([])
    const [currentNoteId, setCurrentNoteId] = useState<string | null>(null)
    const [noteValues, setNoteValues] = useState<Note>({
        title: "",
        id: 0,
        content: "",
        createdAt: ""
    })


    const handleSave = () => {
        if (noteContent.trim()) {
            const firstWord = noteContent.trim().split(' ')[0]
            const noteId = Date.now()

            const newNote = {
                id: noteId,
                title: firstWord,
                content: noteContent,
                createdAt: new Date().toLocaleString()
            }

            setSavedNotes(prev => [newNote, ...prev])
            setCurrentNoteId(noteId)

        }
    }

    const loadNote = (note) => {
        setNoteContent(note.content)
        setCurrentNoteId(note.id)
    }

    const createNewNote = () => {
        setNoteContent("")
        setCurrentNoteId(null)
    }



    return (
        <div className=" !bg-black-900 flex">
            <div className="w-80 bg-black-800 border-r border-white p-6 flex flex-col !-ml-20 min-h-[500px]">
                <div className="mb-8">

                    <div className="mt-auto">
                        <button
                            onClick={createNewNote}
                            type="submit"
                            className="flex-1 py-2 min-w-[300px] min-h-[50px] border-2 text-white border-white hover:bg-white hover:text-black rounded-lg transition-colors"
                        >
                            New Note
                        </button>
                    </div>
                    <div className="space-y-5 mb-6 max-h-[450px] overflow-y-auto">
                        {savedNotes.map((note) => (
                            <div
                                key={note.id}
                                onClick={() => loadNote(note)}
                                className={`p-3 !mt-3 cursor-pointer hover:bg-white hover:text-black transition-colors border-b ${currentNoteId === note.id
                                    ? 'bg-black-600 border-b-white text-white'
                                    : 'bg-black-700 border-b-gray-300 text-gray-300 hover:bg-black-600'
                                    }`}
                            >
                                <div className="flex flex-row justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{note.title}</div>
                                        <div className="text-sm text-gray-400 mt-1">{note.createdAt}</div>
                                    </div>
                                    <FaTrash
                                        className="ml-2 text-white hover:text-red-500 cursor-pointer flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering the card click
                                            setSavedNotes(savedNotes.filter(n => n.id !== note.id))
                                            if (currentNoteId === note.id) {
                                                setNoteContent("")
                                                setCurrentNoteId(null)
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col max-w-[600px] !max-h-[0px] !ml-10">
                {/* Text Area */}
                <div className="flex-1 p-6">
                    <textarea
                        placeholder="Start with a title..."
                        className="w-full !min-h-[50px] resize-none bg-black-900 text-white text-lg leading-relaxed p-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                    <hr className="border-t-white w-full !mt-5 !mb-5"></hr>
                    <textarea
                        value={noteContent}
                        onChange={(e) => {

                            setNoteContent(e.target.value)
                            handleSave()
                        }
                        }
                        placeholder="Start writing your ideas here..."
                        className="w-full !min-h-[500px] resize-none bg-black-900 text-white text-lg leading-relaxed p-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                </div>
            </div>
            <button className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                onClick={(e) => {
                    e.preventDefault()
                    setSavedNotes([])
                    setCurrentNoteId(null)
                    setNoteContent("")
                }}
            >
                Delete All Notes

            </button>
        </div>
    )
}
