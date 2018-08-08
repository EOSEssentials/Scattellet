import VueInitializer from './vue/VueInitializer';
import {Routing} from './vue/Routing';
import * as Actions from './store/constants'
import ScatterJS from 'scatter-js/dist/scatter.esm';
import ViewBase from './views/Base.vue'

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
            ScatterJS.scatter.connect('Scattellet').then(connected => {
                if(!connected) return;
                store.dispatch(Actions.SET_SCATTER, ScatterJS.scatter);
                window.scatter = null;
            }).catch(err => {
                console.log('error', err);
            })
        });
    }

}

const popup = new App();
