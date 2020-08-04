
export default function errorCatcher (set, def) {
  return (err) => {
    console.error(err);
    set(def);
  };
}
