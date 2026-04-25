import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Clock, CheckCircle2 } from 'lucide-react'

const BookingList = (props) => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()

    // Real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => fetchBookings()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', props.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Fetch error:', error.message)
      setBookings([{id: 'error', error: true, message: error.message}])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Syncing with database...</div>

  return (
    <div className="bookings-grid">
      {bookings.length === 0 ? (
        <div className="empty-state">No active bookings found.</div>
      ) : bookings[0].error ? (
        <div className="empty-state error-message">
          <p>Database Error: {bookings[0].message}</p>
          <small>Ensure you have created the 'bookings' table in Supabase.</small>
        </div>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="glass-panel booking-list-card">
            <div className="card-status">
              {booking.status === 'Completed' ? 
                <CheckCircle2 className="status-icon success" /> : 
                <Clock className="status-icon pending" />
              }
              <span>{booking.status || 'Scheduled'}</span>
            </div>
            <div className="card-body">
              <h3>{booking.vehicle_model}</h3>
              <p className="service-badge">{booking.service_type}</p>
              <div className="card-footer">
                <span className="customer-name">{booking.full_name}</span>
                <span className="booking-date">{new Date(booking.preferred_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))
      )}

      <style>{`
        .bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .booking-list-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .card-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .status-icon.success { color: var(--success); }
        .status-icon.pending { color: var(--accent); }
        .service-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.25rem;
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
        }
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          font-size: 0.8125rem;
          color: var(--text-muted);
        }
        .customer-name { font-weight: 500; color: white; }
        .empty-state { text-align: center; padding: 3rem; color: var(--text-muted); grid-column: 1/-1; }
        .loading { text-align: center; padding: 2rem; }
      `}</style>
    </div>
  )
}

export default BookingList
