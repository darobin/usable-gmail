

// --- State Management
let state = {
  usableMode: false,
};

// --- Basic UI
function setupUI () {
  console.log(`SETUP UI`);
  let uToggle = document.createElement('div');
  uToggle.id = 'usable-toggle';
  let but = document.createElement('button');
  but.textContent = 'u.';
  but.onclick = toggleUsableMode;
  uToggle.appendChild(but);
  document.body.appendChild(uToggle);
}

function toggleUsableMode () {

}

// --- Meta Extension Management
function reloadExtension () {
  // XXX:
  //  - message background to call chrome.runtime.reload(); (with management permission)
  //  - go through CSS and refresh all relevant ones (how?)
  //  - call methods here that wipe state and reload this script
  // OR MAYBE
  //  - this here script does nothing but call chrome.runtime.getURL() to get URLs for the real
  //    script and CSS, and loads _them_, or reloads them TRY THIS
}


// --- All Global Events
setupUI(); // just load
document.addEventListener('keydown', (evt) => {
  let { keyCode, ctrlKey, altKey } = evt
    , action
  ;
  // console.log(keyCode, ctrlKey, altKey);
  // ctrl-alt-R: reload
  if (keyCode === 82 && ctrlKey && altKey) action = reloadExtension;
  if (action) {
    evt.preventDefault();
    action();
  }
});
