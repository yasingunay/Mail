document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector("#compose-form").onsubmit = () => {send_mail();
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

  
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        emails.forEach(email => {
            const email_card = document.createElement("div");
            email_card.classList.add("card", "mb-1", "unread-email");
            if (email.read == true){
                email_card.classList.add("read-email")
            }
            if (email.subject === ""){
                email.subject = "(No subject)";
            }
            email_card.innerHTML = `
            <div id="email-card" class="email-card">
            <div class="card-body">
            <div class="email-header">
                ${mailbox === 'inbox' ? `<h5 class="card-title"><span class="text-muted">From: </span> ${email.sender}</h5>` : `<h5 class="card-title"><span class="text-muted">To: </span>${email.recipients}</h5>`}
                <h5 class="card-title">${email.subject}</h5>
                <h6 class="card-title text-muted">${email.timestamp}</h6>
            </div>
                <p class="card-title text-muted">${email.body}</p>
              </div>
            </div>
            </div>
            `
            email_card.onclick = () => {
                view_email(email.id)};
            document.querySelector("#emails-view").appendChild(email_card);
        });
    });
  }





function send_mail(){
    let recipients = document.querySelector("#compose-recipients").value;
    let subject = document.querySelector("#compose-subject").value;
    let body = document.querySelector("#compose-body").value;
    fetch('/emails',{
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients,
            subject: subject,
            body: body
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        load_mailbox("sent");
    });

}


function view_email(email_id){
    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
        const email_card = document.createElement("div");
        email_card.classList.add("card");
        email_card.innerHTML = `
        <h2>${email.subject}</h2>
        <p>From: ${email.sender}</p>
        <p>To: ${email.recipient}</p>
        <p>Date: ${email.timestamp}</p>
        <p>${email.body}</p>
    `;
    const emailsView = document.querySelector("#emails-view");
    emailsView.innerHTML = '';
    emailsView.appendChild(email_card);

    });
}