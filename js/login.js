/* Login against the "AthleticsLogin" Firestore collection.
   A doc in AthleticsLogin holds { user, password }. The first time the app is
   used the collection may be empty, so we seed it with the default account
   (user: KevinAs / password: KevinAs2000) and then validate against it. */
(function(){
  var firebaseConfig = {
    apiKey: "AIzaSyDzxseQexlbv0onZH2l5PHNDa5ZKFv5Kz8",
    authDomain: "cubsentry.web.app",
    projectId: "cubsentry",
    storageBucket: "cubsentry.firebasestorage.app",
    messagingSenderId: "929110932897",
    appId: "1:929110932897:web:1d91596a2787084a085fe0"
  };
  var LOGIN_COLLECTION = "AthleticsLogin";
  var DEFAULT_USER = "KevinAs";
  var DEFAULT_PASS = "KevinAs2000";

  var $ = function(id){ return document.getElementById(id); };
  function setStatus(txt, cls){ var s=$('status'); if(!s) return; s.textContent=txt; s.className='status'+(cls?(' '+cls):''); }
  function showErr(txt){ var e=$('err'); if(!e) return; e.textContent=txt||''; e.style.display=txt?'block':'none'; }

  var db=null;
  try{
    if(window.firebase && firebase.initializeApp){
      if(!firebase.apps || !firebase.apps.length) firebase.initializeApp(firebaseConfig);
      db=firebase.firestore();
    }
  }catch(e){ console.error('Firebase init failed (login)', e); }

  // Already signed in this session? Go straight in.
  try{ if(sessionStorage.getItem('ath_auth')==='1'){ go(); return; } }catch(e){}

  var creds=[]; // cached list of {user,password} from the DB

  function nextTarget(){
    var m=/[?&]next=([^&]+)/.exec(location.search||'');
    var t=m?decodeURIComponent(m[1]):'charting.html';
    if(!/^[a-zA-Z0-9_\-]+\.html$/.test(t)) t='charting.html';
    return t;
  }
  function go(){ location.replace(nextTarget()); }

  function loadCreds(){
    if(!db){ setStatus('Offline \u2014 using built-in account', 'warn'); creds=[{user:DEFAULT_USER,password:DEFAULT_PASS}]; return Promise.resolve(); }
    return db.collection(LOGIN_COLLECTION).get().then(function(snap){
      creds=[];
      snap.forEach(function(d){ var v=d.data()||{}; if(v.user!=null) creds.push({user:String(v.user),password:String(v.password==null?'':v.password)}); });
      if(!creds.length){
        // seed the default account so it lives in AthleticsLogin as requested
        creds=[{user:DEFAULT_USER,password:DEFAULT_PASS}];
        try{ db.collection(LOGIN_COLLECTION).doc(DEFAULT_USER).set({user:DEFAULT_USER,password:DEFAULT_PASS}); }catch(e){}
      }
      setStatus('Connected', 'ok');
    }).catch(function(e){
      console.warn('AthleticsLogin read failed; using built-in account', e);
      creds=[{user:DEFAULT_USER,password:DEFAULT_PASS}];
      setStatus('Connection issue \u2014 using built-in account', 'warn');
    });
  }

  var ready=loadCreds();

  function attempt(){
    showErr('');
    var u=($('user').value||'').trim();
    var p=($('pass').value||'');
    if(!u || !p){ showErr('Enter your user and password.'); return; }
    $('signin').disabled=true; setStatus('Checking\u2026');
    ready.then(function(){
      var ok=creds.some(function(c){ return c.user===u && c.password===p; });
      if(ok){
        try{ sessionStorage.setItem('ath_auth','1'); }catch(e){}
        go();
      }else{
        $('signin').disabled=false; setStatus('Connected','ok');
        showErr('Incorrect user or password.');
      }
    });
  }

  $('signin').addEventListener('click', attempt);
  $('pass').addEventListener('keydown', function(e){ if(e.key==='Enter') attempt(); });
  $('user').addEventListener('keydown', function(e){ if(e.key==='Enter') $('pass').focus(); });
})();
