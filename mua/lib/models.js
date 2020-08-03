/* eslint eqeqeq: 0, no-self-compare: 0 */
// XXX: this is copied from anti on 2020-08-03

let registry = {}
  , subscriberQueue = []
;

export function registerStore (name, store) {
  if (registry[name]) throw new Error(`Store "${name}" already registered.`);
  registry[name] = store;
}

export function getStore (name) {
  if (!registry[name]) throw new Error(`Store "${name}" not found.`);
  return registry[name];
}

export function getStoreName (store) {
  return Object.keys(registry).find(n => registry[n] === store);
}

// Creates a store that can fetch from HTTP.
// The value this store captures is from an HTTP result. It is structured thus:
//  - state:
//  - error: error message, if any
//  - errorCode: error code, if any
//  - value: the value returned
// This API expects the server to send back some JSON, with the following structure:
//  - ok: true | false
//  - error and errorCode: as above
//  - data: the value
export function fetchable (url, value = {}) {
  if (!value.state) value.state = 'unknown';
  let load = (set) => {
        let xhr = new XMLHttpRequest();
        xhr.addEventListener('load', () => {
          try {
            let { ok, error, errorCode, data } = xhr.responseText
              ? JSON.parse(xhr.responseText)
              : {}
            ;
            if (xhr.status < 400) return set({ state: ok ? 'loaded' : 'error', error, errorCode, data });
            return set({ state: 'error', error: error || xhr.statusText, errorCode: errorCode || xhr.status });
          }
          catch (err) {
            return set({ state: 'error', error: err.message || err.toString(), errorCode: 'exception' });
          }
        });
        xhr.addEventListener('error', () => {
          set({ state: 'error', error: 'Network-level error', errorCode: 'network' });
        });
        xhr.addEventListener('progress', (evt) => {
          let { lengthComputable, loaded, total } = evt;
          set({ state: 'loading', lengthComputable, loaded, total });
        });
        xhr.open('GET', url);
        set({ state: 'loading', lengthComputable: false, loaded: 0, total: 0 });
        xhr.send();
        // this will only actually stop anyting if it's really long
        return () => xhr.abort();
      }
    , { subscribe, set } = writable(value, load)
    , reload = () => {
        set({ state: 'unknown' });
        return load(set);
      }
  ;
  return { subscribe, reload };
}

// --- What follows is largely taken from Svelte (https://svelte.dev/docs#readable). Thanks Rich!

// Creates a read-only store.
//  - `value` is the initial value, which may be null/undefined.
//  - `start` is a function that gets called when the first subscriber subscribes. It receives a
//    `set` function which should be called with the new value whenever it is updated. It must also
//    return a `stop` function that will get called when the last subscriber unsubscribes.
// Returns an object with .subscribe(cb) exposed as an API, where `cb` will received the value when
// it changes. This method returns a function to call to unsubscribe.
export function readable (value, start) {
  return { subscribe: writable(value, start).subscribe };
}

// Creates a regular read/write store.
// The parameters are the same as for `readable` except that `start` is optional because you can
// write to the value through the API.
// It returns an object with:
//  - .subscribe(cb), which is the same as for readable()
//  - .set(val) which sets the store's value directly
//  - .update(updater) which gets a function that receives the value and returns it updated
export function writable (value, start = () => {}) {
  let stop
    , subs = []
    , set = (newValue) => {
        if (safeNotEqual(value, newValue)) {
          value = newValue;
          if (stop) { // store is ready
            let runQueue = !subscriberQueue.length;
            subs.forEach(s => {
              s[1]();
              subscriberQueue.push(s, value);
            });
            if (runQueue) {
              for (let i = 0; i < subscriberQueue.length; i += 2) {
                subscriberQueue[i][0](subscriberQueue[i + 1]);
              }
              subscriberQueue.length = 0;
            }
          }
        }
      }
    , update = (fn) => set(fn(value))
    , subscribe = (run, invalidate = () => {}) => {
        let subscriber = [run, invalidate];
        subs.push(subscriber);
        if (subs.length === 1) stop = start(set) || (() => {});
        run(value);
        return () => {
          let index = subs.indexOf(subscriber);
          if (index !== -1) subs.splice(index, 1);
          if (subs.length === 0) {
            stop();
            stop = null;
          }
        };
      }
  ;
  return { set, update, subscribe };
}

// Reads a store once
export function get (store) {
  if (!store) return;
  let value;
  store.subscribe(v => value = v)();
  return value;
}

// Equality function stolen from Svelte
function safeNotEqual (a, b) {
  return a != a ? b == b : a !== b ||
    (
      (a && typeof a === 'object') ||
      typeof a === 'function'
    );
}
