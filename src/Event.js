import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import QRCode from "qrcode.react";

function Event() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState('apply'); // 'apply', 'team', 'payment', 'ticket'
  const [teamMembers, setTeamMembers] = useState([{ name: '', email: '', phone: '' }]);
  const [paymentData, setPaymentData] = useState({ cardNumber: '', expiry: '', cvv: '', name: '' });
  const [generatedTicket, setGeneratedTicket] = useState(null);

  useEffect(() => {
    // Fetch event
    fetch(`http://localhost:5000/api/events/${id}`)
      .then(response => response.json())
      .then(data => {
        setEvent(data);
      })
      .catch(error => {
        console.error('Error fetching event:', error);
      });

    // Fetch user info
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/auth/loggedIn', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(error => {
        console.error('Error fetching user:', error);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id]);

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: '', email: '', phone: '' }]);
  };

  const handleTeamChange = (index, field, value) => {
    const updated = teamMembers.map((member, i) =>
      i === index ? { ...member, [field]: value } : member
    );
    setTeamMembers(updated);
  };

  const handlePaymentChange = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyNow = () => {
    if (event.team_required) {
      setCurrentStep('team');
    } else if (event.is_paid) {
      setCurrentStep('payment');
    } else {
      handleGenerateTicket();
    }
  };

  const handleTeamSubmit = () => {
    if (event.is_paid) {
      setCurrentStep('payment');
    } else {
      handleGenerateTicket();
    }
  };

  const handlePaymentSubmit = () => {
    handleGenerateTicket();
  };

  const handleGenerateTicket = async () => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      alert('Please log in to apply');
      return;
    }

    try {
      // Create registration
      const registrationData = {
        event_id: id,
        user_id: user._id,
        registration_type: event.team_required ? 'team' : 'individual',
        team_name: event.team_required ? 'Team ' + Date.now() : undefined,
        team_size: event.team_required ? teamMembers.filter(m => m.name).length : undefined,
        payment_status: event.is_paid ? 'completed' : 'completed',
        payment_amount: event.is_paid ? event.ticket_price : 0,
        checked_in: false
      };

      const regResponse = await fetch('http://localhost:5000/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData),
      });

      const registrationResult = await regResponse.json();
      if (!regResponse.ok) {
        alert('Registration failed: ' + (registrationResult.error || registrationResult.message));
        return;
      }

      console.log('Registration created:', registrationResult);

      const registrationId = registrationResult.registration._id;

      // Add team members if required
      if (event.team_required) {
        for (const member of teamMembers.filter(m => m.name)) {
          await fetch('http://localhost:5000/api/team-members', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              registration_id: registrationId,
              ...member
            }),
          });
        }
      }

      // Generate ticket
      const ticketData = {
        registration_id: registrationId,
        event_title: event.title,
        attendee_name: user.full_name,
        event_date: event.event_date,
        event_time: event.event_time,
        location: event.location_address || event.online_link || event.location_type,
        ticket_type: event.team_required ? 'team' : 'individual',
        team_name: event.team_required ? registrationData.team_name : undefined,
        price: event.ticket_price || 0
      };

      console.log('Ticket data:', ticketData);

      const ticketResponse = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticketData),
      });

      const ticketResult = await ticketResponse.json();
      if (ticketResponse.ok) {
        setGeneratedTicket(ticketResult.ticket);
        setCurrentStep('ticket');
      } else {
        alert('Ticket generation failed: ' + (ticketResult.error || ticketResult.message));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error during application process: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div style={{
        fontFamily: 'Poppins, sans-serif',
        background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#8B5CF6', fontSize: '18px' }}>Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{
        fontFamily: 'Poppins, sans-serif',
        background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#8B5CF6', fontSize: '18px' }}>Event not found</div>
      </div>
    );
  }

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
            onClick={() => window.history.back()}
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
            {event.title}
          </h1>
        </div>
        <span style={{ color: '#A78BFA', fontSize: '14px' }}>{event.status.toUpperCase()}</span>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', padding: '0 20px' }}>
        {/* Main Content */}
        <div>
          {/* Hero Banner */}
          <div style={{
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '20px',
            boxShadow: '0 8px 20px rgba(139, 92, 246, 0.2)'
          }}>
            <img
              src={event.banner_url ? `http://localhost:5000${event.banner_url}` : "https://via.placeholder.com/800x400/F3E8FF/8B5CF6?text=Event+Banner"}
              alt={event.title}
              style={{ width: '100%', height: '300px', objectFit: 'contain' }}
            />
          </div>

          {/* Event Details */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.1)'
          }}>
            <h2 style={{ color: '#8B5CF6', marginBottom: '15px', fontSize: '20px' }}>Event Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ color: '#A78BFA', fontSize: '14px', fontWeight: 'bold' }}>Date</label>
                <p style={{ color: '#4C1D95', margin: '5px 0 0 0' }}>{new Date(event.event_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label style={{ color: '#A78BFA', fontSize: '14px', fontWeight: 'bold' }}>Time</label>
                <p style={{ color: '#4C1D95', margin: '5px 0 0 0' }}>{event.event_time || 'TBD'}</p>
              </div>
              <div>
                <label style={{ color: '#A78BFA', fontSize: '14px', fontWeight: 'bold' }}>Location Type</label>
                <p style={{ color: '#4C1D95', margin: '5px 0 0 0' }}>{event.location_type}</p>
              </div>
              {event.location_address && (
                <div>
                  <label style={{ color: '#A78BFA', fontSize: '14px', fontWeight: 'bold' }}>Address</label>
                  <p style={{ color: '#4C1D95', margin: '5px 0 0 0' }}>{event.location_address}</p>
                </div>
              )}
              {event.online_link && (
                <div>
                  <label style={{ color: '#A78BFA', fontSize: '14px', fontWeight: 'bold' }}>Online Link</label>
                  <a href={event.online_link} style={{ color: '#8B5CF6', margin: '5px 0 0 0', textDecoration: 'none' }}>Join Event</a>
                </div>
              )}
              {event.team_required && (
                <div>
                  <label style={{ color: '#A78BFA', fontSize: '14px', fontWeight: 'bold' }}>Team Size</label>
                  <p style={{ color: '#4C1D95', margin: '5px 0 0 0' }}>{event.min_team_size}-{event.max_team_size} members</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.1)'
          }}>
            <h2 style={{ color: '#8B5CF6', marginBottom: '15px', fontSize: '20px' }}>About the Event</h2>
            <p style={{ color: '#4C1D95', lineHeight: '1.6' }}>{event.description || 'No description available.'}</p>
          </div>

          {/* Photo Gallery */}
          {event.photo_urls && event.photo_urls.length > 0 && (
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.1)'
            }}>
              <h2 style={{ color: '#8B5CF6', marginBottom: '15px', fontSize: '20px' }}>Event Photos</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {event.photo_urls.map((url, index) => (
                  <img key={index} src={url.startsWith('http') ? url : `http://localhost:5000${url}`} alt={`Photo ${index + 1}`} style={{ width: '100%', borderRadius: '8px', height: '150px', objectFit: 'contain' }} />
                ))}
              </div>
            </div>
          )}

          {/* Organizer */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.1)'
          }}>
            <h2 style={{ color: '#8B5CF6', marginBottom: '15px', fontSize: '20px' }}>Organizer</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '20px'
              }}>
                {event.organizer_name?.charAt(0)}
              </div>
              <div>
                <p style={{ color: '#4C1D95', fontWeight: 'bold', margin: '0 0 5px 0' }}>{event.organizer_name}</p>
                <p style={{ color: '#A78BFA', margin: '0 0 5px 0' }}>{event.organizer_email}</p>
                {event.organizer_phone && <p style={{ color: '#A78BFA', margin: 0 }}>{event.organizer_phone}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Application */}
        <div style={{
          position: 'sticky',
          top: '20px',
          height: 'fit-content'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 8px 20px rgba(139, 92, 246, 0.2)'
          }}>
            {event.is_paid && (
              <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #EDE9FE' }}>
                <div style={{ color: '#A78BFA', fontSize: '14px', marginBottom: '5px' }}>Ticket Price</div>
                <div style={{ color: '#8B5CF6', fontSize: '28px', fontWeight: 'bold' }}>₹{event.ticket_price || 0}</div>
              </div>
            )}

            {/* Apply Now Button */}
            {currentStep === 'apply' && event.status === 'active' && (
              <button
                onClick={handleApplyNow}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: 'none',
                  borderRadius: '25px',
                  background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginBottom: '15px',
                  boxShadow: '0 5px 15px rgba(139, 92, 246, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(139, 92, 246, 0.4)';
                }}
              >
                Apply Now
              </button>
            )}

            {/* Event Not Live Message */}
            {currentStep === 'apply' && event.status !== 'active' && (
              <div style={{
                width: '100%',
                padding: '15px',
                borderRadius: '25px',
                background: '#F3E8FF',
                color: '#8B5CF6',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '15px',
                border: '2px solid #8B5CF6'
              }}>
                Event is not live yet
              </div>
            )}

            {/* Team Form */}
            {currentStep === 'team' && (
              <div>
                <h3 style={{ color: '#8B5CF6', marginBottom: '15px' }}>Team Members</h3>
                {teamMembers.map((member, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => handleTeamChange(index, 'name', e.target.value)}
                      style={{ padding: '10px', border: '1px solid #8B5CF6', borderRadius: '8px', outline: 'none' }}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={member.email}
                      onChange={(e) => handleTeamChange(index, 'email', e.target.value)}
                      style={{ padding: '10px', border: '1px solid #8B5CF6', borderRadius: '8px', outline: 'none' }}
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={member.phone}
                      onChange={(e) => handleTeamChange(index, 'phone', e.target.value)}
                      style={{ padding: '10px', border: '1px solid #8B5CF6', borderRadius: '8px', outline: 'none' }}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTeamMember}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#F3E8FF',
                    border: '1px solid #8B5CF6',
                    borderRadius: '8px',
                    color: '#8B5CF6',
                    cursor: 'pointer',
                    marginBottom: '15px'
                  }}
                >
                  + Add Another Member
                </button>
                <button
                  onClick={handleTeamSubmit}
                  style={{
                    width: '100%',
                    padding: '15px',
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
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(139, 92, 246, 0.4)';
                  }}
                >
                  Continue
                </button>
              </div>
            )}

            {/* Payment Form */}
            {currentStep === 'payment' && (
              <div>
                <h3 style={{ color: '#8B5CF6', marginBottom: '15px' }}>Payment Details</h3>
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <p style={{ color: '#A78BFA' }}>Amount: ₹{event.ticket_price}</p>
                </div>
                <input
                  type="text"
                  placeholder="Card Number"
                  value={paymentData.cardNumber}
                  onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #8B5CF6', borderRadius: '8px', marginBottom: '10px', outline: 'none' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={paymentData.expiry}
                    onChange={(e) => handlePaymentChange('expiry', e.target.value)}
                    style={{ padding: '10px', border: '1px solid #8B5CF6', borderRadius: '8px', outline: 'none' }}
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={paymentData.cvv}
                    onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                    style={{ padding: '10px', border: '1px solid #8B5CF6', borderRadius: '8px', outline: 'none' }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={paymentData.name}
                  onChange={(e) => handlePaymentChange('name', e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #8B5CF6', borderRadius: '8px', marginBottom: '15px', outline: 'none' }}
                />
                <button
                  onClick={handlePaymentSubmit}
                  style={{
                    width: '100%',
                    padding: '15px',
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
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(16, 185, 129, 0.4)';
                  }}
                >
                  Complete Payment
                </button>
              </div>
            )}

            {/* Ticket Display */}
            {currentStep === 'ticket' && generatedTicket && (
              <div>
                <h3 style={{ color: '#8B5CF6', marginBottom: '15px', textAlign: 'center' }}>Your Ticket</h3>
                <div style={{
                  border: '2px solid #8B5CF6',
                  borderRadius: '12px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, #F3E8FF, #EDE9FE)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B5CF6', marginBottom: '10px' }}>
                    {generatedTicket.ticket_number}
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: 'bold', color: '#4C1D95' }}>{generatedTicket.event_title}</div>
                    <div style={{ color: '#A78BFA', fontSize: '14px' }}>{generatedTicket.attendee_name}</div>
                    {generatedTicket.team_name && (
                      <div style={{ color: '#A78BFA', fontSize: '14px' }}>Team: {generatedTicket.team_name}</div>
                    )}
                  </div>
                  <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center' }}>
                    <img src={generatedTicket.qr_code_image} alt="QR Code" style={{ width: '128px', height: '128px' }} />
                  </div>
                  <div style={{ color: '#A78BFA', fontSize: '12px' }}>
                    Show this QR code at the event entrance
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #8B5CF6',
                    borderRadius: '25px',
                    background: 'transparent',
                    color: '#8B5CF6',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '15px',
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
                  Print Ticket
                </button>
              </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'center', color: '#A78BFA', fontSize: '12px' }}>
              <div style={{ marginBottom: '5px' }}>✓ Instant Ticket Generation</div>
              <div>✓ Secure & Easy Process</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Event;
