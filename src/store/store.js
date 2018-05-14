import Vue from 'vue'
import Vuex from 'vuex';

import {mutations} from './mutations';
import {actions} from './actions';

Vue.use(Vuex);

const state = {
    scatter:null,
    scateos:null,
};

const getters = {
    identity:state => state.scatter ? state.scatter.identity : null,
    account:state => state.scatter && state.scatter.identity ? state.scatter.identity.accounts[0] : null,
    network:state => ({
        blockchain:'eos',
        host:process.env.NETWORK_HOST,
        port:process.env.NETWORK_PORT
    })
};

export const store = new Vuex.Store({
    state,
    getters,
    mutations,
    actions
})