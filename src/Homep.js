import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Reusable Banner with login page style
function Banner({ title, subtitle, id, banner }) {
  const navigate = useNavigate();
  const handleBannerClick = () => navigate(`/event/${id}`);

  return (
    <div
      onClick={handleBannerClick}
      style={{
        borderRadius: '10px',
        cursor: 'pointer',
        maxWidth: '700px',
        margin: '20px auto',
        padding: '25px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        border: '1px solid #8B5CF6',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
    >
      <h2 style={{ fontSize: '28px', margin: '0 0 10px', color: '#8B5CF6' }}>{title}</h2>
      <p style={{ fontSize: '16px', margin: '0 0 15px', color: '#A78BFA' }}>{subtitle}</p>
      {banner && (
        <img
          src={`http://localhost:5000${banner}`}
          alt={title}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '15px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        />
      )}
      <button
        onClick={handleBannerClick}
        style={{
          padding: '10px 22px',
          border: 'none',
          borderRadius: '6px',
          backgroundColor: '#8B5CF6',
          color: '#fff',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 3px 10px rgba(139, 92, 246, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#A78BFA';
          e.currentTarget.style.boxShadow = '0 5px 15px rgba(139, 92, 246, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#8B5CF6';
          e.currentTarget.style.boxShadow = '0 3px 10px rgba(139, 92, 246, 0.3)';
        }}
      >
        Call to Action
      </button>
    </div>
  );
}

function Homep() {
  const navigate = useNavigate();
  const location = useLocation();
  const [banners, setBanners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchEvents = () => {
      fetch('http://localhost:5000/api/events')
        .then(response => response.json())
        .then(data => setBanners(data))
        .catch(error => console.error('Error fetching events:', error));
    };

    fetchEvents();
  }, [location.pathname]);

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (banner.description && banner.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{
      fontFamily: 'Poppins, sans-serif',
      background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)',
      minHeight: '100vh',
      paddingBottom: '40px'
    }}>
      {/* Top bar with profile circle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px 20px' }}>
        <button
          onClick={() => navigate('/profile')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#8B5CF6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 3px 10px rgba(139, 92, 246, 0.3)'
          }}
          title="Profile"
        >
          P
        </button>
      </div>

      <h1 style={{ textAlign: 'center', color: '#8B5CF6', marginTop: '10px', fontSize: '32px', fontWeight: 'bold' }}>Welcome to EventHub</h1>

      {/* Search bar */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '12px 15px',
            width: '300px',
            borderRadius: '25px',
            border: '1px solid #8B5CF6',
            outline: 'none',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)',
            transition: 'all 0.2s ease',
            background: '#fff'
          }}
        />
      </div>

      {filteredBanners.map((banner) => (
        <Banner
          key={banner._id}
          id={banner._id}
          title={banner.title}
          subtitle={banner.description || 'No description'}
          banner={banner.banner_url}
        />
      ))}
    </div>
  );
}

export default Homep;
