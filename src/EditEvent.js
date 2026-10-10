import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    banner: null,
    morePhotos: null,
    isPaid: false,
    isTeamEvent: false,
    email: "",
    phone: "",
    eventDate: "",
    eventTime: "",
    duration: "",
    locationType: "offline",
    locationAddress: ""
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Fetch user data
    fetch('http://localhost:5000/api/auth/loggedIn', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
        } else {
          navigate('/');
        }
      })
      .catch(error => {
        console.error('Error fetching user:', error);
        navigate('/');
      });

    // Fetch event data
    fetch(`http://localhost:5000/api/events/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data) {
          setFormData({
            eventName: data.title || "",
            description: data.description || "",
            banner: null, // Can't pre-fill file inputs
            morePhotos: null,
            isPaid: data.is_paid || false,
            isTeamEvent: data.team_required || false,
            email: data.organizer_email || "",
            phone: data.organizer_phone || "",
            eventDate: data.event_date ? new Date(data.event_date).toISOString().split('T')[0] : "",
            eventTime: data.event_time || "",
            duration: data.duration || "",
            locationType: data.location_type || "offline",
            locationAddress: data.location_address || ""
          });
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching event:', error);
        setLoading(false);
      });
  }, [navigate, id]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, [name]: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in to update the event');
      return;
    }

    const formDataToSend = new FormData();

    // Add text fields
    formDataToSend.append('title', formData.eventName);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('event_date', formData.eventDate || new Date().toISOString().split('T')[0]);
    formDataToSend.append('event_time', formData.eventTime || '');
    formDataToSend.append('duration', formData.duration || '');
    formDataToSend.append('location_type', formData.locationType);
    formDataToSend.append('location_address', formData.locationAddress || '');
    formDataToSend.append('organizer_email', formData.email);
    formDataToSend.append('organizer_phone', formData.phone);
    formDataToSend.append('team_required', formData.isTeamEvent.toString());
    formDataToSend.append('is_paid', formData.isPaid.toString());

    // Add file fields (only if new files are selected)
    if (formData.banner && formData.banner[0]) {
      formDataToSend.append('banner', formData.banner[0]);
    }
    if (formData.morePhotos && formData.morePhotos.length > 0) {
      for (let i = 0; i < formData.morePhotos.length; i++) {
        formDataToSend.append('morePhotos', formData.morePhotos[i]);
      }
    }

    try {
      const response = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend,
      });
      const result = await response.json();
      if (response.ok) {
        alert('Event updated successfully');
        navigate('/profile');
      } else {
        alert('Error: ' + (result.error || 'Failed to update event'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating event');
    }
  };

  if (loading || !currentUser) {
    return (
      <div style={{
        fontFamily: 'Poppins, sans-serif',
        background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ color: '#8B5CF6', fontSize: '24px' }}>Loading...</div>
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
            Edit Event
          </h1>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '30px',
          width: '500px',
          boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3), 0 6px 6px rgba(0,0,0,0.1)'
        }}>
          {/* Cute heading */}
          <h1 style={{
            textAlign: 'center',
            color: '#8B5CF6',
            marginBottom: '25px',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>
            Edit Your Event ✏️
          </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

          {/* Banner upload */}
          <div>
            <label style={{ color: '#A78BFA', fontWeight: 'bold' }}>Update Event Banner (optional)</label>
            <input
              type="file"
              name="banner"
              accept="image/*"
              onChange={handleChange}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #8B5CF6',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
              }}
            />
            <span style={{ display: 'block', marginTop: '5px', color: '#4C1D95', fontStyle: 'italic' }}>
              Leave empty to keep current banner
            </span>
          </div>

          {/* Event name */}
          <input
            type="text"
            name="eventName"
            placeholder="Event Name"
            value={formData.eventName}
            onChange={handleChange}
            required
            style={{
              padding: '12px',
              borderRadius: '25px',
              border: '1px solid #8B5CF6',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
            }}
          />

          {/* Description */}
          <textarea
            name="description"
            placeholder="Event Description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            style={{
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #8B5CF6',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)',
              resize: 'vertical'
            }}
          />

          {/* More photos upload */}
          <div>
            <label style={{ color: '#A78BFA', fontWeight: 'bold' }}>Add More Photos (optional)</label>
            <input
              type="file"
              name="morePhotos"
              accept="image/*"
              multiple
              onChange={handleChange}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #8B5CF6',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
              }}
            />
            <span style={{ display: 'block', marginTop: '5px', color: '#4C1D95', fontStyle: 'italic' }}>
              These will be added to existing photos
            </span>
          </div>

          {/* Is Paid */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A78BFA' }}>
            <input
              type="checkbox"
              name="isPaid"
              checked={formData.isPaid}
              onChange={handleChange}
            />
            Does this event require payment?
          </label>

          {/* Team event */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A78BFA' }}>
            <input
              type="checkbox"
              name="isTeamEvent"
              checked={formData.isTeamEvent}
              onChange={handleChange}
            />
            Is this a team event?
          </label>

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Contact Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              padding: '12px',
              borderRadius: '25px',
              border: '1px solid #8B5CF6',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
            }}
          />

          {/* Phone */}
          <input
            type="tel"
            name="phone"
            placeholder="Contact Phone"
            value={formData.phone}
            onChange={handleChange}
            required
            style={{
              padding: '12px',
              borderRadius: '25px',
              border: '1px solid #8B5CF6',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
            }}
          />

          {/* Event Date */}
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            required
            style={{
              padding: '12px',
              borderRadius: '25px',
              border: '1px solid #8B5CF6',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
            }}
          />

          {/* Event Time */}
          <input
            type="time"
            name="eventTime"
            value={formData.eventTime}
            onChange={handleChange}
            style={{
              padding: '12px',
              borderRadius: '25px',
              border: '1px solid #8B5CF6',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
            }}
          />

          {/* Duration */}
          <input
            type="text"
            name="duration"
            placeholder="Event Duration (e.g., 2 hours)"
            value={formData.duration}
            onChange={handleChange}
            style={{
              padding: '12px',
              borderRadius: '25px',
              border: '1px solid #8B5CF6',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
            }}
          />

          {/* Location Type */}
          <select
            name="locationType"
            value={formData.locationType}
            onChange={handleChange}
            style={{
              padding: '12px',
              borderRadius: '25px',
              border: '1px solid #8B5CF6',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
            }}
          >
            <option value="offline">Offline</option>
            <option value="online">Online</option>
          </select>

          {/* Location Address */}
          {formData.locationType === 'offline' && (
            <input
              type="text"
              name="locationAddress"
              placeholder="Location Address"
              value={formData.locationAddress}
              onChange={handleChange}
              required
              style={{
                padding: '12px',
                borderRadius: '25px',
                border: '1px solid #8B5CF6',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
              }}
            />
          )}

          {/* Update button */}
          <button
            type="submit"
            style={{
              padding: '12px 0',
              border: 'none',
              borderRadius: '25px',
              background: 'linear-gradient(90deg, #10B981, #059669)',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '10px',
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
            Update Event
          </button>

          {/* Cancel button */}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            style={{
              padding: '12px 0',
              border: '1px solid #8B5CF6',
              borderRadius: '25px',
              background: 'transparent',
              color: '#8B5CF6',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '10px',
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
        </form>
        </div>
      </div>
    </div>
  );
}

export default EditEvent;
