class ContentEditor {
	constructor() {
		this.popUp = $('[data-box]');
		this.form = this.popUp.find('[data-login]');
		this.menu = this.popUp.find('[data-menu-list]');
		this.component = this.popUp.find('[data-component]');
		this.domains = [
		'netcombomulti',
		'netcomboplanos',
		'combomultinet',
		'netvirtuainternet',
		'netpacotes'
		];

		this.eventListeners();
		this.getPageUrl();
	}

	eventListeners() {
		this.form.on('submit', $.proxy(this, 'getCredentials'));
		this.popUp.on('url.ready', $.proxy(this, 'checkForAvailableState'));
		this.popUp.on('url.ready', $.proxy(this, 'getPageInfo'));
		this.menu.find('[data-menu-list-components]').on('click', $.proxy(this, 'showComponentsList'));
		/* not working */
		this.component.on('click', $.proxy(this, 'getComponentJSON'));

	}

	showComponentsList() {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', 'https://api.github.com/repos/escaleseo/content-' + this.domain + '/contents/_content/' + this.filename + '.json', true);
		xhr.setRequestHeader('Authorization','Basic ' + localStorage.getItem('credentials'));
		xhr.onreadystatechange = (function(e) {
			if(xhr.readyState !== 4) return;
			this.handleJsonContent(xhr.responseText);
		}).bind(this);
		xhr.send(null);
	}

	getComponentJSON(event) {
		console.log(event);
		console.log(this.pageContent[componentName]);
	}

	handleJsonContent(pageContent) {
		pageContent = JSON.parse(pageContent);
		pageContent = pageContent.content;
		pageContent = window.atob(pageContent);
		pageContent = JSON.parse(pageContent)
		this.pageContent = pageContent.content;
		for (let prop in pageContent.content) {
			this.popUp.find('[data-components-list]').append('<li data-component="' + prop + '">' + prop + '</li>');
			this.popUp.find('[data-components-list]').show();
		}
	}

	checkForAvailableState() {
		let isLogged = this.checkForLogin();
		let isUrlAvailable = this.checkForUrl();

		if(!isLogged) {
			this.handleSections('data-login');
			return;
		};
		if(!isUrlAvailable) {
			this.popUp.find('[data-title]').html('This site is not available');
			return;
		}

		this.handleSections('data-menu');
	}

	checkForUrl() {
		let valid = []

		this.domains.map(domain => {
			if(!this.url.includes(domain) || !this.url.includes('staging')) {
				valid.push(false);
				return;
			}
			this.domain = domain;
			valid.push(true);
		}, this);

		if(valid.indexOf(!false) === -1) return false;

		return true;
	}

	checkForLogin() {
		let encodedCredentials = localStorage.getItem('credentials');
		if(!encodedCredentials) {
			return false;
		}

		return true;
	}

	getCredentials(e) {
		let xhr = new XMLHttpRequest();

		e.preventDefault();

		let username = this.form.find('[data-user]').val()	;
		let password = this.form.find('[data-password]').val();

		this.credentials = username + ':' + password;
		let encodedCredentials = window.btoa(this.credentials);

		xhr.open('GET', 'https://api.github.com/users/' + username, true);
		xhr.setRequestHeader('Authorization','Basic ' + encodedCredentials);
		xhr.onreadystatechange = (function(e) {
			if(xhr.readyState !== 4) {
				this.popUp.find('[data-title]').html('Invalid Username/Password');
				return;
			}
			let response = JSON.parse(xhr.responseText);
			this.popUp.find('[data-menu-title]').html('Olá, ' + response.name);
			localStorage.setItem('credentials', encodedCredentials);
			this.popUp.find('[data-title]').hide();
			this.handleSections('data-menu');
			this.popUp.trigger('menu.ready');

		}).bind(this);
		xhr.send(null);

	}

	getPageInfo() {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', this.url, true);
		xhr.onreadystatechange = (function(e) {
			if(xhr.readyState !== 4) return;
			this.handleContent(xhr.responseText);
		}).bind(this);
		xhr.send(null);

	}

	handleContent(pageContent) {
		let parser = new DOMParser();
		pageContent = parser.parseFromString(pageContent, 'text/html');

		this.filename = $(pageContent).find('body').attr('data-filename');
		let template = $(pageContent).find('body').attr('data-template');

		this.popUp.find('[data-template]').html(template);
	}

	handleSections(section) {
		$('[data-section]').hide();
		$('['+ section +']').show();
	}

	getPageUrl() {
		let url = [];
		let queryInfo = {
			active: true,
			currentWindow: true
		}

		chrome.tabs.query(queryInfo, tabs => {
			url[0] = tabs[0].url;
			this.url = url[0];
			this.popUp.trigger('url.ready');
		});
	}
}

var contentEditor = new ContentEditor(); 
