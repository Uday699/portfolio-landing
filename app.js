// app.js - shared script for both pages
const pipedreamEnvMessage = ()=>{
  console.log("Make sure to set PIPEDREAM_URL env in your deployment or update /api/lead to forward.");
};

document.addEventListener('DOMContentLoaded', () => {
  pipedreamEnvMessage();

  // modal open buttons (fee modal)
  document.querySelectorAll('[data-open-fees]').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      const university = btn.getAttribute('data-univ'); // 'lpu' or 'amity'
      openFeeModal(university);
    });
  });

  // close modal handler
  document.addEventListener('click', e=>{
    if(e.target.matches('.modal-backdrop') || e.target.matches('[data-close-modal]')){
      const mb = document.querySelector('.modal-backdrop');
      if(mb) mb.remove();
    }
  });

  // attach forms
  document.querySelectorAll('.lead-form').forEach(form => {
    form.addEventListener('submit', async (ev)=>{
      ev.preventDefault();
      const msgEl = form.querySelector('.form-msg');
      msgEl.textContent = '';
      const data = {
        name: form.querySelector('[name="name"]').value.trim(),
        email: form.querySelector('[name="email"]').value.trim(),
        phone: form.querySelector('[name="phone"]').value.trim(),
        state: form.querySelector('[name="state"]').value,
        course: form.querySelector('[name="course"]').value,
        intake: form.querySelector('[name="intake"]').value,
        consent: form.querySelector('[name="consent"]').checked,
        university: form.getAttribute('data-univ')
      };

      // basic validation
      if(!data.name || !data.email || !data.phone || !data.course || !data.consent){
        msgEl.className = 'form-msg error';
        msgEl.textContent = 'Please complete all required fields and accept consent.';
        return;
      }
      if(!/^[6-9]\d{9}$/.test(data.phone)){
        msgEl.className = 'form-msg error';
        msgEl.textContent = 'Enter a valid 10-digit Indian phone number.';
        return;
      }

      msgEl.className = 'form-msg small';
      msgEl.textContent = 'Submitting...';

      try {
        const res = await fetch('/api/lead', {
          method:'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(data)
        });
        const json = await res.json();
        if(res.ok){
          msgEl.className = 'form-msg success';
          msgEl.textContent = 'Thanks! Your enquiry was submitted successfully.';
          form.reset();
        } else {
          throw new Error(json?.message || 'Submission failed');
        }
      } catch(err){
        msgEl.className = 'form-msg error';
        msgEl.textContent = 'Error submitting: '+err.message;
      }
    });
  });

});

// Fetch fee API and open modal
async function openFeeModal(university){
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  const modal = document.createElement('div');
  modal.className = 'modal card';
  modal.innerHTML = `<h3>Course-wise Fee Ranges (${university.toUpperCase()})</h3>
    <div id="fee-content">Loading...</div>
    <div style="margin-top:12px;text-align:right"><button data-close-modal class="btn">Close</button></div>`;
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  try {
    const res = await fetch(`/api/fees/${university}`);
    const feeJson = await res.json();
    const content = document.getElementById('fee-content');
    // build HTML
    if(feeJson && feeJson.courses){
      let html = '<ul style="padding-left:18px;margin:0">';
      for(const c of feeJson.courses){
        html += `<li><strong>${c.name}</strong>: ₹${c.fee_min.toLocaleString()} - ₹${c.fee_max.toLocaleString()} (${c.duration})</li>`;
      }
      html += '</ul>';
      content.innerHTML = html;
    } else {
      document.getElementById('fee-content').textContent = 'No data available.';
    }
  } catch(e){
    document.getElementById('fee-content').textContent = 'Failed to load fee data.';
  }
}
