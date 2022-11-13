document.addEventListener('DOMContentLoaded', function() {

	// Use buttons to toggle between views
	document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
	document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
	document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
	document.querySelector('#compose').addEventListener('click', compose_email);

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


	// Get fields
	document.querySelector('form').onsubmit = function() {
		const recipients = document.querySelector('#compose-recipients').value;
		const subject = document.querySelector('#compose-subject').value;
		const body = document.querySelector('#compose-body').value;
		
		// Send email
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
		});
	}

	
  

}

function load_mailbox(mailbox) {
  
	// Show the mailbox and hide other views
	document.querySelector('#emails-view').style.display = 'block';
	document.querySelector('#compose-view').style.display = 'none';

	// Show the mailbox name
	document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

	fetch('/emails/inbox')
	.then(response => response.json())
	.then(emails => {
		// Print emails
		console.log(emails);

		// ... do something else with emails ...
		// emails not empty
		if (emails.length > 0) {
			const list = document.createElement('table');
			list.className= "table table-dark table-striped table-hover";
			list.id = "emails-table"
			document.querySelector('#emails-view').append(list)
			// iterate over emails
			for (let index = 0; index < emails.length; index++) {
				const mail = emails[index];
				// create row
				const row = document.createElement('tr');
				row.className = "table-dark";
				row.id='t'+index;
				document.querySelector('#emails-table').append(row)

				// create cells
				const sender = document.createElement('td');
				const subject = document.createElement('td');
				const time = document.createElement('td');

				sender.className= subject.className = time.className = "table-dark";

				sender.innerHTML = mail.sender;
				subject.innerHTML = mail.subject;
				time.innerHTML = mail.timestamp;

				// append cells
				document.querySelector('#t'+index).append(sender)
				document.querySelector('#t'+index).append(subject)
				document.querySelector('#t'+index).append(time)

			}
			
		}
	});

}