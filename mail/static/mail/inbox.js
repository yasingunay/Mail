document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector("#compose-form").onsubmit = () => {send_email();
    // Stop form from submitting
    return false;
  };

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (mailbox === 'sent') {
    fetch('/emails/sent')
      .then(response => response.json())
      .then(emails => {
        // Clear the current content in #emails-view
        document.querySelector('#emails-view').innerHTML = '';
  
        emails.forEach(email => {
          const emailCard = document.createElement('div');
          emailCard.classList.add('card', 'mb-1');
          
          // Check if the email is read or unread and add appropriate styling
          if (email.read) {
            emailCard.classList.add('read-email');
          } else {
            emailCard.classList.add('unread-email');
          }

           // Split the email body into sentences and display the first sentence
           const bodySentences = email.body.split('.'); // Assuming sentences end with a period.
           const firstSentence = bodySentences[0] || ''; // Get the first sentence or an empty string if no sentences found.

        // Check if email subject is null and set it to "(No Subject)" if it is
        if (email.subject === null || email.subject === ''){
            email.subject = "(No Subject)";
        };
  
          emailCard.innerHTML = `
            <div class="card-body">
              <div class="email-header">
              <h5 class="card-title">To: ${email.recipients}</h5>
                <h5 class="card-title">${email.subject}</h5>
                <p class="card-text text-muted">${firstSentence}</p>
                <h6 class="card-title text-muted">${email.timestamp}</h6>
              </div>
            </div>
          `;
  
          // Add click event to view the email details
          emailCard.addEventListener('click', () => {
            viewEmail(email.id);
          });
  
          document.querySelector('#emails-view').appendChild(emailCard);
        });
      });
  }
  
}



function send_email() {
    let recipients = document.querySelector("#compose-recipients").value;
    let subject = document.querySelector("#compose-subject").value;
    let body = document.querySelector("#compose-body").value;

    fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
        })
     })
    .then(response => response.json())
    .then(result => {
    // Print result
    console.log(result);
    load_mailbox('sent')
    });
}



