document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const bookingForm = document.getElementById('booking-form');
    const bookingsTableBody = document.getElementById('bookings-body');
    const noDataMessage = document.getElementById('no-data');

    // Tab Switching Logic
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            
            // Update buttons
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update sections
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${target}-section`) {
                    content.classList.add('active');
                }
            });

            if (target === 'list') {
                loadBookings();
            }
        });
    });

    // Form Submission Logic
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submit-btn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Processing...</span>';

        const formData = {
            full_name: document.getElementById('full_name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            vehicle_model: document.getElementById('vehicle_model').value,
            service_type: document.getElementById('service_type').value,
            preferred_date: document.getElementById('preferred_date').value
        };

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Success! Your booking has been confirmed.');
                bookingForm.reset();
                // Switch to list tab
                document.querySelector('[data-tab="list"]').click();
            } else {
                throw new Error('Failed to save booking');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    // Load Bookings Logic
    async function loadBookings() {
        try {
            const response = await fetch('/api/bookings');
            const data = await response.json();

            bookingsTableBody.innerHTML = '';
            
            if (data.length === 0) {
                noDataMessage.classList.remove('hidden');
                return;
            }

            noDataMessage.classList.add('hidden');
            data.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));

            data.forEach(booking => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div style="font-weight: 600">${booking.full_name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted)">${booking.email}</div>
                    </td>
                    <td>${booking.vehicle_model}</td>
                    <td>${booking.service_type}</td>
                    <td>${new Date(booking.preferred_date).toLocaleDateString()}</td>
                    <td><span class="status-badge">Confirmed</span></td>
                `;
                bookingsTableBody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error loading bookings:', error);
            bookingsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #ef4444;">Failed to load data.</td></tr>';
        }
    }

    // Initial load
    if (document.querySelector('.nav-btn.active').dataset.tab === 'list') {
        loadBookings();
    }
});
