import Vue from 'vue'
import Vuex from 'vuex';

import {mutations} from './mutations';
import {actions} from './actions';

Vue.use(Vuex);

const state = {
    scatter:null,
    scateos:null,
    selectedNetwork:{host:'', port:0},
};

const getters = {
    identity:state => state.scatter ? state.scatter.identity : null,
    account:state => state.scatter && state.scatter.identity ? state.scatter.identity.accounts[0] : null,
    network:state => ({
        blockchain:'eos',
        host:state.selectedNetwork.host,
        port:state.selectedNetwork.port
    })
};

export const store = new Vuex.Store({
    state,
    getters,
    mutations,
    actions
})