/* Auth guard — runs before anything else on every protected page.
   If the visitor hasn't signed in this session, bounce them to the login page. */
(function(){
  try{
    if (sessionStorage.getItem('ath_auth') === '1') return;
  }catch(e){}
  // not signed in -> go to login, remembering where we were headed
  var here = location.pathname.split('/').pop() || 'charting.html';
  location.replace('login.html?next=' + encodeURIComponent(here));
})();

/* Expose a logout helper the nav “Log out” button can call. */
window.athLogout = function(){
  try{ sessionStorage.removeItem('ath_auth'); }catch(e){}
  location.replace('login.html');
};
