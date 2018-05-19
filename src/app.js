import VueInitializer from './vue/VueInitializer';
import {Routing} from './vue/Routing';
import * as Actions from './store/constants'
import {RouteNames} from './vue/Routing'

import ViewBase from './views/Base.vue'

import Eos from 'eosjs'

class App {

    constructor(){
        const routes = Routing.routes();
        const components = [
            {tag:'view-base', vue:ViewBase},
        ];

        const middleware = (to, next, store) => {
            next();
        };

        new VueInitializer(routes, components, middleware, (router, store) => {
            store.dispatch(Actions.SET_NETWORK, `http://${process.env.NETWORK_HOST}:${process.env.NETWORK_PORT}`);

            document.addEventListener('scatterLoaded', () => {

                window.scatter.requireVersion(4.0);
                store.dispatch(Actions.SET_SCATTER, window.scatter);
                store.dispatch(Actions.SET_SCATEOS, window.scatter.eos(store.getters.network, Eos.Localnet));
                window.scatter = null;
            })
        });
    }

}

const popup = new App();
