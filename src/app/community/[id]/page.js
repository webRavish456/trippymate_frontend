'use client';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { io } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/config';

export default function CommunityTripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = params.id;
  const queryIsUpcoming = searchParams.get('isUpcoming') === 'true';
  const [message, setMessage] = useState('');
  const [communityRating, setCommunityRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [tempRating, setTempRating] = useState(0);
  const [feedbackAnswers, setFeedbackAnswers] = useState({
    question1: '',
    question2: '',
    question3: '',
    question4: ''
  });
  const [messages, setMessages] = useState([]);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Fetch trip data
  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  // Setup Socket.IO connection
  useEffect(() => {
    if (!trip || !tripId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const socketInstance = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity, // Keep trying to reconnect
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false,
      upgrade: true
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      // Join trip room
      socketInstance.emit('join-trip', tripId);
      // Reload messages when reconnected to ensure we have all messages
      fetchMessages();
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message || error);
      // Don't show error to user, just log it
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      // Rejoin trip room and reload messages
      socketInstance.emit('join-trip', tripId);
      fetchMessages();
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt', attemptNumber);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('Reconnection failed - will keep trying');
      // Try to manually reconnect
      setTimeout(() => {
        if (!socketInstance.connected) {
          socketInstance.connect();
        }
      }, 5000);
    });

    socketInstance.on('joined-trip', () => {
      console.log('Joined trip room');
    });

    // Listen for new messages
    socketInstance.on('new-message', (newMessage) => {
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => msg._id === newMessage._id);
        if (exists) {
          return prev;
        }
        return [...prev, formatMessage(newMessage)];
      });
      scrollToBottom();
    });

    // Listen for message updates
    socketInstance.on('message-updated', (updatedMessage) => {
      setMessages(prev => prev.map(msg => 
        msg._id === updatedMessage._id ? formatMessage(updatedMessage) : msg
      ));
    });

    // Listen for message deletions
    socketInstance.on('message-deleted', ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    socketInstance.on('error', (error) => {
      // Handle error gracefully - don't break the app
      const errorMessage = error?.message || error?.toString() || 'Unknown socket error';
      console.error('Socket error:', errorMessage);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      // If disconnect was due to server or transport close, try to reconnect
      if (reason === 'io server disconnect' || reason === 'transport close') {
        // Server disconnected, reconnect manually
        setTimeout(() => {
          if (!socketInstance.connected) {
            socketInstance.connect();
          }
        }, 1000);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [trip, tripId]);

  // Load user's rating from backend on mount
  useEffect(() => {
    const fetchUserRating = async () => {
      if (!tripId) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/user/community-trip/${tripId}/rating`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();
        if (result.status && result.data) {
          setCommunityRating(result.data.rating);
        }
      } catch (error) {
        console.error('Error fetching user rating:', error);
      }
    };

    fetchUserRating();
  }, [tripId]);

  // Fetch messages when trip is loaded
  useEffect(() => {
    if (!trip) return;
    
    // Check if trip is upcoming
    const checkIfUpcoming = () => {
      if (!trip?.startDate) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(trip.startDate);
      startDate.setHours(0, 0, 0, 0);
      return today < startDate;
    };
    
    const isUpcoming = queryIsUpcoming ? checkIfUpcoming() : false;
    
    if (!isUpcoming) {
      fetchMessages();
    }
  }, [trip, queryIsUpcoming]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Periodically fetch messages to ensure we have latest (fallback if socket fails)
  useEffect(() => {
    if (!trip || !tripId) return;
    
    // Check if trip is upcoming
    const checkIfUpcoming = () => {
      if (!trip?.startDate) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(trip.startDate);
      startDate.setHours(0, 0, 0, 0);
      return today < startDate;
    };
    
    const isUpcoming = queryIsUpcoming ? checkIfUpcoming() : false;
    if (isUpcoming) return;
    
    const interval = setInterval(() => {
      // Only fetch if socket is not connected or to sync messages
      if (!socket || !socket.connected) {
        console.log('Socket not connected, fetching messages from API');
        fetchMessages();
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [trip, tripId, socket, queryIsUpcoming]);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/user/community-trip/${tripId}`);
      const result = await response.json();

      if (result.status && result.data) {
        const tripData = result.data;
        
        // Format date range
        const startDate = new Date(tripData.startDate);
        const endDate = new Date(tripData.endDate);
        const dateRange = `${startDate.getDate()} - ${endDate.getDate()} ${endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

        // Calculate duration
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const nights = diffDays - 1;
        const duration = `${diffDays} Days / ${nights} Nights`;

        // Format members list
        const organizerId = tripData.organizerId?._id || tripData.organizerId;
        const membersList = (tripData.members || [])
          .filter(m => m.status === 'approved')
          .map(m => ({
            id: m.userId?._id || m.userId,
            name: m.userId?.name || m.userId?.email || 'Member',
            image: m.userId?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
            isHost: (m.userId?._id || m.userId)?.toString() === organizerId?.toString()
          }));

        const organizerName = tripData.organizerName || 'Admin';
        const displayName = (organizerName.toLowerCase() === 'superadmin@gmail.com' || organizerName === 'superadmin@gmail.com') ? 'Admin' : organizerName;

        setTrip({
          id: tripData._id,
          image: tripData.images?.[0]?.path || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&h=600&fit=crop',
          title: tripData.title,
          description: tripData.tripType || 'Mixed Group',
          dateRange: dateRange,
          startDate: tripData.startDate,
          endDate: tripData.endDate,
          location: tripData.location,
          members: tripData.members?.filter(m => m.status === 'approved').length || 0,
          maxMembers: tripData.maxMembers || 20,
          groupType: tripData.groupType || 'Mixed Group',
          hostName: displayName,
          hostImage: tripData.organizerImage?.path || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
          rating: tripData.averageRating || tripData.organizerRating || 0,
          verified: tripData.organizerVerified || false,
          tripDetails: {
            duration: duration,
            maxMembers: tripData.maxMembers || 20,
            price: tripData.price ? `₹${tripData.price}` : 'Contact for price',
            includes: tripData.inclusions || ['Accommodation', 'Meals', 'Transportation']
          },
          itinerary: tripData.itinerary || [],
          membersList: membersList,
          description: tripData.description || ''
        });
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/api/user/community-trip/${tripId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();

      if (result.status && result.data) {
        const formattedMessages = result.data.map(msg => formatMessage(msg));
        // Merge with existing messages to avoid duplicates and preserve order
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m._id));
          const newMessages = formattedMessages.filter(m => !existingIds.has(m._id));
          // Combine and sort by timestamp
          const combined = [...prev, ...newMessages];
          const sorted = combined.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.timestamp || 0);
            const dateB = new Date(b.createdAt || b.timestamp || 0);
            return dateA - dateB;
          });
          // Remove duplicates by _id
          const unique = [];
          const seenIds = new Set();
          for (const msg of sorted) {
            if (!seenIds.has(msg._id)) {
              seenIds.add(msg._id);
              unique.push(msg);
            }
          }
          return unique;
        });
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const formatMessage = (msg) => {
    const date = new Date(msg.createdAt || msg.timestamp);
    const isHost = msg.isAdminReply || (trip?.organizerId && (msg.adminId || msg.userId)?.toString() === trip.organizerId?.toString());
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = user._id || user.id;
    const messageUserId = msg.userId?._id || msg.userId || msg.adminId?._id || msg.adminId;
    const isCurrentUser = messageUserId?.toString() === currentUserId?.toString();
    
    return {
      _id: msg._id,
      userId: msg.userId?._id || msg.userId,
      userName: msg.userName || msg.userId?.name || msg.adminId?.name || 'User',
      userImage: msg.userImage || msg.userId?.profileImage || msg.adminId?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      text: msg.message,
      timestamp: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isHost: isHost,
      isCurrentUser: isCurrentUser,
      createdAt: msg.createdAt
    };
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  if (!trip) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#1D4ED8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Loading trip details...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  // Check if trip is upcoming - moved here to be available for render
  const checkIfUpcoming = () => {
    if (!trip?.startDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(trip.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    return today < startDate;
  };
  
  const isUpcoming = trip ? (queryIsUpcoming ? checkIfUpcoming() : false) : false;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) {
      if (!socket) {
        setToast({ show: true, message: 'Connection not established. Please refresh the page.', type: 'error' });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
      }
      return;
    }

    const messageText = message.trim();
    setMessage(''); // Clear input immediately for better UX

    // Set up one-time error listener before emitting
    const errorHandler = (errorData) => {
      console.error('Message send error:', errorData);
      if (errorData?.message) {
        setToast({ show: true, message: errorData.message, type: 'error' });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
        // Restore message if sending failed
        setMessage(messageText);
      }
    };

    socket.once('error', errorHandler);

    try {
      socket.emit('send-message', {
        tripId: tripId,
        message: messageText,
        messageType: 'general'
      });
      
      // Remove error handler after a short delay (if message succeeds, no error will be emitted)
      setTimeout(() => {
        socket.off('error', errorHandler);
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
      setToast({ show: true, message: 'Failed to send message. Please try again.', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
      setMessage(messageText); // Restore message
    }
  };

  const handleRateCommunity = () => {
    setTempRating(communityRating || 0);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (tempRating > 0) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setToast({ show: true, message: 'Please login to submit rating', type: 'error' });
          setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/user/community-trip/${tripId}/rating`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            rating: tempRating,
            feedback: feedbackAnswers
          })
        });

        const result = await response.json();

        if (result.status) {
          setCommunityRating(tempRating);
          // Update trip with new average rating
          if (result.data?.averageRating && trip) {
            setTrip(prev => ({
              ...prev,
              rating: result.data.averageRating
            }));
          }
          setShowRatingModal(false);
          setTempRating(0);
          setFeedbackAnswers({
            question1: '',
            question2: '',
            question3: '',
            question4: ''
          });
          // Show success toast message
          setToast({ show: true, message: 'Thank you for rating this community!', type: 'success' });
          setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
        } else {
          setToast({ show: true, message: result.message || 'Failed to submit rating', type: 'error' });
          setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
        }
      } catch (error) {
        console.error('Error submitting rating:', error);
        setToast({ show: true, message: 'Failed to submit rating. Please try again.', type: 'error' });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Page Header - Below Header Component */}
      <div style={{
        backgroundColor: 'white',
        padding: '10px 6rem',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginTop: '70px'
      }}>
        <button
          onClick={() => router.push("/community")}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            borderRadius: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1e293b',
          margin: 0
        }}>
          {trip.title}
        </h1>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        padding: '2rem 6rem', 
        height: 'calc(100vh - 100px)',
        alignItems: 'flex-start'
      }}>
        {/* Toast Notification */}
        {toast.show && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: toast.type === 'error' ? '#ef4444' : '#1D4ED8',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '400px'
          }}>
            {toast.type === 'error' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            <span style={{ fontSize: '1rem', fontWeight: '600' }}>{toast.message}</span>
          </div>
        )}

        {/* Left Side - Group Chat or Coming Soon */}
        {isUpcoming ? (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem'
          }}>
            <div style={{
              textAlign: 'center',
              maxWidth: '500px'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 2rem',
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#1D4ED8"/>
                </svg>
              </div>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '1rem'
              }}>
                Community Coming Soon!
              </h2>
              {trip.startDate && (
                <div style={{
                  backgroundColor: '#eff6ff',
                  color: '#1D4ED8',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                  display: 'inline-block',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>
                  Starts on {new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
              <p style={{
                fontSize: '1.125rem',
                color: '#64748b',
                lineHeight: '1.6',
                marginBottom: '2rem'
              }}>
                This trip is still being organized. Once the community starts{trip.startDate ? ` on ${new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}, you'll be able to chat with your fellow travelers here.
              </p>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{
                  fontSize: '0.9375rem',
                  color: '#475569',
                  margin: 0,
                  fontWeight: '600'
                }}>
                  💡 Tip: The group chat will automatically be available once the community start date arrives. You can join now and wait for the community to begin!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            height: '100%'
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: 0,
                  marginBottom: '0.25rem'
                }}>
                  Group Chat
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: 0
                }}>
                  {trip.members || 0} members {!isUpcoming ? 'online' : ''}
                </p>
              </div>
              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <button style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1D4ED8';
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              backgroundColor: '#f8fafc'
            }}>
              {messages.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  color: '#64748b'
                }}>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isCurrentUser = msg.isCurrentUser;
                  return (
                    <div 
                      key={msg._id || msg.id}
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-end',
                        flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                        marginBottom: '1.25rem',
                        padding: '0 0.5rem'
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        position: 'relative'
                      }}>
                        <img 
                          src={msg.userImage} 
                          alt={msg.userName}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        {msg.isHost && (
                          <div style={{
                            position: 'absolute',
                            bottom: '-2px',
                            right: '-2px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: '#1D4ED8',
                            border: '2px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Message Content */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        minWidth: '120px'
                      }}>
                        {/* User Name & Time */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.375rem',
                          paddingLeft: isCurrentUser ? '0' : '0.5rem',
                          paddingRight: isCurrentUser ? '0.5rem' : '0'
                        }}>
                          {!isCurrentUser && (
                            <>
                              <span style={{
                                fontSize: '0.8125rem',
                                fontWeight: '600',
                                color: '#475569'
                              }}>
                                {msg.userName}
                              </span>
                              {msg.isHost && (
                                <span style={{
                                  backgroundColor: '#1D4ED8',
                                  color: 'white',
                                  padding: '0.125rem 0.375rem',
                                  borderRadius: '4px',
                                  fontSize: '0.625rem',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  Host
                                </span>
                              )}
                            </>
                          )}
                          <span style={{
                            fontSize: '0.6875rem',
                            color: '#94a3b8',
                            fontWeight: '500'
                          }}>
                            {msg.timestamp}
                          </span>
                        </div>

                        {/* Message Bubble */}
                        <div style={{
                          backgroundColor: isCurrentUser ? '#1D4ED8' : '#ffffff',
                          color: isCurrentUser ? '#ffffff' : '#1e293b',
                          padding: '0.75rem 1rem',
                          borderRadius: isCurrentUser 
                            ? '18px 18px 4px 18px' 
                            : '18px 18px 18px 4px',
                          fontSize: '0.9375rem',
                          lineHeight: '1.5',
                          wordWrap: 'break-word',
                          boxShadow: isCurrentUser
                            ? '0 2px 12px rgba(29, 78, 216, 0.25)'
                            : '0 2px 8px rgba(0,0,0,0.08)',
                          border: isCurrentUser ? 'none' : '1px solid #e5e7eb',
                          position: 'relative',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrentUser) {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrentUser) {
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                          }
                        }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              backgroundColor: 'white'
            }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '0.875rem 1.25rem',
                  borderRadius: '50px',
                  border: '2px solid #e5e7eb',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#1D4ED8';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              />
              <button
                type="submit"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#1D4ED8',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e40af';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1D4ED8';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Right Sidebar - Trip Info */}
        <div style={{ 
          width: '400px',
          flexShrink: 0,
          display: 'flex', 
          flexDirection: 'column',
          gap: '2rem',
          overflowY: 'auto',
          height: '100%'
        }}>
          {/* Trip Image */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '280px',
            minHeight: '280px',
            flexShrink: 0,
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            backgroundColor: '#e5e7eb',
            backgroundImage: `url(${trip.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>
            <img 
              src={trip.image} 
              alt={trip.title}
              style={{
                width: '100%',
                height: '280px',
                minHeight: '280px',
                objectFit: 'cover',
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              backgroundColor: 'rgba(29, 78, 216, 0.9)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              zIndex: 1
            }}>
              {trip.dateRange}
            </div>
          </div>

          {/* Trip Details Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            marginTop: '0'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '1.5rem'
            }}>
              Trip Details
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.9375rem' }}>Duration</span>
                <span style={{ color: '#1e293b', fontWeight: '600' }}>{trip.tripDetails.duration}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.9375rem' }}>Price</span>
                <span style={{ color: '#1D4ED8', fontWeight: '700', fontSize: '1.125rem' }}>{trip.tripDetails.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.9375rem' }}>Members</span>
                <span style={{ color: '#1e293b', fontWeight: '600' }}>{trip.members}/{trip.tripDetails.maxMembers}</span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>
                Includes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {trip.tripDetails.includes.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#10b981" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <span style={{ color: '#475569', fontSize: '0.9375rem' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {!isUpcoming && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                    Community Rating
                  </h3>
                  {communityRating > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f59e0b"/>
                      </svg>
                      <span style={{ fontSize: '1rem', color: '#92400e', fontWeight: '700' }}>
                        {communityRating.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                      <span>Not rated yet</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleRateCommunity}
                  style={{
                    width: '100%',
                    backgroundColor: communityRating > 0 ? '#10b981' : '#1D4ED8',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = communityRating > 0 ? '#059669' : '#1e40af';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = communityRating > 0 ? '#10b981' : '#1D4ED8';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {communityRating > 0 ? 'Update Community Rating' : 'Rate This Community'}
                </button>
              </div>
            )}
          </div>

          {/* Host Info Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '1.5rem'
            }}>
              Host
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <img 
                src={trip.hostImage} 
                alt={trip.hostName}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1e293b' }}>
                    {trip.hostName}
                  </span>
                  {trip.verified && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1D4ED8" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbbf24"/>
                  </svg>
                  <span style={{ fontSize: '0.9375rem', color: '#64748b', fontWeight: '600' }}>
                    {trip.averageRating || trip.organizerRating || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '1.5rem'
            }}>
              Members ({isUpcoming ? 0 : (trip.membersList.length || 0)})
            </h2>
            
            {isUpcoming ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                color: '#64748b'
              }}>
                <p style={{ margin: 0, fontSize: '0.9375rem' }}>
                  Members list will be available once the community starts on {trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'the start date'}.
                </p>
              </div>
            ) : trip.membersList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {trip.membersList.map((member) => (
                  <div key={member.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  >
                    <img 
                      src={member.image} 
                      alt={member.name}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                          {member.name}
                        </span>
                        {member.isHost && (
                          <span style={{
                            backgroundColor: '#1D4ED8',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '50px',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}>
                            Host
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                color: '#64748b'
              }}>
                <p style={{ margin: 0, fontSize: '0.9375rem' }}>
                  No members yet. Be the first to join!
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Community Rating Modal */}
      {showRatingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}
        onClick={() => {
          setShowRatingModal(false);
          setTempRating(0);
          setFeedbackAnswers({
            question1: '',
            question2: '',
            question3: '',
            question4: ''
          });
        }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowRatingModal(false);
                setTempRating(0);
                setFeedbackAnswers({
                  question1: '',
                  question2: '',
                  question3: '',
                  question4: ''
                });
              }}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '0.5rem'
              }}>
                Rate This Community
              </h2>
              <p style={{
                fontSize: '1rem',
                color: '#64748b',
                margin: 0
              }}>
                Help us improve by sharing your experience
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                Overall Rating
              </label>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setTempRating(star)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <svg 
                      width="40" 
                      height="40" 
                      viewBox="0 0 24 24" 
                      fill={star <= tempRating ? "#fbbf24" : "#e5e7eb"} 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </button>
                ))}
              </div>
              {tempRating > 0 && (
                <p style={{
                  textAlign: 'center',
                  fontSize: '1rem',
                  color: '#1e293b',
                  fontWeight: '600',
                  margin: 0
                }}>
                  {tempRating} {tempRating === 1 ? 'star' : 'stars'}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  1. How was the trip planning and organization?
                </label>
                <textarea
                  value={feedbackAnswers.question1}
                  onChange={(e) => setFeedbackAnswers({ ...feedbackAnswers, question1: e.target.value })}
                  placeholder="Share your thoughts..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1D4ED8';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  2. How was the communication with the host?
                </label>
                <textarea
                  value={feedbackAnswers.question2}
                  onChange={(e) => setFeedbackAnswers({ ...feedbackAnswers, question2: e.target.value })}
                  placeholder="Share your thoughts..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1D4ED8';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  3. How would you rate the overall experience?
                </label>
                <textarea
                  value={feedbackAnswers.question3}
                  onChange={(e) => setFeedbackAnswers({ ...feedbackAnswers, question3: e.target.value })}
                  placeholder="Share your thoughts..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1D4ED8';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  4. Any suggestions for improvement?
                </label>
                <textarea
                  value={feedbackAnswers.question4}
                  onChange={(e) => setFeedbackAnswers({ ...feedbackAnswers, question4: e.target.value })}
                  placeholder="Share your thoughts..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1D4ED8';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleSubmitRating}
              disabled={tempRating === 0}
              style={{
                width: '100%',
                backgroundColor: tempRating > 0 ? '#1D4ED8' : '#cbd5e1',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '50px',
                border: 'none',
                fontSize: '1.125rem',
                fontWeight: '700',
                cursor: tempRating > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (tempRating > 0) {
                  e.currentTarget.style.backgroundColor = '#1e40af';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (tempRating > 0) {
                  e.currentTarget.style.backgroundColor = '#1D4ED8';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              Submit Rating & Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

