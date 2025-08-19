"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/navbar"
import ConversationLoadingScreen from "@/components/ui/ConversationLoadingScreen"
import LoadingScreen from "@/components/ui/LoadingScreen"
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
    const [conversationSearchQuery, setConversationSearchQuery] = useState("")
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [messages, setMessages] = useState<Message[]>([])

    const [loadingConversation, setLoadingConversation] = useState(false)
    const [sendingMessage, setSendingMessage] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string>("")
    const chatMessagesRef = useRef<HTMLDivElement>(null)

    // New conversation modal state
    const [showNewConversationModal, setShowNewConversationModal] = useState(false)
    const [userSearchQuery, setUserSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<User[]>([])
    const [startingConversation, setStartingConversation] = useState(false)
    
    // Auto-refresh for real-time messages
    const [lastMessageCount, setLastMessageCount] = useState(0)

    // Get user initials helper function
    const getInitials = (name: string | null | undefined) => {
        if (!name || typeof name !== 'string') {
            return 'U' // Default fallback for unknown user
        }
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

    // Group messages by sender and time proximity
    const groupMessages = (messages: Message[]) => {
        // Filter out system messages
        const userMessages = messages.filter(message => 
            message.content !== "SYSTEM_CONVERSATION_CREATED"
        )
        
        const groups = []
        let currentGroup = null

        for (const message of userMessages) {
            const messageTime = new Date(message.created_at).getTime()
            
            if (!currentGroup || 
                currentGroup.senderId !== message.sender_id ||
                (messageTime - currentGroup.lastMessageTime) > 60000) { // 60 seconds
                
                // Start new group
                currentGroup = {
                    senderId: message.sender_id,
                    senderName: message.sender_name,
                    messages: [message],
                    lastMessageTime: messageTime,
                    timestamp: message.created_at
                }
                groups.push(currentGroup)
            } else {
                // Add to existing group
                currentGroup.messages.push(message)
                currentGroup.lastMessageTime = messageTime
                currentGroup.timestamp = message.created_at // Update to latest timestamp
            }
        }

        return groups
    }

    // Load conversations on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
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
            }
        }

        loadData()
    }, [])

    // Search users only when search query changes (not when modal opens)
    useEffect(() => {
        if (showNewConversationModal && userSearchQuery.trim()) {
            searchForUsers(userSearchQuery)
        } else if (showNewConversationModal && !userSearchQuery.trim()) {
            // Clear results when search is empty
            setSearchResults([])
        }
    }, [showNewConversationModal, userSearchQuery])

    // Auto-refresh messages for real-time updates
    useEffect(() => {
        if (!currentConversationId || loadingConversation) return

        const pollForNewMessages = async () => {
            try {
                const response = await getMessages(currentConversationId)
                if (response.success) {
                    const newMessages = response.messages
                    
                    // Only update if we have new messages
                    if (newMessages.length !== lastMessageCount) {
                        setMessages(newMessages)
                        setLastMessageCount(newMessages.length)
                        
                        // Auto-scroll to bottom if new messages
                        setTimeout(() => {
                            if (chatMessagesRef.current) {
                                chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
                            }
                        }, 100)
                        
                        // Mark new messages as read
                        try {
                            await markMessagesAsRead(currentConversationId)
                            
                            // Update conversations list to clear unread count
                            const conversationsResponse = await getConversations()
                            if (conversationsResponse.success) {
                                const updatedConversations = conversationsResponse.conversations.map((conv: Conversation) => ({
                                    ...conv,
                                    isActive: conv.id === currentConversationId
                                }))
                                setConversations(updatedConversations)
                            }
                        } catch (error) {
                            console.error('Failed to mark messages as read:', error)
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to poll for messages:', error)
            }
        }

        // Poll every 2 seconds
        const interval = setInterval(pollForNewMessages, 2000)

        return () => clearInterval(interval)
    }, [currentConversationId, lastMessageCount, loadingConversation])

    // Auto-refresh conversations list to update last messages and unread counts
    useEffect(() => {
        const pollForConversationUpdates = async () => {
            try {
                const response = await getConversations()
                if (response.success) {
                    const updatedConversations = response.conversations.map((conv: Conversation) => ({
                        ...conv,
                        isActive: conv.id === currentConversationId
                    }))
                    setConversations(updatedConversations)
                }
            } catch (error) {
                console.error('Failed to poll for conversation updates:', error)
            }
        }

        // Poll every 5 seconds (less frequent than messages)
        const interval = setInterval(pollForConversationUpdates, 5000)

        return () => clearInterval(interval)
    }, [currentConversationId])

    const searchForUsers = async (query: string) => {
        try {
            const response = await searchUsers(query)
            if (response.success) {
                setSearchResults(response.users)
            }
        } catch (error) {
            console.error('Failed to search users:', error)
        }
    }

    const startConversationWithUser = async (user: User) => {
        try {
            setStartingConversation(true)
            
            // Check if conversation already exists, if so just open it
            if (user.has_conversation) {
                // Find existing conversation
                const existingConv = conversations.find(conv => 
                    conv.participant_name === user.name
                )
                
                if (existingConv) {
                    // Close modal and open existing conversation
                    setShowNewConversationModal(false)
                    setUserSearchQuery("")
                    setSearchResults([])
                    selectConversation(existingConv.id)
                    return
                }
            }
            
            // For new conversations, create it with a system message that we'll filter out
            const response = await sendMessage(user.id, "SYSTEM_CONVERSATION_CREATED")
            
            if (response.success) {
                // Close modal
                setShowNewConversationModal(false)
                setUserSearchQuery("")
                setSearchResults([])
                
                // Refresh conversations to get the new one
                const conversationsResponse = await getConversations()
                if (conversationsResponse.success) {
                    const updatedConversations = conversationsResponse.conversations.map((conv: Conversation) => ({
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
                setLastMessageCount(response.messages.length) // Update message count for polling
                
                // Mark messages as read
                try {
                    await markMessagesAsRead(conversationId)
                    
                    // Update conversations list to clear unread count immediately
                    const conversationsResponse = await getConversations()
                    if (conversationsResponse.success) {
                        const updatedConversations = conversationsResponse.conversations.map((conv: Conversation) => ({
                            ...conv,
                            isActive: conv.id === conversationId
                        }))
                        setConversations(updatedConversations)
                    }
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

    // Filter conversations based on search query
    const filteredConversations = conversations.filter(conversation => {
        if (!conversationSearchQuery.trim()) {
            return true // Show all if no search query
        }
        
        const searchTerm = conversationSearchQuery.toLowerCase().trim()
        const participantName = conversation.participant_name?.toLowerCase() || ''
        const lastMessage = conversation.last_message_content?.toLowerCase() || ''
        
        return participantName.includes(searchTerm) || lastMessage.includes(searchTerm)
    })

    const activeConversation = conversations.find(conv => conv.isActive)

    return (
        <>
            <Navbar showSeparator={true} />
            <div className="messaging-container">
                {/* Conversations List */}
                <aside className="conversations-list">
                    <div className="conversations-header">
                        <h2>Messages</h2>
                        <div className="search-input-wrapper">
                            <input 
                                type="text" 
                                className="search-conversations" 
                                placeholder="Search conversations..."
                                value={conversationSearchQuery}
                                onChange={(e) => setConversationSearchQuery(e.target.value)}
                            />
                            {conversationSearchQuery && (
                                <button 
                                    className="clear-search-btn"
                                    onClick={() => setConversationSearchQuery("")}
                                    title="Clear search"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            )}
                        </div>
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
                        {filteredConversations.length === 0 ? (
                            <div className="p-4 text-center text-gray-400">
                                {conversationSearchQuery.trim() ? 'No conversations found' : 'No conversations yet'}
                            </div>
                        ) : (
                            filteredConversations.map(conversation => (
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
                                        {conversation.unread_count > 0 && !conversation.isActive && (
                                            <div className="unread-circle">
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
                                    <div></div>
                                ) : (
                                    groupMessages(messages).map((group, groupIndex) => (
                                        <div 
                                            key={`group-${groupIndex}`}
                                            className={`message-group ${group.senderId === currentUserId ? 'sent' : ''}`}
                                        >
                                            <div className="message-avatar">
                                                {getInitials(group.senderName)}
                                            </div>
                                            <div className="message-content">
                                                {group.messages.map((message, messageIndex) => (
                                                    <div key={message.id} className="message-bubble">
                                                        {message.content}
                                                    </div>
                                                ))}
                                                <div className="message-time">
                                                    {formatTime(group.timestamp)}
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
                                {searchResults.length === 0 ? (
                                    <div className="empty-state">
                                        {userSearchQuery.trim() ? 'No users found' : 'Start typing to search for users...'}
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
                    padding: 20px 18px 17px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                .conversations-header h2 {
                    font-size: 1.8rem;
                    margin-bottom: 0.85rem;
                    font-weight: 500;
                    color: #ffffff;
                }

                .search-input-wrapper {
                    position: relative;
                }

                .search-conversations {
                    width: 100%;
                    height: 46px;
                    padding: 0 48px 0 16px;
                    background-color: #0B0809;
                    border: 1px solid #2f3542;
                    border-radius: 8px;
                    color: #ffffff;
                    font-size: 1.0rem;
                    font-weight: 400;
                    transition: border-color 0.2s ease;
                }

                .clear-search-btn {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 4px;
                    transition: color 0.2s, background-color 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .clear-search-btn:hover {
                    color: #1f98f4;
                    background-color: rgba(31, 152, 244, 0.1);
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
                    margin: 16px 18px;
                    height: 46px;
                    background: #0B0809;
                    color: #ffffff;
                    border: 1px solid #2f3542;
                    border-radius: 8px;
                    font-size: 1.0rem;
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
                    padding: 16px 18px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    cursor: pointer;
                    transition: background-color 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 12px;
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
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background-color: #1f98f4;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 500;
                    font-size: 1.0rem;
                    color: #ffffff;
                }

                .conversation-info {
                    flex: 1;
                    min-width: 0;
                }

                .conversation-name {
                    font-weight: 500;
                    font-size: 1.0rem;
                    margin-bottom: 3px;
                    color: #ffffff;
                }

                .conversation-preview {
                    font-size: 0.85rem;
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
                    gap: 5px;
                }

                .conversation-time {
                    font-size: 0.8rem;
                    color: #888;
                }

                .unread-circle {
                    background-color: #1f98f4;
                    width: 11px;
                    height: 11px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .chat-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background-color: #000000;
                }

                .chat-header {
                    padding: 14px 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background-color: #000000;
                }

                .chat-header .conversation-avatar {
                    width: 42px;
                    height: 42px;
                }

                .chat-header-info h3 {
                    font-size: 1.1rem;
                    font-weight: 500;
                    margin-bottom: 1px;
                    color: #ffffff;
                }

                .online-status {
                    font-size: 0.8rem;
                    color: #1f98f4;
                    font-weight: 400;
                }

                .chat-messages {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
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

                .message-group {
                    display: flex;
                    gap: 8px;
                    align-items: flex-start;
                    margin-bottom: 8px;
                }

                .message-group.sent {
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

                .message-group.sent .message-avatar {
                    background-color: #2f3542;
                }

                .message-content {
                    max-width: 60%;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    align-items: flex-start;
                }

                .message-group.sent .message-content {
                    align-items: flex-end;
                }

                .message-bubble {
                    padding: 10px 14px;
                    border-radius: 16px;
                    background-color: #1a1a1a;
                    border: none;
                    word-wrap: break-word;
                    font-size: 0.95rem;
                    line-height: 1.4;
                    color: #ffffff;
                    margin-bottom: 3px;
                    display: inline-block;
                    max-width: 100%;
                    width: fit-content;
                }

                .message-bubble:last-of-type {
                    margin-bottom: 0;
                }

                .message-group.sent .message-bubble {
                    background-color: #1f98f4;
                    border: none;
                    color: #ffffff;
                }

                .message-time {
                    font-size: 0.7rem;
                    color: #888;
                    padding: 0 4px;
                }

                .message-group.sent .message-time {
                    text-align: right;
                }

                .message-input-container {
                    padding: 12px 16px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    background-color: #000000;
                }

                .message-input-wrapper {
                    display: flex;
                    gap: 8px;
                    align-items: flex-start;
                }

                .input-field-wrapper {
                    flex: 1;
                    position: relative;
                }

                .message-input {
                    width: 100%;
                    min-height: 44px;
                    padding: 12px 44px 12px 16px;
                    background-color: #0B0809;
                    border: 1px solid #2f3542;
                    border-radius: 8px;
                    color: #ffffff;
                    font-size: 0.95rem;
                    font-weight: 400;
                    outline: none;
                    resize: none;
                    line-height: 1.3;
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
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 4px;
                    transition: color 0.2s, background-color 0.2s;
                    font-size: 0.9rem;
                }

                .attachment-btn:hover {
                    color: #1f98f4;
                    background-color: rgba(31, 152, 244, 0.1);
                }

                .send-btn {
                    height: 44px;
                    width: 44px;
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
                    font-size: 1rem;
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

                .empty-state {
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