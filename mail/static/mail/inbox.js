let showUnreadOnly = false; // A variable to track whether to show only unread emails

document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());
  document.querySelector("#compose-form").onsubmit = () => {send_mail();
    // Stop form from submitting
    return false;
  };
  // Event listener for the "Filter Unread Emails" button
    document.querySelector('#unread').addEventListener('click', () => {
    showUnreadOnly = true; // Set the variable to true when the button is clicked
    load_mailbox('inbox'); // Reload the inbox with the updated criteria
});

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(senderEmail ='') {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

   // Autofill the "To" field with the sender's email address (if reply button clicked)
    document.querySelector('#compose-recipients').value = senderEmail;


  document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function message(elementSelector, sentence){
    const message_container = document.createElement("div");
        message_container.innerHTML = sentence;
        if (sentence.startsWith("User")){
            message_container.style.color = "red";
        }
        else{
            message_container.style.color = "blue";
        }
        document.querySelector(elementSelector).appendChild(message_container);
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
        if(showUnreadOnly){
            // Filter unread emails if the button was clicked
            emails = emails.filter(email => !email.read);
        }
        if (mailbox === "inbox"){
            showUnreadOnly =false;
        }
        emails.forEach(email => {
            const email_card = document.createElement("div");
            email_card.classList.add("card");
            if (email.read){
                email_card.classList.add("read-email");
            }
            if (email.subject === ""){
                email.subject = "(No subject)";
            }

             // Get the first 50 characters of the email body
             const truncatedBody = email.body.substring(0, 50);

            email_card.innerHTML = `
            <div class ="card-body">
            <div class ="email-header">
            ${mailbox === 'inbox' ? `<h5 class="card-title"><span class="text-muted"></span> ${email.sender}</h5>` : `<h5 class="card-title"><span class="text-muted"></span>${email.recipients}</h5>`}
            <h5 class="card-title">${email.subject}</h5>
            <h6 class="card-title">${email.timestamp}</h6>
            </div>
                <p text-muted">${truncatedBody}</p>
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
        if ("message" in result) {
          load_mailbox('sent');
          message("#emails-view",result["message"]);
        } else {
            message("#compose-view",result["error"]);
        }
        

      });

}




function archiveEmail(email_id, email) {
    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !email.archived // Toggle the archived status
        })
    }).then(() => {
        email.archived = !email.archived; // Update the archived status
        load_mailbox('inbox');
    });
}


function markUnread(email_id, email) {
    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: false,
            archived: false
        })
    }).then(() => {
        load_mailbox('inbox');
    });
}



function view_email(email_id){
    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
        // Check if the email is not already marked as read
        if (!email.read) {
            // Make a PUT request to mark the email as read
            fetch(`/emails/${email_id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    read: true
                })
            })
            .then(response => {
                    email.read = true;
                
            })
            .catch(error => {
                console.error('Error marking email as read:', error);
            });
        }
        const email_card = document.createElement("div");
        email_card.classList.add("card_view");
        if (email.subject === ""){
            email.subject = "(No subject)";
        }
        email_card.innerHTML = `
        <div id=email-container>
                <div class="email-header">
                    <h2 class="email-subject">${email.subject}</h2>
                    <div class="email-details">
                        <p class="email-sender">From: ${email.sender}</p>
                        <p class="email-recipient">To: ${email.recipients}</p>
                        <p class="email-timestamp">Date: ${email.timestamp}</p>
                    </div>
                </div>
                <div id="email-body" class="email-body">${email.body}</div>
                <hr> <!-- Add a horizontal line after the email body -->
                </div>
            `;

    const emailsView = document.querySelector("#emails-view");
    emailsView.innerHTML = '';
    emailsView.appendChild(email_card);

    // Create a 'Reply' button
    const reply = document.createElement("button");
    reply.classList.add("btn" ,"btn-sm" ,"btn-outline-primary");
    reply.innerHTML = "Reply";
    reply.style.marginLeft = '5px'; 

   
   


    reply.addEventListener('click', function(){
        compose_email(email.sender);
        let splitDate = email.timestamp.split(",");
        document.querySelector("#compose-body").value = `\n\n\t -----\tOn ${splitDate[0]} at${splitDate[1]} ${email.sender} wrote:\t  -----\n\n ${email.body}`;
        if (email.subject.startsWith("Re: ")) {
            document.querySelector("#compose-subject").value = email.subject;
          } else {
            document.querySelector("#compose-subject").value = `Re: ${email.subject}`;
          };
        document.querySelector("#compose-body").focus();
        document.querySelector("#compose-body").setSelectionRange(0,0);
        
    })
    document.querySelector("#email-container").append(reply);

    // Create an 'Archive/Unarchive' button
    const archive = document.createElement('button');
    archive.classList.add("btn" ,"btn-sm" ,"btn-outline-primary");
    archive.innerHTML = email.archived ? 'Unarchive' : 'Archive';
    archive.style.marginLeft = '5px'; 
    archive.addEventListener('click', function(){
        archiveEmail(email_id, email);
        archive.innerHTML = email.archived ? 'Unarchive' : 'Archive'; // Update the button text
          });
    document.querySelector("#email-container").append(archive);


    // Create a 'Marks as unread' button
    const mark_unread = document.createElement('button');
    mark_unread.classList.add("btn" ,"btn-sm" ,"btn-outline-primary");
    mark_unread.innerHTML = 'Mark as unread';

    mark_unread.style.marginLeft = '5px'; 
    mark_unread.addEventListener('click', function(){
        markUnread(email_id, email);
          });
    document.querySelector("#email-container").append(mark_unread);


    });

    
}


