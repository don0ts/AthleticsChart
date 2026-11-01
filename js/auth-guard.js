/* Auth guard — runs before anything else on every protected page.
   If the visitor hasn't signed in this session, bounce them to the login page.
   The landing page (index.html) redirects to the Charting page when signed in
   and to the login page when not. */
(function(){
  if (document.documentElement.hasAttribute('data-ath-public')) return;
  try{
    if (sessionStorage.getItem('ath_auth') === '1') return;
  }catch(e){}
  // not signed in -> go to login, remembering where we were headed (if any)
  var here = location.pathname.split('/').pop();
  var params = /^[a-zA-Z0-9_\-]+\.html$/.test(here) ? ('?next=' + encodeURIComponent(here)) : '';
  location.replace('login.html' + params);
})();

/* Expose a logout helper the nav “Log out” button can call. */
window.athLogout = function(){
  try{ sessionStorage.removeItem('ath_auth'); }catch(e){}
  location.replace('login.html');
};
