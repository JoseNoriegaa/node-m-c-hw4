let isLoading = false;

const loginHandler = async (e) => {
  try {
    if (!isLoading && errorHandler()) {
      const spinner = document.getElementById('spinner');
      const btn = document.getElementById('loginBtn');
      // username field
      const username = document.getElementById("usernameInput").value;
      // password field
      const password =  document.getElementById("passwordInput").value;
      btn.disabled = true;
      spinner.className += ' active';
      isLoading = true;

      const response = await app.login(username, password);
      if (response) {
        console.log('Loggedin');
      } else {
        console.log('something went wrong');
      }
      spinner.className = spinner.className.replace(/ active/g, '');
      isLoading = false;
      btn.disabled = false;
    }
  } catch (error) {
    console.error({error});
  }
}

const errorHandler = (err) => {
  // username field
  const username = document.getElementById("usernameInput").value;
  const usernameError = document.getElementById("usernameError");
  // password field
  const password =  document.getElementById("passwordInput").value;
  const passwordError = document.getElementById("passwordError");
  // Reset errors
  usernameError.style = 'display:none';
  usernameError.innerText = '';

  passwordError.style = 'display:none';
  passwordError.innerText = '';

  if (!username.trim()) {
    usernameError.style = 'display: block';
    usernameError.innerText = 'Required Field';
    return false;
  }

  if (!password.trim()) {
    passwordError.style = 'display: block';
    passwordError.innerText = 'Required Field';
    return false;
  }
  return true;
};
// Check up if the user is already autenticated
setInterval(() => {
  if (app.state.auth.id) {
    window.location = '/';
  }
}, 200);
