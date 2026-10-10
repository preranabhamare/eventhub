import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QrCodeScanner from "./QrCodeScanner";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar_url: "",
    profile_photo: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar_url: "",
    profile_photo: ""
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [soldTickets, setSoldTickets] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [eventTicketCounts, setEventTicketCounts] = useState({});
  const [selectedEventTickets, setSelectedEventTickets] = useState([]);
  const [showTickets, setShowTickets] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showBookings, setShowBookings] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [selectedEventForScan, setSelectedEventForScan] = useState(null);
  const [scannerReady, setScannerReady] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Set scanner ready after component mounts
  useEffect(() => {
    setScannerReady(true);
  }, []);

  // Fetch sold tickets for all user's events
  const fetchSoldTickets = async () => {
    if (userEvents.length === 0) return;

    const allTickets = [];
    for (const event of userEvents) {
      try {
        const response = await fetch(`http://localhost:5000/api/tickets/event/${event._id}`);
        if (response.ok) {
          const tickets = await response.json();
          allTickets.push(...tickets);
        }
      } catch (error) {
        console.error('Error fetching tickets for event:', event._id, error);
      }
    }
    setSoldTickets(allTickets);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    fetch('http://localhost:5000/api/auth/loggedIn', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          navigate('/');
        }
      })
      .catch(error => {
        console.error('Error fetching user:', error);
        navigate('/');
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser({
      full_name: "",
      email: "",
      phone: "",
      avatar_url: "",
      profile_photo: ""
    });
    navigate('/');
  };

  const handleEdit = () => {
    setEditedUser({ ...user });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in again');
      navigate('/');
      return;
    }

    try {
      let profilePhotoUrl = editedUser.profile_photo;

      if (profilePhotoFile) {
        const formData = new FormData();
        formData.append('image', profilePhotoFile);

        const uploadResponse = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          profilePhotoUrl = uploadData.imageUrl;
        } else {
          alert('Failed to upload profile photo');
          return;
        }
      }

      const updatedUser = { ...editedUser, profile_photo: profilePhotoUrl };

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedUser)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsEditing(false);
        setProfilePhotoFile(null);
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Fetch user's events
  const fetchUserEvents = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/events/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const events = await response.json();
        setUserEvents(events);
      }
    } catch (error) {
      console.error('Error fetching user events:', error);
    }
  };

  // Update event status
  const handleStatusToggle = async (eventId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setUserEvents(events =>
          events.map(event =>
            event._id === eventId ? { ...event, status: newStatus } : event
          )
        );
        alert(`Event is now ${newStatus === 'active' ? 'live' : 'not live'}`);
      } else {
        alert('Failed to update event status');
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      alert('Error updating event status');
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setUserEvents(events => events.filter(event => event._id !== eventId));
        alert('Event deleted successfully');
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event');
    }
  };

  // View tickets for event
  const handleViewTickets = async (event) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tickets/event/${event._id}`);

      if (response.ok) {
        const tickets = await response.json();
        setSelectedEventTickets(tickets);
        setSelectedEvent(event);
        setShowTickets(true);
      } else {
        alert('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      alert('Error fetching tickets');
    }
  };

  // Close tickets modal
  const handleCloseTickets = () => {
    setShowTickets(false);
    setSelectedEventTickets([]);
    setSelectedEvent(null);
  };

  // Fetch events when user is loaded
  useEffect(() => {
    if (user._id) {
      fetchUserEvents();
      fetchUserBookings();
    }
  }, [user._id]);

  // Fetch events when component mounts (for navigation from other pages)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user._id) {
      fetchUserEvents();
      fetchUserBookings();
    }
  }, [user._id]);

  // Fetch sold tickets when userEvents are loaded
  useEffect(() => {
    if (userEvents.length > 0) {
      fetchSoldTickets();
    }
  }, [userEvents]);

  // Fetch user's bookings
  const fetchUserBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tickets/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const bookings = await response.json();
        setUserBookings(bookings);
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    }
  };

  // Handle QR scan
  const handleScan = (data) => {
    if (data && !scanning) {
      setScanning(true);
      setScanResult(data.text);
      markAttendance(data.text).finally(() => setScanning(false));
    }
  };

  const handleScanError = (err) => {
    console.error('QR scan error:', err);
  };

  // Mark attendance via QR scan
  const markAttendance = async (qrData) => {
    try {
      const response = await fetch('http://localhost:5000/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ qrData })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Attendance marked successfully!\nTicket: ${data.ticket.ticket_number}\nAttendee: ${data.ticket.attendee_name}\nEvent: ${data.ticket.event_title}`);
        setShowScanner(false);
        setScanResult('');
        // Refresh tickets to show updated status
        if (selectedEvent) {
          handleViewTickets(selectedEvent);
        }
      } else {
        alert(data.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Error marking attendance');
    }
  };

  // Show bookings modal
  const handleShowBookings = () => {
    setShowBookings(true);
  };

  // Close bookings modal
  const handleCloseBookings = () => {
    setShowBookings(false);
  };

  // Show QR scanner
  const handleShowScanner = () => {
    setShowScanner(true);
    setScanResult('');
    setScanning(false);
  };

  // Close QR scanner
  const handleCloseScanner = () => {
    setShowScanner(false);
    setScanResult('');
    setScanning(false);
  };

  return (
    <div style={{
      fontFamily: 'Poppins, sans-serif',
      background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)',
      minHeight: '100vh',
      padding: '20px 0'
    }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: '0 20px 20px',
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: '#8B5CF6',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              fontSize: '18px',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
            }}
          >
            ←
          </button>
          <h1 style={{
            color: '#8B5CF6',
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            My Profile
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '400px 1fr', gap: '30px', padding: '0 20px' }}>

        {/* Profile Section */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3), 0 6px 6px rgba(0,0,0,0.1)',
          textAlign: 'center',
          height: 'fit-content'
        }}>
          {/* Profile Picture */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '4px solid #8B5CF6',
              marginBottom: '20px',
              boxShadow: '0 6px 12px rgba(139, 92, 246, 0.3)',
              backgroundColor: '#8B5CF6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#fff'
            }}
          >
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>

          {/* User Info */}
          {isEditing ? (
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                value={editedUser.full_name}
                onChange={(e) => setEditedUser({ ...editedUser, full_name: e.target.value })}
                placeholder="Full Name"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
                  border: '1px solid #8B5CF6',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <input
                type="email"
                value={editedUser.email}
                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                placeholder="Email"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
                  border: '1px solid #8B5CF6',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <input
                type="tel"
                value={editedUser.phone}
                onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                placeholder="Phone"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
                  border: '1px solid #8B5CF6',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            
              
            </div>
          ) : (
            <>
              <h2 style={{ color: '#8B5CF6', marginBottom: '10px' }}>{user.full_name}</h2>
              <p style={{ color: '#A78BFA', margin: '5px 0' }}>Email: {user.email}</p>
              <p style={{ color: '#A78BFA', margin: '5px 0 20px 0' }}>Phone: {user.phone}</p>
            </>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '12px 0',
                    border: 'none',
                    borderRadius: '25px',
                    background: 'linear-gradient(90deg, #10B981, #059669)',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 5px 15px rgba(16, 185, 129, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(16, 185, 129, 0.4)';
                  }}
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: '12px 0',
                    border: '1px solid #8B5CF6',
                    borderRadius: '25px',
                    background: 'transparent',
                    color: '#8B5CF6',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#8B5CF6';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#8B5CF6';
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                style={{
                  padding: '12px 0',
                  border: 'none',
                  borderRadius: '25px',
                  background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 5px 15px rgba(139, 92, 246, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(139, 92, 246, 0.4)';
                }}
              >
                Edit Profile
              </button>
            )}

            <button
              onClick={() => navigate('/orgevent')}
              style={{
                padding: '12px 0',
                border: 'none',
                borderRadius: '25px',
                background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 5px 15px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(139, 92, 246, 0.4)';
              }}
            >
              Organize Event
            </button>

            <button
              onClick={handleShowBookings}
              style={{
                padding: '12px 0',
                border: 'none',
                borderRadius: '25px',
                background: 'linear-gradient(90deg, #F59E0B, #D97706)',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 5px 15px rgba(245, 158, 11, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(245, 158, 11, 0.4)';
              }}
            >
              My Bookings
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: '12px 0',
                border: 'none',
                borderRadius: '25px',
                background: 'linear-gradient(90deg, #EF4444, #DC2626)',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 5px 15px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(239, 68, 68, 0.4)';
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Events Section */}
        <div>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3), 0 6px 6px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h2 style={{ color: '#8B5CF6', marginBottom: '20px' }}>My Events</h2>

            {userEvents.length === 0 ? (
              <p style={{ color: '#A78BFA', textAlign: 'center', padding: '40px' }}>
                You haven't organized any events yet. Click "Organize Event" to create your first event!
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {userEvents.map(event => (
                  <div key={event._id} style={{
                    border: '1px solid #EDE9FE',
                    borderRadius: '8px',
                    padding: '20px',
                    background: '#FAFAFA'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <div>
                        <h3 style={{ color: '#8B5CF6', margin: '0 0 5px 0' }}>{event.title}</h3>
                        <p style={{ color: '#A78BFA', margin: '0 0 5px 0', fontSize: '14px' }}>
                          {new Date(event.event_date).toLocaleDateString()} • {event.event_time || 'TBD'} • Duration: {event.duration || 'TBD'}
                        </p>
                        <p style={{ color: '#A78BFA', margin: 0, fontSize: '14px' }}>
                          {event.location_type === 'offline' ? `Location: ${event.location_address || 'TBD'}` : 'Online Event'}
                        </p>
                      </div>
                      <span style={{
                        background: event.status === 'active' ? '#10B981' : '#EF4444',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {event.status === 'active' ? 'LIVE' : 'NOT LIVE'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleStatusToggle(event._id, event.status)}
                        style={{
                          padding: '8px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          background: event.status === 'active' ? '#EF4444' : '#10B981',
                          color: '#fff',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {event.status === 'active' ? 'Set Not Live' : 'Set Live'}
                      </button>

                      <button
                        onClick={() => handleViewTickets(event)}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #8B5CF6',
                          borderRadius: '6px',
                          background: 'transparent',
                          color: '#8B5CF6',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        View Tickets
                      </button>

                      <button
                        onClick={() => navigate(`/edit-event/${event._id}`)}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #8B5CF6',
                          borderRadius: '6px',
                          background: 'transparent',
                          color: '#8B5CF6',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Edit Event
                      </button>

                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        style={{
                          padding: '8px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          background: '#EF4444',
                          color: '#fff',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Delete Event
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tickets Modal */}
      {showTickets && selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '90%',
            boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#8B5CF6', margin: 0 }}>Tickets for {selectedEvent.title}</h2>
              <button
                onClick={handleCloseTickets}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#8B5CF6'
                }}
              >
                ×
              </button>
            </div>

            {selectedEventTickets.length === 0 ? (
              <p style={{ color: '#A78BFA', textAlign: 'center', padding: '40px' }}>
                No tickets sold yet for this event.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {selectedEventTickets.map(ticket => (
                  <div key={ticket._id} style={{
                    border: '1px solid #EDE9FE',
                    borderRadius: '8px',
                    padding: '15px',
                    background: '#FAFAFA'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ color: '#8B5CF6', margin: '0 0 5px 0' }}>{ticket.ticket_number}</h4>
                        <p style={{ color: '#4C1D95', margin: '0 0 5px 0', fontWeight: 'bold' }}>{ticket.attendee_name}</p>
                        {ticket.team_name && (
                          <p style={{ color: '#A78BFA', margin: '0 0 5px 0', fontSize: '14px' }}>Team: {ticket.team_name}</p>
                        )}
                        <p style={{ color: '#A78BFA', margin: 0, fontSize: '14px' }}>
                          {ticket.ticket_type} • ₹{ticket.price}
                        </p>
                      </div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#8B5CF6',
                        fontFamily: 'monospace'
                      }}>
                        {ticket.qr_code_data.substring(0, 20)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookings Modal */}
      {showBookings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '90%',
            boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#8B5CF6', margin: 0 }}>My Bookings</h2>
              <button
                onClick={handleCloseBookings}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#8B5CF6'
                }}
              >
                ×
              </button>
            </div>

            {userBookings.length === 0 ? (
              <p style={{ color: '#A78BFA', textAlign: 'center', padding: '40px' }}>
                You haven't booked any tickets yet.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {userBookings.map(booking => (
                  <div key={booking._id} style={{
                    border: '1px solid #EDE9FE',
                    borderRadius: '8px',
                    padding: '15px',
                    background: '#FAFAFA'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ color: '#8B5CF6', margin: '0 0 5px 0' }}>{booking.ticket_number}</h4>
                        <p style={{ color: '#4C1D95', margin: '0 0 5px 0', fontWeight: 'bold' }}>{booking.event_title}</p>
                        <p style={{ color: '#A78BFA', margin: '0 0 5px 0', fontSize: '14px' }}>
                          {new Date(booking.event_date).toLocaleDateString()} • {booking.event_time || 'TBD'}
                        </p>
                        <p style={{ color: '#A78BFA', margin: 0, fontSize: '14px' }}>
                          {booking.ticket_type} • ₹{booking.price}
                        </p>
                      </div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: booking.attendance_marked ? '#10B981' : '#EF4444',
                        fontFamily: 'monospace'
                      }}>
                        {booking.attendance_marked ? '✓' : '✗'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#8B5CF6', margin: 0 }}>Scan QR Code</h2>
              <button
                onClick={handleCloseScanner}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#8B5CF6'
                }}
              >
                ×
              </button>
            </div>

            {scannerReady && (
              <QrCodeScanner onScan={handleScan} onError={handleScanError} />
            )}

            {scanResult && (
              <p style={{ color: '#8B5CF6', marginTop: '20px', fontSize: '14px' }}>
                Scanned: {scanResult}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
