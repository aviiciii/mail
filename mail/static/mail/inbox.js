document.addEventListener('DOMContentLoaded', function() {

	// Use buttons to toggle between views
	document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
	document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
	document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
	document.querySelector('#compose').addEventListener('click', () => compose_email(-1));

	// By default, load the inbox
	load_mailbox('inbox');


	// INBOX
	// listen for clicked rows
	document.addEventListener('click', event => {

		// Find what was clicked on
		const element = event.target;

		// Check if the user clicked on a table row
		if (element.className === 'table-dark' || element.className==='table-light') {
			// print email id
			console.log(element.parentElement.dataset.id);
			// open email
			// read status 
			fetch('/emails/'+element.parentElement.dataset.id, {
				method: 'PUT',
				body: JSON.stringify({
					read: true
				})
			})
			view_email(element.parentElement.dataset.id);
		}
		
		// EMAIL
		// archive
		if (element.id==='archive'){
			// print email id
			console.log(element.dataset.email);

			// get email
			fetch('/emails/'+element.dataset.email)
			.then(response => response.json())
			.then(email => {
				console.log('archived: '+ email.archived)

				if (email.archived === false) {
					// archive
					fetch('/emails/'+email.id, {
						method: 'PUT',
						body: JSON.stringify({
							archived: true
						})
					})
					console.log('archived')
				}
				else{
					// unarchive
					fetch('/emails/'+email.id, {
						method: 'PUT',
						body: JSON.stringify({
							archived: false
						})
					})
					console.log('unarchived')
				}
			});
			// adding delay for changes to reflect
			delay(100).then(() => load_mailbox('inbox'));
			
		}
		
		// reply
		if (element.id==='reply'){
			// compose with pre-populated to, sub
			compose_email(element.dataset.email)
		}

		

	});

});




function compose_email(emailid) {

	console.log(emailid)

	// Show compose view and hide other views
	document.querySelector('#inbox-view').style.display = 'none';
	document.querySelector('#email-view').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'block';
	
	if (emailid === -1) {
		console.log('going into if');
		// Clear out composition fields
		document.querySelector('#compose-recipients').value = '';
		document.querySelector('#compose-subject').value = '';
		document.querySelector('#compose-body').value = '';
	} else {
		console.log('going into else'+ emailid);

		// Fetch email
		fetch('/emails/'+emailid)
		.then(response => response.json())
		.then(email => {
			// Print email
			console.log(email);
			
			// Pre-polulate
			// recipients
			document.querySelector('#compose-recipients').value = email.sender;
			
			
			// subject
			const search=email.subject.indexOf('Re: ')
			console.log(search)
			if (search === -1) {
				document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
			} else {
				document.querySelector('#compose-subject').value = email.subject;
			}

			// body
			const email_body = 'On ' + email.timestamp +', '+ email.sender+ ' wrote: \n' + email.body;
			document.querySelector('#compose-body').value =email_body;

			
		});
		


	}
	


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
	document.querySelector('#inbox-view').style.display = 'block';
	document.querySelector('#compose-view').style.display = 'none';
	document.querySelector('#email-view').style.display = 'none';


	// Show the mailbox name
	document.querySelector('#inbox-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
	
	document.querySelector('#inbox-view').append(document.createElement('br'))

	fetch('/emails/'+mailbox)
	.then(response => response.json())
	.then(emails => {
		// Print emails
		console.log(emails);

		// ... do something else with emails ...
		// emails not empty
		if (emails.length > 0) {
			const list = document.createElement('table');
			list.className= "table table-dark table-hover";
			list.id = "emails-table"
			document.querySelector('#inbox-view').append(list)

			// create table header
			const head = document.createElement('thead')
			head.className="table-dark"
			head.id = "emails-table-head"
			document.querySelector('#emails-table').append(head)
			// table header row
			const headrow = document.createElement('tr')
			headrow.id = "emails-table-head-row"
			document.querySelector('#emails-table-head').append(headrow)
			
			// table header columns
			const sender = document.createElement('th');
			const subject = document.createElement('th');
			const time = document.createElement('th');
			sender.scope = subject.scope=time.scope="col";

			if (mailbox==='sent') {
				sender.innerHTML='To';
			}
			else{
				sender.innerHTML = 'From';
			}
			subject.innerHTML = 'Subject';
			time.innerHTML = 'Time';
			document.querySelector('#emails-table-head-row').append(sender)
			document.querySelector('#emails-table-head-row').append(subject)
			document.querySelector('#emails-table-head-row').append(time)

			// table body
			const body = document.createElement('tbody')
			body.className="table-group-divider"
			body.id = "emails-table-body"
			document.querySelector('#emails-table').append(body)

			// iterate over emails - table rows
			for (let index = 0; index < emails.length; index++) {
				const mail = emails[index];

			

				// create row
				const row = document.createElement('tr');
				// check email read
				if (mail.read === true) {
					row.className = "table-dark clickable-row";
				} else {
					row.className = "table-light clickable-row";
				}
				row.dataset.id=mail.id;
				row.id='t'+index;
				document.querySelector('#emails-table-body').append(row)

				

				// create cells
				const sender = document.createElement('td');
				const subject = document.createElement('td');
				const time = document.createElement('td');

				// check email read
				if (mail.read === true) {
					sender.className= subject.className = time.className = "table-dark";
				} else {
					sender.className= subject.className = time.className = "table-light";
				}

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

function view_email(emailid){
	// Show email view and hide other views
	document.querySelector('#inbox-view').style.display = 'none';
	document.querySelector('#email-view').style.display = 'block';
	document.querySelector('#compose-view').style.display = 'none';

	// get email
	fetch('/emails/'+emailid)
	.then(response => response.json())
	.then(email => {
		// Print email
		console.log(email);
		

		// Fill email
		document.querySelector('#email-from').innerHTML= email.sender;
		document.querySelector('#email-recipients').innerHTML= email.recipients;
		document.querySelector('#email-subject').innerHTML= email.subject;
		document.querySelector('#email-body').innerHTML= email.body;
		document.querySelector('#email-time').innerHTML= email.timestamp;
		document.querySelector('#reply').dataset.email= emailid;
		if (email.archived === false) {
			document.querySelector('#archive').innerHTML= "Archive";
			
		} else {
			document.querySelector('#archive').innerHTML= "Unarchive";
		}
		document.querySelector('#archive').dataset.email= emailid;

		
		// check if sent mail

		if (email.sender === document.querySelector('#logged-in').dataset.useremail) {
			document.querySelector('#email-buttons').style.display = 'none';

		} else {
			document.querySelector('#email-buttons').style.display = 'block';
		}


	});
}


// Delay function
function delay(time) {
	return new Promise(resolve => setTimeout(resolve, time));
}
  
  

