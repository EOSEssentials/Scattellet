<template>
    <section>
        <figure class="background" :class="{'full':identified}"></figure>



        <figure class="power-out" @click="logout" :class="{'show':identified}">
            <i class="fa fa-power-off"></i>
        </figure>
        <figure class="doodad" :class="{'gone':!identified}">
            <img src="assets/doodad.png"/>
        </figure>
        <section class="error" :class="{'show':error}">{{error}}</section>
        <figure class="logo top" :class="{'gone':!identified}">Scattellet</figure>
        <section class="container">
            <figure class="logo" :class="{'gone':identified}">Scattellet</figure>
            <section class="network" :class="{'hidden':identified}">
                <section class="input-container">
                    <label>Chain</label>
                    <input placeholder="Domain or IP" v-model="selectedNetworkString" />
                </section>
            </section>
            <section>
                <section class="input-containers" :class="{'open':identified}">
                    <section class="input-container">
                        <input placeholder="Recipient" v-model="recipient" />
                    </section>
                    <section class="input-container">
                        <input placeholder="SYM" v-model="symbol" class="symbol" />
                        <input placeholder="Amount" class="amount" v-model="amount" />
                    </section>
                </section>
                <button class="animated" :disabled="transferring" @click="identifyOrSend" :class="{'send':identified, 'tada':transferred}">{{identified ? 'SEND' : 'ID'}}</button>
            </section>
        </section>
        <section class="trx" :class="{'show':this.identified && trx.length}">Last Transaction ID: {{trx}}</section>
        <section :class="{'show':this.identified && this.symbol.length}" class="balance">You have <b>[ {{balance}} {{symbol}} ]</b> tokens</section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames} from '../vue/Routing'

    import Eos from 'eosjs';

    let networkTimeout = null;
    export default {
        data(){ return {
            identified:false,
            recipient:'',
            symbol:'EOS',
            amount:'',
            balance:'0',
            eos:null,
            transferring:false,
            transferred:false,
            trx:'',
            error:null,
            selectingNetwork:false,
            selectedNetworkString:''
        }},

        computed: {
            ...mapState([
                'scatter',
                'scateos',
                'selectedNetwork'
            ]),
            ...mapGetters([
                'identity',
                'account',
                'network'
            ])
        },
        mounted(){
            setInterval(() => this.getBalance(), 5000);
        },
        methods: {
            async identifyOrSend(){
                if(!this.identity) {
                    const requiredFields = {accounts: [this.network]};
                    await this.scatter.getIdentity(requiredFields);
                } else this.transfer();
            },
            toggleSelectingNetwork(){
                this.selectingNetwork = !this.selectingNetwork;
            },
            async logout(){
                await this.scatter.forgetIdentity();
            },
            async transfer(){
                this.error = null;
                if(this.transferring) return;
                if(!this.recipient.length) return this.error = 'No Recipient';
                if(!this.amount.length || parseFloat(this.amount) <= 0) return this.error = 'Amount must be greater than 0';
                this.transferring = true;
                this.transferred = false;
                const contract = await this.scateos.contract('eosio.token');
                const transferred = await contract.transfer(this.account.name, this.recipient, `${this.amount} ${this.symbol}`, '').catch(error => {
                    if(typeof error === 'object') this.error = error.message;
                    else this.error = JSON.parse(error).error.details[0].message.replace('condition: assertion failed: ', '');
                    if(this.error.trim() === 'unknown key:') this.error = 'No such account';
                    return null;
                });
                this.transferring = false;
                if(transferred) {
                    this.transferred = true;
                    this.trx = transferred.transaction_id;
                    this.getBalance();
                    this.amount = '';
                }

                setTimeout(() => {
                    this.transferred = false;
                }, 1000);
            },
            test(){
                this.identified = !this.identified;
            },
            async getBalance(){
                if(!this.account || !this.symbol.length || !this.eos) {
                    this.balance = '0';
                    return false;
                }
                const balances = await this.eos.getTableRows({
                    json:true,
                    code:'eosio.token',
                    scope:this.account.name,
                    table:'accounts',
                    limit:500
                });
                const row = balances.rows.find(row => row.balance.split(" ")[1].toLowerCase() === this.symbol.toLowerCase());
                this.balance = row ? row.balance.split(" ")[0] : 0;
            },
            ...mapActions([
                Actions.SET_SCATEOS,
                Actions.SET_NETWORK,
            ])
        },
        watch:{
            identity(){
                if(this.identity) setTimeout(() => {
                    if(!this.selectedNetworkString){
                        this.logout();
                        return false;
                    }
                    this.identified = true;
                    this.getBalance();
                }, 200);
                else this.identified = false;
            },
            symbol(){
                this.getBalance();
            },
            network(){
                if(this.selectedNetwork.host.length) {
                    const httpEndpoint = `http://${this.selectedNetwork.host}:${this.selectedNetwork.port}`;
                    this.selectedNetworkString = httpEndpoint;
                    this.eos = Eos({httpEndpoint});
                }
            },
            selectedNetworkString(){
                clearTimeout(networkTimeout);
                networkTimeout = setTimeout(async () => {
                    this[Actions.SET_NETWORK](this.selectedNetworkString);
                    const chainId = await Eos({httpEndpoint:this.selectedNetworkString}).getInfo({}).then(x => x.chain_id).catch(() => null);
                    if(!chainId) return;
                    this[Actions.SET_SCATEOS](this.scatter.eos(this.network, Eos, {chainId}));
                }, 2000);
            }
        }

    }

</script>

<style lang="scss">
    .screen {
        position: relative;
        left:0;
        transition: all 0.5s ease;
        transition-property: left;

        &.out-right {
            left:100%;
        }
    }

    .network {
        position: relative;
        z-index:2;
        opacity:1;
        visibility: visible;
        transition: all 0.2s ease;
        transition-property: opacity, visibility;

        &.hidden {
            opacity:0;
            visibility: hidden;
        }

        .input-container {
            overflow: hidden;
            margin-bottom:20px;

            label {
                border-top-left-radius: 50px;
                border-bottom-left-radius: 50px;
                width:60px;
                text-align:center;
                height:28px;
                line-height:29px;
                font-size:11px;
                float:left;
                text-transform: uppercase;
                font-weight:800;
                background:rgba(255,255,255,0.3);
                color:#fff;
                text-shadow: 0 1px 2px rgba(0,0,0,0.2);
            }

            input {
                padding:0 10px;
                height:28px;
                line-height:26px;
                font-size:13px;
                float:left;
                border-top-left-radius: 0;
                border-bottom-left-radius: 0;
                width:250px;
                margin-bottom:10px;
                font-family: 'Open Sans', sans-serif;
                background:rgba(255,255,255,0.2);
                color:#fff;
                text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            }
        }
    }
</style>