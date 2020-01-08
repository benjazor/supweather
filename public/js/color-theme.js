var checkbox = document.querySelector('input[name=theme]');

checkbox.addEventListener('change', function() {
    changeTheme(this.checked);
    themeRequest(this.checked);
});

let changeTheme = (theme) => {
    document.documentElement.classList.add('transition');
    document.documentElement.setAttribute('data-theme', (theme ? 'dark' : 'light'));
    window.setTimeout(() => {
        document.documentElement.classList.remove('transition');
    }, 1000)
};

function themeRequest(theme) {
    let data = {
        theme: theme
    };
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    fetch('/theme', options)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

function initTheme() {

    fetch('/theme', { method: 'GET' })
        .then(response => response.text())
        .then(result => {
            if (result == 'true') { // Enable dark theme
                document.documentElement.setAttribute('data-theme', 'dark');
                checkbox.checked = true;
            }
        })
        .catch(error => console.log('error', error));

};

window.onload = initTheme;