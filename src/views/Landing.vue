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
            error:null
        }},

        computed: {
            ...mapState([
                'scatter',
                'scateos'
            ]),
            ...mapGetters([
                'identity',
                'account',
                'network'
            ])
        },
        mounted(){
            this.eos = Eos.Localnet({httpEndpoint:`http://${this.network.host}:${this.network.port}`});
            setInterval(() => this.getBalance(), 5000);
        },
        methods: {
            async identifyOrSend(){
                if(!this.identity) {
                    const requiredFields = {accounts: [this.network]};
                    await this.scatter.getIdentity(requiredFields);
                } else this.transfer();
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
                console.log('row', row);
                this.balance = row ? row.balance.split(" ")[0] : 0;
            },
            ...mapActions([
                Actions.SET_SCATEOS
            ])
        },
        watch:{
            identity(){
                if(this.identity) setTimeout(() => {
                    this.identified = true;
                    this.getBalance();
                }, 200);
                else this.identified = false;
            },
            symbol(){
                this.getBalance();
            }
        }

    }
</script>

<style lang="scss">

</style>