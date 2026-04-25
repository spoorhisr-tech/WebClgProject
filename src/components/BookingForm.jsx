import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Loader2 } from 'lucide-react'

const BookingForm = (props) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    vehicle_model: '',
    service_type: 'Full Service',
    preferred_date: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('bookings')
        .insert([{ 
          ...formData, 
          user_id: props.user.id 
        }])

      if (error) throw error
      
      alert('You successfully confirmed the ticket!')
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        vehicle_model: '',
        service_type: 'Full Service',
        preferred_date: ''
      })
    } catch (error) {
      console.error('Submission error:', error.message)
      alert(`Supabase Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Full Name</label>
        <input 
          type="text" 
          name="full_name" 
          placeholder="Jane Cooper" 
          value={formData.full_name}
          onChange={handleChange}
          required 
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            name="email" 
            placeholder="jane@example.com" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input 
            type="tel" 
            name="phone" 
            placeholder="+1 (555) 000-0000" 
            value={formData.phone}
            onChange={handleChange}
            required 
          />
        </div>
      </div>

      <div className="form-group">
        <label>Vehicle Model</label>
        <input 
          type="text" 
          name="vehicle_model" 
          placeholder="Porsche Taycan / Tesla Model 3" 
          value={formData.vehicle_model}
          onChange={handleChange}
          required 
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Service Type</label>
          <select 
            name="service_type" 
            value={formData.service_type}
            onChange={handleChange}
            required
          >
            <option>Full Service</option>
            <option>Oil Change</option>
            <option>Brake Inspection</option>
            <option>Diagnostics</option>
          </select>
        </div>
        <div className="form-group">
          <label>Preferred Date</label>
          <input 
            type="date" 
            name="preferred_date" 
            value={formData.preferred_date}
            onChange={handleChange}
            required 
          />
        </div>
      </div>

      <button type="submit" className="btn-primary btn-block" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
      </button>
      
      <style>{`
        .form-grid { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .btn-block { width: 100%; margin-top: 1rem; display: flex; justify-content: center; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } }
      `}</style>
    </form>
  )
}

export default BookingForm
