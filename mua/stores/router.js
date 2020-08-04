
import createRouter from 'router5';
import browserPlugin from 'router5-plugin-browser';
import { registerStore, readable } from '../lib/models';

let router = createRouter([
  { name: 'home', path: '/', forwardTo: 'mailbox' },
  { name: 'mailbox', path: '/mbx/:id', defaultParams: { id: 'INBOX' } },
]);
router.usePlugin(
  browserPlugin({ useHash: true })
);
router.start();

let routerStore = readable(
      router.getState(),
      (set) => {
        router.subscribe((change) => {
          console.log(`router change`, change);
        });
        return () => router.unsubscribe();
      }
    )
;
routerStore.go = (nav) => {
  router.navigate(nav);
};
registerStore('router', routerStore);
