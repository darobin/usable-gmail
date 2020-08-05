
export function post (endpoint, data, cb) {
  fetch(
      `/api/${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    )
    .then(res => res.json())
    .then(json => cb(null, json))
    .catch(cb)
  ;
}

export function get (endpoint, cb) {
  fetch(`/api/${endpoint}`)
    .then(res => res.json())
    .then(json => cb(null, json))
    .catch(cb)
  ;
}
