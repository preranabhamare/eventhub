import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Orgevent() {
  const navigate = useNavigate();
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
          setCurrentUser(data.user);
          // Pre-fill email and phone from user profile
          setFormData(prev => ({
            ...prev,
            email: data.user.email,
            phone: data.user.phone || ''
          }));
        } else {
          navigate('/');
        }
      })
      .catch(error => {
        console.error('Error fetching user:', error);
        navigate('/');
      });
  }, [navigate]);





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
      alert('Please log in to create an event');
      return;
    }

    const formDataToSend = new FormData();

    // Add text fields
    formDataToSend.append('organizer_id', currentUser._id);
    formDataToSend.append('title', formData.eventName);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('event_date', formData.eventDate || new Date().toISOString().split('T')[0]);
    formDataToSend.append('event_time', formData.eventTime || '');
    formDataToSend.append('duration', formData.duration || '');
    formDataToSend.append('location_type', formData.locationType);
    formDataToSend.append('location_address', formData.locationAddress || '');
    formDataToSend.append('organizer_name', currentUser.full_name);
    formDataToSend.append('organizer_email', formData.email);
    formDataToSend.append('organizer_phone', formData.phone);
    formDataToSend.append('team_required', formData.isTeamEvent.toString());
    formDataToSend.append('is_paid', formData.isPaid.toString());
    formDataToSend.append('status', 'draft');

    // Add file fields
    if (formData.banner && formData.banner[0]) {
      formDataToSend.append('banner', formData.banner[0]);
    }
    if (formData.morePhotos && formData.morePhotos.length > 0) {
      for (let i = 0; i < formData.morePhotos.length; i++) {
        formDataToSend.append('morePhotos', formData.morePhotos[i]);
      }
    }

    try {
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend,
      });
      const result = await response.json();
      if (response.ok) {
        alert('Event created successfully');
        navigate('/profile'); // Navigate to profile page after successful event creation
      } else {
        alert('Error: ' + (result.error || 'Failed to create event'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating event');
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      fontFamily: 'Poppins, sans-serif',
      background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)',
      minHeight: '100vh',
      padding: '40px 20px',
      display: 'flex',
      justifyContent: 'center'
    }}>
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
          Organize Your Event 🎉
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

          {/* Banner upload */}
          <div>
            <label style={{ color: '#A78BFA', fontWeight: 'bold' }}>Upload Event Banner</label>
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
              This image will appear on Home page
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
            <label style={{ color: '#A78BFA', fontWeight: 'bold' }}>Upload More Photos</label>
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
              These photos will be visible after clicking the event
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

          {/* Email - pre-filled */}
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

          {/* Phone - pre-filled */}
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

          {/* Register button */}
          <button
            type="submit"
            style={{
              padding: '12px 0',
              border: 'none',
              borderRadius: '25px',
              background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '10px',
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
            Register Your Event
          </button>
        </form>


      </div>
    </div>
  );
}

export default Orgevent;
