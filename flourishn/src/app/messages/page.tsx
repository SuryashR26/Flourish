"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/navbar"
import ConversationLoadingScreen from "@/components/ui/ConversationLoadingScreen"
import { sendMessage, getConversations, getMessages, markMessagesAsRead, getCurrentUser, searchUsers } from "@/api/apiClient"

interface Message {
    id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    sender_name: string;
    sender_id: string;
    sender_image?: string;
}

interface Conversation {
    id: string;
    participant_name: string;
    participant_id: string;
    participant_image?: string;
    last_message_content: string;
    last_message_time: string;
    unread_count: number;
    isActive?: boolean;
}

interface User {
    id: string;
    name: string;
    email: string;
    profileurl?: string;
    first_name: string;
    last_name: string;
    has_conversation: boolean;
}

export default function MessagesPage() {
    const router = useRouter()
    const [currentConversationId, setCurrentConversationId] = useState<string>("")
    const [messageInput, setMessageInput] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingConversation, setLoadingConversation] = useState(false)
    const [sendingMessage, setSendingMessage] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string>("")
    const chatMessagesRef = useRef<HTMLDivElement>(null)

    // New conversation modal state
    const [showNewConversationModal, setShowNewConversationModal] = useState(false)
    const [userSearchQuery, setUserSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<User[]>([])
    const [searchingUsers, setSearchingUsers] = useState(false)
    const [startingConversation, setStartingConversation] = useState(false)

    // Get user initials helper function
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    // Format timestamp helper function
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            })
        } else if (diffInHours < 48) {
            return 'Yesterday'
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            })
        }
    }

    // Load conversations on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                
                // Get current user info first
                const userResponse = await getCurrentUser()
                if (userResponse.success) {
                    setCurrentUserId(userResponse.user.id)
                }
                
                // Then get conversations
                const response = await getConversations()
                if (response.success) {
                    const conversationsWithActive = response.conversations.map((conv: Conversation, index: number) => ({
                        ...conv,
                        isActive: index === 0 // Make first conversation active
                    }))
                    setConversations(conversationsWithActive)
                    
                    // Set first conversation as current if exists
                    if (conversationsWithActive.length > 0) {
                        setCurrentConversationId(conversationsWithActive[0].id)
                        await loadMessages(conversationsWithActive[0].id)
                    }
                }
            } catch (error) {
                console.error('Failed to load data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    // Search users when modal opens or search query changes
    useEffect(() => {
        if (showNewConversationModal) {
            searchForUsers(userSearchQuery)
        }
    }, [showNewConversationModal, userSearchQuery])

    const searchForUsers = async (query: string) => {
        try {
            setSearchingUsers(true)
            const response = await searchUsers(query)
            if (response.success) {
                setSearchResults(response.users)
            }
        } catch (error) {
            console.error('Failed to search users:', error)
        } finally {
            setSearchingUsers(false)
        }
    }

    const startConversationWithUser = async (user: User) => {
        try {
            setStartingConversation(true)
            
            // Send initial message to create conversation
            const initialMessage = `Hi ${user.first_name}! 👋`
            const response = await sendMessage(user.id, initialMessage)
            
            if (response.success) {
                // Close modal
                setShowNewConversationModal(false)
                setUserSearchQuery("")
                setSearchResults([])
                
                // Refresh conversations to get the new one
                const conversationsResponse = await getConversations()
                if (conversationsResponse.success) {
                    const updatedConversations = conversationsResponse.conversations.map((conv: Conversation, index: number) => ({
                        ...conv,
                        isActive: conv.id === response.conversationId
                    }))
                    setConversations(updatedConversations)
                    setCurrentConversationId(response.conversationId)
                    await loadMessages(response.conversationId)
                }
            }
        } catch (error) {
            console.error('Failed to start conversation:', error)
            alert('Failed to start conversation. Please try again.')
        } finally {
            setStartingConversation(false)
        }
    }

    // Load messages for a conversation
    const loadMessages = async (conversationId: string) => {
        try {
            const response = await getMessages(conversationId)
            if (response.success) {
                setMessages(response.messages)
                // Mark messages as read
                try {
                    await markMessagesAsRead(conversationId)
                } catch (error) {
                    console.error('Failed to mark messages as read:', error)
                }
                
                // Auto-scroll to bottom after messages load
                setTimeout(() => {
                    if (chatMessagesRef.current) {
                        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
                    }
                }, 100)
            }
        } catch (error) {
            console.error('Failed to load messages:', error)
        }
    }

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !currentConversationId || sendingMessage) return
        
        const activeConversation = conversations.find(conv => conv.isActive)
        if (!activeConversation) return

        try {
            setSendingMessage(true)
            const response = await sendMessage(activeConversation.participant_id, messageInput)
            
            if (response.success) {
                console.log('Message sent successfully:', response)
                setMessageInput("")
                
                // Reload messages to get the latest
                await loadMessages(currentConversationId)
                
                // Reload conversations to update last message
                const conversationsResponse = await getConversations()
                if (conversationsResponse.success) {
                    const updatedConversations = conversationsResponse.conversations.map((conv: Conversation) => ({
                        ...conv,
                        isActive: conv.id === currentConversationId
                    }))
                    setConversations(updatedConversations)
                }
                
                // Scroll to bottom
                setTimeout(() => {
                    if (chatMessagesRef.current) {
                        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
                    }
                }, 100)
            }
        } catch (error) {
            console.error('Failed to send message:', error)
            alert('Failed to send message. Please try again.')
        } finally {
            setSendingMessage(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const selectConversation = async (conversationId: string) => {
        // Don't switch if already loading or same conversation
        if (loadingConversation || conversationId === currentConversationId) return
        
        // Set loading state and show loading screen
        setLoadingConversation(true)
        
        setConversations(prev => 
            prev.map(conv => ({
                ...conv,
                isActive: conv.id === conversationId
            }))
        )
        setCurrentConversationId(conversationId)
        
        // Add a minimum delay to show the loading screen
        const minDelay = new Promise(resolve => setTimeout(resolve, 800))
        
        try {
            // Load messages for the selected conversation
            await Promise.all([loadMessages(conversationId), minDelay])
        } catch (error) {
            console.error('Failed to load conversation:', error)
        } finally {
            setLoadingConversation(false)
            // Ensure scroll to bottom after loading screen ends
            setTimeout(() => {
                if (chatMessagesRef.current) {
                    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
                }
            }, 50)
        }
    }

    const activeConversation = conversations.find(conv => conv.isActive)

    return (
        <>
            <Navbar showSeparator={true} />
            <div className="messaging-container">
                {/* Conversations List */}
                <aside className="conversations-list">
                    <div className="conversations-header">
                        <h2>Messages</h2>
                        <input 
                            type="text" 
                            className="search-conversations" 
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        className="new-conversation-btn"
                        onClick={() => setShowNewConversationModal(true)}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
                        </svg>
                        New Conversation
                    </button>
                    
                    <div className="conversations-container">
                        {loading ? (
                            <div className="p-4 text-center text-gray-400">
                                Loading conversations...
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-4 text-center text-gray-400">
                                No conversations yet
                            </div>
                        ) : (
                            conversations.map(conversation => (
                                <div 
                                    key={conversation.id}
                                    className={`conversation-item ${conversation.isActive ? 'active' : ''}`}
                                    onClick={() => selectConversation(conversation.id)}
                                >
                                    <div className="conversation-avatar">
                                        {getInitials(conversation.participant_name)}
                                    </div>
                                    <div className="conversation-info">
                                        <div className="conversation-name">
                                            {conversation.participant_name}
                                        </div>
                                        <div className="conversation-preview">
                                            {conversation.last_message_content || 'No messages yet'}
                                        </div>
                                    </div>
                                    <div className="conversation-meta">
                                        <div className="conversation-time">
                                            {formatTime(conversation.last_message_time)}
                                        </div>
                                        {conversation.unread_count > 0 && (
                                            <div className="unread-badge">
                                                {conversation.unread_count}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Chat Area */}
                <main className="chat-area">
                    {loadingConversation ? (
                        <ConversationLoadingScreen 
                            participantName={activeConversation?.participant_name}
                        />
                    ) : activeConversation ? (
                        <>
                            <div className="chat-header">
                                <div className="conversation-avatar">
                                    {getInitials(activeConversation.participant_name)}
                                </div>
                                <div className="chat-header-info">
                                    <h3>{activeConversation.participant_name}</h3>
                                    <div className="online-status">Active now</div>
                                </div>
                            </div>

                            <div className="chat-messages" ref={chatMessagesRef}>
                                {messages.length === 0 ? (
                                    <div className="p-4 text-center text-gray-400">
                                        No messages yet. Start the conversation!
                                    </div>
                                ) : (
                                    messages.map(message => (
                                        <div 
                                            key={message.id}
                                            className={`message ${message.sender_id === currentUserId ? 'sent' : ''}`}
                                        >
                                            <div className="message-avatar">
                                                {getInitials(message.sender_name)}
                                            </div>
                                            <div className="message-content">
                                                <div className="message-bubble">
                                                    {message.content}
                                                </div>
                                                <div className="message-time">
                                                    {formatTime(message.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="message-input-container">
                                <div className="message-input-wrapper">
                                    <div className="input-field-wrapper">
                                        <textarea 
                                            className="message-input" 
                                            placeholder="Type a message..." 
                                            rows={1}
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                        />
                                        <button className="attachment-btn" title="Attach file">
                                            <i className="fa-solid fa-paperclip"></i>
                                        </button>
                                    </div>
                                    <button 
                                        className="send-btn"
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim() || sendingMessage}
                                    >
                                        <i className="fa-solid fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <svg width="40" height="40" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                </svg>
                            </div>
                            <h3>No conversation selected</h3>
                            <p>Choose a conversation from the sidebar to start messaging</p>
                        </div>
                    )}
                </main>
            </div>

            {/* New Conversation Modal */}
            {showNewConversationModal && (
                <div className="modal-overlay" onClick={() => setShowNewConversationModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Start New Conversation</h3>
                            <button 
                                className="close-btn"
                                onClick={() => setShowNewConversationModal(false)}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <input
                                type="text"
                                className="user-search-input"
                                placeholder="Search users by name or email..."
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                            />
                            
                            <div className="users-list">
                                {searchingUsers ? (
                                    <div className="loading-state">
                                        Searching users...
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="empty-state">
                                        {userSearchQuery ? 'No users found' : 'Type to search for users'}
                                    </div>
                                ) : (
                                    searchResults.map(user => (
                                        <div 
                                            key={user.id}
                                            className="user-item"
                                            onClick={() => startConversationWithUser(user)}
                                        >
                                            <div className="user-avatar">
                                                {getInitials(user.name)}
                                            </div>
                                            <div className="user-info">
                                                <div className="user-name">{user.name}</div>
                                                <div className="user-email">{user.email}</div>
                                            </div>
                                            <div className="user-status">
                                                {user.has_conversation ? (
                                                    <span className="existing-chat">Existing chat</span>
                                                ) : (
                                                    <span className="new-chat">Start chat</span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            {startingConversation && (
                                <div className="starting-conversation">
                                    Starting conversation...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .messaging-container {
                    display: flex;
                    height: calc(100vh - 81px);
                    margin-top: 81px;
                }

                .conversations-list {
                    width: 380px;
                    background-color: #000000;
                    border-right: 1px solid rgba(255,255,255,0.1);
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }

                .conversations-header {
                    padding: 24px 20px 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                .conversations-header h2 {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                    font-weight: 500;
                    color: #ffffff;
                }

                .search-conversations {
                    width: 100%;
                    height: 54px;
                    padding: 0 20px;
                    background-color: #0B0809;
                    border: 1px solid #2f3542;
                    border-radius: 8px;
                    color: #ffffff;
                    font-size: 1.15rem;
                    font-weight: 400;
                    transition: border-color 0.2s ease;
                }

                .search-conversations::placeholder {
                    color: #b0b8c1;
                    opacity: 1;
                }

                .search-conversations:focus {
                    outline: none;
                    border-color: #1f98f4;
                }

                .new-conversation-btn {
                    margin: 20px;
                    height: 54px;
                    background: #0B0809;
                    color: #ffffff;
                    border: 1px solid #2f3542;
                    border-radius: 8px;
                    font-size: 1.15rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: border-color 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .new-conversation-btn:hover {
                    border-color: #1f98f4;
                }

                .conversations-container {
                    flex: 1;
                    overflow-y: auto;
                }

                .conversation-item {
                    padding: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    cursor: pointer;
                    transition: background-color 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    position: relative;
                }

                .conversation-item:hover {
                    background-color: rgba(255,255,255,0.03);
                }

                .conversation-item.active {
                    background-color: #0B0809;
                }

                .conversation-item.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background-color: #1f98f4;
                }

                .conversation-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background-color: #1f98f4;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 500;
                    font-size: 1.1rem;
                    color: #ffffff;
                }

                .conversation-info {
                    flex: 1;
                    min-width: 0;
                }

                .conversation-name {
                    font-weight: 500;
                    font-size: 1.1rem;
                    margin-bottom: 4px;
                    color: #ffffff;
                }

                .conversation-preview {
                    font-size: 0.95rem;
                    color: #b0b8c1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-weight: 400;
                }

                .conversation-meta {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 6px;
                }

                .conversation-time {
                    font-size: 0.85rem;
                    color: #888;
                }

                .unread-badge {
                    background-color: #1f98f4;
                    color: #ffffff;
                    font-size: 0.8rem;
                    font-weight: 500;
                    padding: 3px 8px;
                    border-radius: 12px;
                    min-width: 22px;
                    text-align: center;
                }

                .chat-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background-color: #000000;
                }

                .chat-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background-color: #000000;
                }

                .chat-header .conversation-avatar {
                    width: 48px;
                    height: 48px;
                }

                .chat-header-info h3 {
                    font-size: 1.3rem;
                    font-weight: 500;
                    margin-bottom: 2px;
                    color: #ffffff;
                }

                .online-status {
                    font-size: 0.9rem;
                    color: #1f98f4;
                    font-weight: 400;
                }

                .chat-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    background-color: #000000;
                }

                .chat-messages::-webkit-scrollbar {
                    width: 6px;
                }

                .chat-messages::-webkit-scrollbar-track {
                    background: rgba(255,255,255,0.02);
                }

                .chat-messages::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 3px;
                }

                .chat-messages::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.15);
                }

                .message {
                    display: flex;
                    gap: 8px;
                    align-items: flex-start;
                }

                .message.sent {
                    flex-direction: row-reverse;
                }

                .message-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background-color: #1f98f4;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.7rem;
                    font-weight: 500;
                    color: #ffffff;
                }

                .message.sent .message-avatar {
                    background-color: #2f3542;
                }

                .message-content {
                    max-width: 60%;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .message-bubble {
                    padding: 10px 14px;
                    border-radius: 6px;
                    background-color: #0B0809;
                    border: 1px solid #2f3542;
                    word-wrap: break-word;
                    font-size: 0.95rem;
                    line-height: 1.4;
                    color: #ffffff;
                }

                .message.sent .message-bubble {
                    background-color: #1f98f4;
                    border-color: #1f98f4;
                    color: #ffffff;
                }

                .message-time {
                    font-size: 0.7rem;
                    color: #888;
                    padding: 0 4px;
                }

                .message.sent .message-time {
                    text-align: right;
                }

                .message-input-container {
                    padding: 20px 24px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    background-color: #000000;
                }

                .message-input-wrapper {
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                }

                .input-field-wrapper {
                    flex: 1;
                    position: relative;
                }

                .message-input {
                    width: 100%;
                    min-height: 60px;
                    padding: 16px 50px 16px 20px;
                    background-color: #0B0809;
                    border: 1px solid #2f3542;
                    border-radius: 8px;
                    color: #ffffff;
                    font-size: 1.15rem;
                    font-weight: 400;
                    outline: none;
                    resize: none;
                    line-height: 1.4;
                    transition: border-color 0.2s ease;
                    font-family: inherit;
                }

                .message-input:focus {
                    border-color: #1f98f4;
                }

                .message-input::placeholder {
                    color: #b0b8c1;
                    opacity: 1;
                }

                .attachment-btn {
                    position: absolute;
                    right: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 4px;
                    transition: color 0.2s, background-color 0.2s;
                }

                .attachment-btn:hover {
                    color: #1f98f4;
                    background-color: rgba(31, 152, 244, 0.1);
                }

                .send-btn {
                    height: 60px;
                    width: 60px;
                    background: #ffffff;
                    border: 1px solid #2f3542;
                    color: #000000;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 0.2s ease;
                    flex-shrink: 0;
                    font-size: 1.2rem;
                }

                .send-btn:hover:not(:disabled) {
                    background: #cdcccd;
                }

                .send-btn:disabled {
                    background: #0B0809;
                    color: #2f3542;
                    cursor: not-allowed;
                    border-color: #2f3542;
                }

                .empty-state {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #888;
                    text-align: center;
                    padding: 40px;
                }

                .empty-state-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background-color: #0B0809;
                    border: 1px solid #2f3542;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                    color: #888;
                }

                .empty-state h3 {
                    font-size: 1.5rem;
                    font-weight: 500;
                    color: #ffffff;
                    margin-bottom: 8px;
                }

                .empty-state p {
                    font-size: 1rem;
                    color: #b0b8c1;
                    max-width: 400px;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal-content {
                    background-color: #000000;
                    border: 1px solid #2f3542;
                    border-radius: 12px;
                    width: 500px;
                    max-width: 90vw;
                    max-height: 80vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .modal-header {
                    padding: 24px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .modal-header h3 {
                    font-size: 1.4rem;
                    font-weight: 500;
                    color: #ffffff;
                    margin: 0;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 4px;
                    transition: color 0.2s, background-color 0.2s;
                }

                .close-btn:hover {
                    color: #ffffff;
                    background-color: rgba(255, 255, 255, 0.1);
                }

                .modal-body {
                    padding: 24px;
                    flex: 1;
                    overflow-y: auto;
                }

                .user-search-input {
                    width: 100%;
                    height: 54px;
                    padding: 0 20px;
                    background-color: #0B0809;
                    border: 1px solid #2f3542;
                    border-radius: 8px;
                    color: #ffffff;
                    font-size: 1.15rem;
                    font-weight: 400;
                    margin-bottom: 20px;
                    transition: border-color 0.2s ease;
                }

                .user-search-input::placeholder {
                    color: #b0b8c1;
                    opacity: 1;
                }

                .user-search-input:focus {
                    outline: none;
                    border-color: #1f98f4;
                }

                .users-list {
                    max-height: 300px;
                    overflow-y: auto;
                }

                .loading-state, .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: #888;
                    font-size: 1rem;
                }

                .user-item {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    margin-bottom: 8px;
                }

                .user-item:hover {
                    background-color: rgba(255,255,255,0.03);
                }

                .user-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background-color: #1f98f4;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 500;
                    font-size: 1rem;
                    color: #ffffff;
                }

                .user-info {
                    flex: 1;
                }

                .user-name {
                    font-weight: 500;
                    font-size: 1.1rem;
                    color: #ffffff;
                    margin-bottom: 2px;
                }

                .user-email {
                    font-size: 0.9rem;
                    color: #b0b8c1;
                }

                .user-status {
                    font-size: 0.85rem;
                    padding: 4px 8px;
                    border-radius: 4px;
                }

                .existing-chat {
                    color: #888;
                    background-color: rgba(255,255,255,0.05);
                }

                .new-chat {
                    color: #1f98f4;
                    background-color: rgba(31, 152, 244, 0.1);
                }

                .starting-conversation {
                    text-align: center;
                    padding: 20px;
                    color: #1f98f4;
                    font-size: 1rem;
                    font-weight: 500;
                }

                .users-list::-webkit-scrollbar {
                    width: 6px;
                }

                .users-list::-webkit-scrollbar-track {
                    background: rgba(255,255,255,0.02);
                }

                .users-list::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 3px;
                }

                .users-list::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.15);
                }
            `}</style>
        </>
    )
} 