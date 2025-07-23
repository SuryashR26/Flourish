"use client"

import React, { useState } from "react";

interface Note {
    id: number
    title: string
    content: string
    createdAt: string
}

export default function NotesApp() {
    const [noteContent, setNoteContent] = useState("")
    const [noteTitle, setNoteTitle] = useState("")
    const [savedNotes, setSavedNotes] = useState<Note[]>([])
    const [currentNoteId, setCurrentNoteId] = useState<number | null>(null)

    const handleSave = () => {
        if (noteContent.trim() || noteTitle.trim()) {
            let noteId = currentNoteId;
            // let isNew = false;

            if (!noteId) {
                noteId = Date.now();
                // isNew = true;
            }

            const newNote: Note = {
                id: noteId,
                title: noteTitle,
                content: noteContent,
                createdAt: new Date().toLocaleString()
            };

            setSavedNotes(prev => {
                const filtered = prev.filter(n => n.id !== noteId);
                return [newNote, ...filtered];
            });
            setCurrentNoteId(noteId);
        }
    };


    const loadNote = (note: Note) => {
        setNoteContent(note.content)
        setNoteTitle(note.title)
        setCurrentNoteId(note.id)
    }

    const createNewNote = () => {
        setNoteContent("")
        setNoteTitle("")
        setCurrentNoteId(null)
    }

    const handleDelete = (id: number) => {
        setSavedNotes(prev => prev.filter(n => n.id !== id));
        if (currentNoteId === id) {
            createNewNote();
        }
    }

    return (
        <div className="!bg-black-900 flex">
            {/* Sidebar */}
            <div className="w-80 bg-black-800 border-r border-white p-6 flex flex-col !-ml-20 min-h-[500px]">
                <button
                    className="mb-4 bg-black-600 text-white px-4 py-2 rounded hover:bg-white hover:text-black transition-colors"
                    onClick={createNewNote}
                >
                    + New Note
                </button>
                <div className="space-y-3 mb-6 max-h-[450px] overflow-y-auto">
                    {savedNotes.length === 0 && (
                        <div className="text-gray-400 text-center mt-10">No notes yet.</div>
                    )}
                    {savedNotes.map(note => (
                        <div
                            key={note.id}
                            className={`p-3 rounded cursor-pointer ${currentNoteId === note.id ? "bg-white text-black" : "bg-black text-white"} flex justify-between items-center`}
                            onClick={() => loadNote(note)}
                        >
                            <div>
                                <div className="font-semibold truncate max-w-[120px]">{note.title || "Untitled"}</div>
                                <div className="text-xs text-gray-400">{note.createdAt}</div>
                            </div>
                            <button
                                className="ml-2 text-red-400 hover:text-red-600"
                                onClick={e => {
                                    e.stopPropagation();
                                    handleDelete(note.id);
                                }}
                                title="Delete"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Note Area */}
            <div className="flex-1 flex flex-col max-w-[600px] !ml-10">
                <div className="flex-1 p-6">
                    <input
                        value={noteTitle}
                        onChange={e => {
                            setNoteTitle(e.target.value)
                            handleSave();

                        }}
                        placeholder="Start with a title..."
                        className="w-full !min-h-[50px] resize-none bg-black-900 text-white text-lg leading-relaxed p-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent mb-2"
                    />
                    <hr className="border-t-white w-full !mt-5 !mb-5" />
                    <textarea
                        value={noteContent}
                        onChange={e => {
                            setNoteContent(e.target.value)
                            handleSave();

                        }}
                        placeholder="Start writing your ideas here..."
                        className="w-full !min-h-[500px] resize-none bg-black-900 text-white text-lg leading-relaxed p-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                </div>
            </div>
            <button
                className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                onClick={e => {
                    e.preventDefault();
                    setSavedNotes([]);
                    createNewNote();
                }}
            >
                Delete All Notes
            </button>
        </div>
    )
}