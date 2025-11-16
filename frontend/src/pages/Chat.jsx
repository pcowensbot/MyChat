import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { contacts as contactsAPI, messages as messagesAPI, keys as keysAPI } from '../lib/api/client'
import { encryptMessage, decryptMessage } from '../lib/crypto/encryption'
import { LogOut, Send, UserPlus, Lock } from 'lucide-react'

export default function Chat() {
  const { user, logout, privateKey } = useAuthStore()
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [newContactHandle, setNewContactHandle] = useState('')
  const [showAddContact, setShowAddContact] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Load contacts
  useEffect(() => {
    loadContacts()
  }, [])

  // Load messages when contact is selected
  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.contact_handle)
    }
  }, [selectedContact])

  const loadContacts = async () => {
    try {
      const data = await contactsAPI.list()
      setContacts(data)
    } catch (error) {
      console.error('Failed to load contacts:', error)
    }
  }

  const loadMessages = async (handle) => {
    try {
      const data = await messagesAPI.getConversation(handle)

      // Decrypt messages
      if (privateKey) {
        const decrypted = await Promise.all(
          data.messages.map(async (msg) => {
            try {
              const plaintext = await decryptMessage({
                encrypted_content: msg.encrypted_content,
                encrypted_key: msg.encrypted_key || '',
                iv: msg.iv || '',
              }, privateKey)
              return { ...msg, plaintext }
            } catch (error) {
              return { ...msg, plaintext: '[Decryption failed]' }
            }
          })
        )
        setMessages(decrypted.reverse())
      } else {
        setMessages(data.messages.reverse())
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleAddContact = async (e) => {
    e.preventDefault()

    try {
      await contactsAPI.add(newContactHandle)
      setNewContactHandle('')
      setShowAddContact(false)
      loadContacts()
    } catch (error) {
      alert(error.message || 'Failed to add contact')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedContact) return
    if (!privateKey) {
      alert('Private key not available. Cannot encrypt message.')
      return
    }

    setIsSending(true)

    try {
      // Get recipient's public key
      const keyData = await keysAPI.getPublicKey(selectedContact.contact_handle)

      // Encrypt message
      const encrypted = await encryptMessage(newMessage, keyData.public_key)

      // Send message
      await messagesAPI.send({
        recipient_handle: selectedContact.contact_handle,
        ...encrypted,
        content_type: 'text',
      })

      // Add to local messages (optimistic update)
      setMessages([
        ...messages,
        {
          id: Date.now(),
          sender_handle: user.full_handle,
          recipient_handle: selectedContact.contact_handle,
          plaintext: newMessage,
          created_at: new Date().toISOString(),
          status: 'sent',
        },
      ])

      setNewMessage('')
      setIsSending(false)
    } catch (error) {
      setIsSending(false)
      alert(error.message || 'Failed to send message')
    }
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-2xl font-bold">MyChat</h1>
          <p className="text-sm text-blue-100">{user?.full_handle}</p>
        </div>
        <div className="flex items-center space-x-4">
          {privateKey ? (
            <div className="flex items-center text-green-300">
              <Lock className="w-4 h-4 mr-1" />
              <span className="text-xs">Encrypted</span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-300">
              <Lock className="w-4 h-4 mr-1" />
              <span className="text-xs">Key unavailable</span>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded-md transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowAddContact(!showAddContact)}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>

            {showAddContact && (
              <form onSubmit={handleAddContact} className="mt-3">
                <input
                  type="text"
                  placeholder="username@domain.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newContactHandle}
                  onChange={(e) => setNewContactHandle(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm transition"
                >
                  Add
                </button>
              </form>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No contacts yet. Add someone to start chatting!
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition ${
                    selectedContact?.id === contact.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {contact.nickname || contact.contact_handle.split('@')[0]}
                  </div>
                  <div className="text-xs text-gray-500">{contact.contact_handle}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedContact.nickname || selectedContact.contact_handle.split('@')[0]}
                </h2>
                <p className="text-sm text-gray-500">{selectedContact.contact_handle}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm mt-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender_handle === user?.full_handle
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-md px-4 py-2 rounded-lg ${
                            isOwn
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{msg.plaintext || '[Encrypted message]'}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSending ? 'Sending...' : 'Send'}</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a contact to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
