class ContentEditor {
	constructor() {
		this.popUp = $('[data-popup]');
		this.submit = this.popUp.find('[data-submit]');
		this.domains = [
		'netcombomulti',
		'netcomboplanos',
		'combomultinet',
		'netvirtuainternet',
		'netpacotes'
		];

		this.checkForDomain(this.domains, this.checkForAuth.bind(this));
	}


	checkForAuth(domain) {
		let encodedCredentials = localStorage.getItem('credentials');
		if(!encodedCredentials) {
			let credentials = this.getCredentials();
			localStorage.setItem('credentials', credentials);
			this.getContent(credentials, domain)
		}

		this.getContent(encodedCredentials, domain);
	}

	handleContent(response) {
		let components = JSON.parse(response);
		components = components.content;
		components = window.atob(components);
		components = JSON.parse(components);
		components = components.content;
		$('[data-login]').hide();
		$('[data-components-list]').show();

		for(let prop in components) {
			$('[data-components-list]').find('ul').append('<li>' + prop + '</li>')
		}
	}

	getContent(credentials, domain) {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', 'https://api.github.com/repos/escaleseo/content-' + domain + '/contents/_content/home.json', true);
		xhr.setRequestHeader('Authorization','Basic ' + credentials);
		xhr.onreadystatechange = (function(e) {
			if(xhr.readyState === 4) {
				this.handleContent(xhr.responseText);
			} else {
				console.log(xhr.statusText)
			}
		}).bind(this);
		xhr.send(null);
	}

	getCredentials() {
		let username = this.popUp.find('[data-user]').val();
		let password = this.popUp.find('[data-password]').val();

		let credentials = username + ':' + password;
		let encodedCredentials = window.btoa(credentials);
		return encodedCredentials;
	}

	checkForDomain(domains, callback) {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function(tabs) {
			var tabURL = tabs[0].url;
			domains.map(domain => {
				if(tabURL.includes(domain) && tabURL.includes('staging')) {
					callback(domain);
				}
			}, this)
		});
	}
}

var contentEditor = new ContentEditor(); 
